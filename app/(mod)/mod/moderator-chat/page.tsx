"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Users } from "lucide-react";
import { 
  getMessagesBetweenUsers, 
  sendMessage, 
  getUserChatSessions,
  getAllUsers
} from "@/controllers/ChatController";
import { subscribeToMessages } from "@/lib/client/appwrite-realtime";
import { useAuthStore } from "@/lib/stores/auth_store";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserDataInterface } from "@/lib/type";

interface Message {
  $id: string;
  messageId: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

interface ChatSession {
  partnerId: string;
  partnerName: string;
  partnerRole: string;
  partnerType: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface UserData {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  role?: string;
  type?: string;
}

export default function ModeratorChatPage() {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [students, setStudents] = useState<UserData[]>([]);
  const [guests, setGuests] = useState<UserData[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("active-chats");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserDataInterface | null>(null);
  const { getCurrentUser } = useAuthStore();
  const moderatorId = user?.$id;
  const { toast } = useToast();
  
  // Initialize auth on component mount
  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);
  
  // Load chat sessions for the moderator
  useEffect(() => {
    async function loadChatSessions() {
      if (!moderatorId) return;
      
      try {
        setLoading(true);
        const sessions = await getUserChatSessions(moderatorId);
        setChatSessions(sessions);
      } catch (error) {
        console.error("Error loading chat sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load chat sessions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (moderatorId) {
      loadChatSessions();
    }
  }, [moderatorId, toast]);
  
  // Load all users
  useEffect(() => {
    async function loadUsers() {
      try {
        const allUsers = await getAllUsers();
        
        // Map API user data to match our UserData interface
        const mappedUsers = allUsers.map(user => ({
          id: user.userId || user.$id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName || 'User'}`,
          email: user.email,
          role: user.role,
          type: user.type
        }));
        
        // Separate students and guests
        const studentUsers = mappedUsers.filter(user => user.role === "student" && user.type !== "guest");
        const guestUsers = mappedUsers.filter(user => user.type === "guest");
        
        setStudents(studentUsers);
        setGuests(guestUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      }
    }
    
    loadUsers();
  }, [toast]);
  
  // Load conversation with the selected user
  useEffect(() => {
    async function loadConversation() {
      if (!moderatorId || !selectedUserId) {
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Loading conversation between moderator ${moderatorId} and user ${selectedUserId}`);
        const conversationHistory = await getMessagesBetweenUsers(moderatorId, selectedUserId);
        console.log(`Retrieved ${conversationHistory.length} messages for the conversation`);
        
        if (conversationHistory.length > 0) {
          // Log the first and last message to debug visibility issues
          console.log('First message:', conversationHistory[conversationHistory.length-1]);
          console.log('Latest message:', conversationHistory[0]);
        }
        
        setMessages(conversationHistory);
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load message history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (selectedUserId && moderatorId) {
      loadConversation();
    }
  }, [selectedUserId, moderatorId, toast]);
  
  // Set up real-time listener for new messages
  useEffect(() => {
    if (!moderatorId || !selectedUserId) return;
    
    console.log(`[DEBUG] Setting up real-time listener: MODERATOR=${moderatorId}, STUDENT=${selectedUserId}`);
    
    // Use the client-side implementation for real-time updates
    const unsubscribeFunction = subscribeToMessages((newMessage) => {
      console.log(`[DEBUG] Received real-time message:`, JSON.stringify(newMessage));
      console.log(`[DEBUG] Current conversation: MODERATOR=${moderatorId}, STUDENT=${selectedUserId}`);
      console.log(`[DEBUG] Message details: FROM=${newMessage.senderId}, TO=${newMessage.receiverId}`);
      
      // Check if the message is from the current conversation
      const isFromCurrentConversation = 
        (newMessage.senderId === moderatorId && newMessage.receiverId === selectedUserId) ||
        (newMessage.senderId === selectedUserId && newMessage.receiverId === moderatorId);
      
      console.log(`[DEBUG] Is message from current conversation? ${isFromCurrentConversation}`);
      
      if (isFromCurrentConversation) {
        console.log(`[DEBUG] Message belongs to current conversation, adding to messages`);
        
        // Check if this message already exists in our state to prevent duplicates
        setMessages((prevMessages) => {
          // Check if message already exists by ID
          const messageExists = prevMessages.some(msg => msg.messageId === newMessage.messageId);
          
          if (messageExists) {
            console.log(`[DEBUG] Message ${newMessage.messageId} already exists, not adding duplicate`);
            return prevMessages;
          } else {
            console.log(`[DEBUG] Adding new message ${newMessage.messageId} to conversation`);
            return [...prevMessages, newMessage];
          }
        });
        
        // Also update the chat sessions list with this new message
        setChatSessions(prevSessions => {
          return prevSessions.map(session => {
            if (session.partnerId === selectedUserId) {
              return {
                ...session,
                lastMessage: newMessage.text,
                lastMessageTime: newMessage.timestamp
              };
            }
            return session;
          });
        });
      } else {
        // If the message is for another conversation, update that chat session
        setChatSessions(prevSessions => {
          return prevSessions.map(session => {
            if ((newMessage.senderId === session.partnerId && newMessage.receiverId === moderatorId) ||
                (newMessage.senderId === moderatorId && newMessage.receiverId === session.partnerId)) {
              return {
                ...session,
                lastMessage: newMessage.text,
                lastMessageTime: newMessage.timestamp,
                unreadCount: newMessage.senderId === session.partnerId ? session.unreadCount + 1 : session.unreadCount
              };
            }
            return session;
          });
        });
      }
    });
    
    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, [moderatorId, selectedUserId]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleUserSelect = (userId: string, userData: UserData) => {
    setSelectedUserId(userId);
    setSelectedUserData(userData);
    setMessages([]);
  };
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !moderatorId || !selectedUserId) return;
    
    try {
      console.log(`Sending message from moderator ${moderatorId} to user ${selectedUserId}`);
      const sentMessage = await sendMessage(moderatorId, selectedUserId, messageText);
      console.log('Message sent successfully:', sentMessage);
      
      // Manually add the message to our local state to ensure immediate visibility
      const newMessage = {
        $id: sentMessage.messageId,
        messageId: sentMessage.messageId,
        senderId: moderatorId,
        receiverId: selectedUserId,
        text: messageText,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [ ...prevMessages, newMessage]);
      setMessageText("");
      
      // Check if this user is already in our chat sessions
      const existingSession = chatSessions.find(session => session.partnerId === selectedUserId);
      
      if (!existingSession && selectedUserData) {
        // Add this user to chat sessions if not already there
        setChatSessions(prev => [
          {
            partnerId: selectedUserId,
            partnerName: selectedUserData.name,
            partnerRole: selectedUserData.role || "student",
            partnerType: selectedUserData.type || "regular",
            lastMessage: messageText,
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0
          },
          ...prev
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="p-6 h-[calc(100vh-6rem)]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Moderator Chat Management</h1>
          <TabsList>
            <TabsTrigger value="active-chats" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Chats
              {chatSessions.some(session => session.unreadCount > 0) && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {chatSessions.reduce((total, session) => total + session.unreadCount, 0)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all-users" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              All Users
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <TabsContent value="active-chats" className="m-0 h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Active Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  {loading && chatSessions.length === 0 ? (
                    <div className="flex justify-center items-center h-20">
                      <p>Loading conversations...</p>
                    </div>
                  ) : chatSessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No active conversations</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatSessions.map((session) => (
                        <div
                          key={session.partnerId}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                            selectedUserId === session.partnerId ? "bg-gray-100" : ""
                          }`}
                          onClick={() => handleUserSelect(session.partnerId, {
                            id: session.partnerId,
                            name: session.partnerName,
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.partnerName}`,
                            role: session.partnerRole,
                            type: session.partnerType
                          })}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.partnerName}`} />
                                <AvatarFallback>{session.partnerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {session.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {session.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium truncate">{session.partnerName}</h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(session.lastMessageTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={session.partnerType === "guest" ? "outline" : "secondary"} className="text-xs">
                                  {session.partnerType === "guest" ? "Guest" : session.partnerRole}
                                </Badge>
                                <p className="text-sm text-gray-500 truncate">{session.lastMessage}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="all-users" className="m-0 h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="students" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="students" className="flex-1">Students</TabsTrigger>
                    <TabsTrigger value="guests" className="flex-1">Guests</TabsTrigger>
                  </TabsList>
                  <TabsContent value="students" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                      {students.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No students found</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {students.map((student) => (
                            <div
                              key={student.id}
                              className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                                selectedUserId === student.id ? "bg-gray-100" : ""
                              }`}
                              onClick={() => handleUserSelect(student.id, student)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} />
                                  <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{student.name}</h4>
                                  <p className="text-sm text-gray-500">{student.email}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="guests" className="mt-4">
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                      {guests.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No guest users found</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {guests.map((guest) => (
                            <div
                              key={guest.id}
                              className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                                selectedUserId === guest.id ? "bg-gray-100" : ""
                              }`}
                              onClick={() => handleUserSelect(guest.id, guest)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={guest.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${guest.name}`} />
                                  <AvatarFallback>{guest.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{guest.name}</h4>
                                  <Badge variant="outline" className="ml-2">Guest</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="col-span-1 md:col-span-2 h-full">
            <Card className="h-full flex flex-col">
              {selectedUserData ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={selectedUserData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserData.name}`} />
                        <AvatarFallback>{selectedUserData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {selectedUserData.name}
                          {selectedUserData.type === "guest" ? (
                            <Badge variant="outline">Guest</Badge>
                          ) : (
                            <Badge variant="secondary">{selectedUserData.role || "Student"}</Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {selectedUserData.email || "No email available"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 p-4 overflow-auto">
                    <ScrollArea className="h-[calc(100vh-16rem)]">
                      <div className="space-y-4">
                        {loading ? (
                          <div className="flex justify-center items-center h-full">
                            <p>Loading conversation...</p>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No messages yet. Start a conversation!</p>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={`msg-${message.messageId}-${message.timestamp}`}
                              className={`flex ${
                                message.senderId === moderatorId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.senderId === moderatorId
                                    ? "bg-brand-orange text-white"
                                    : "bg-gray-100"
                                }`}
                              >
                                <p>{message.text}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                  
                  <div className="p-4 border-t mt-auto">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || !selectedUserId}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Users className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No conversation selected</h3>
                  <p className="text-gray-500 max-w-md">
                    Select a user from the list to start or continue a conversation.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
