"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, UserPlus, Users } from "lucide-react";
import { 
  getMessagesBetweenUsers, 
  sendMessage, 
  getAllModerators
} from "@/controllers/ChatController";
import { subscribeToMessages } from "@/lib/client/appwrite-realtime";
import { useAuthStore } from "@/lib/stores/auth_store";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserDataInterface } from "@/lib/type";

interface Message {
  $id: string;
  messageId: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

interface Moderator {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  role?: string;
}

export default function StudentMessagesPage() {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [selectedModeratorId, setSelectedModeratorId] = useState<string>("");
  const [moderator, setModerator] = useState({
    id: "", // Will be updated with a real moderator ID
    name: "Support Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Support",
    online: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user,setUser] = useState<UserDataInterface | null>(null);
  const {getCurrentUser} = useAuthStore();
  const studentId = user?.$id;
  const { toast } = useToast();
  
  // Initialize auth on component mount
  useEffect(() => {
    getCurrentUser().then((user) => {
      setUser(user);
    });
  }, []);
  
  // Load available moderators
  useEffect(() => {
    async function loadModerators() {
      try {
        console.log("Loading available moderators");
        const availableModerators = await getAllModerators();
        console.log("Retrieved", availableModerators.length, "moderators");
        setModerators(availableModerators);
        
        // If there's at least one moderator, select the first one
        if (availableModerators.length > 0 && !selectedModeratorId) {
          setSelectedModeratorId(availableModerators[0].id);
          setModerator({
            id: availableModerators[0].id,
            name: availableModerators[0].name,
            avatar: availableModerators[0].avatar,
            online: false
          });
        }
      } catch (error) {
        console.error("Error loading moderators:", error);
        toast({
          title: "Error",
          description: "Failed to load available moderators",
          variant: "destructive",
        });
        
        // Set default moderator in case of error
        setSelectedModeratorId("mod123");
        setModerator({
          id: "mod123",
          name: "Support Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Support",
          online: false
        });
      }
    }
    
    loadModerators();
  }, [toast]);
  
  // Load conversation with the selected moderator
  useEffect(() => {
    async function loadConversation() {
      if (!studentId || !selectedModeratorId) {
        console.log("No student ID or moderator selected yet");
        return;
      }
      
      try {
        setLoading(true);
        
        console.log("Fetching conversation history between", studentId, "and", selectedModeratorId);
        try {
          const conversationHistory = await getMessagesBetweenUsers(studentId, selectedModeratorId);
          console.log("Retrieved", conversationHistory.length, "messages");
          setMessages(conversationHistory);
        } catch (historyError) {
          console.error("Error fetching history:", historyError);
          toast({
            title: "Error",
            description: "Failed to load message history",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading conversation:", error);
        toast({
          title: "Error",
          description: "Failed to load conversation",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (selectedModeratorId && studentId) {
      loadConversation();
    }
  }, [studentId, selectedModeratorId, toast]);
  
  // Handle moderator selection change
  const handleModeratorChange = (modId: string) => {
    console.log("Changing selected moderator to:", modId);
    setSelectedModeratorId(modId);
    
    // Update moderator information
    const selectedMod = moderators.find(mod => mod.id === modId);
    if (selectedMod) {
      setModerator({
        id: selectedMod.id,
        name: selectedMod.name,
        avatar: selectedMod.avatar,
        online: false
      });
    }
    
    // Clear messages when changing moderator
    setMessages([]);
  };
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedModeratorId || !studentId) return;
    
    try {
      console.log("Sending message from", studentId, "to", selectedModeratorId);
      const newMessage = await sendMessage(
        studentId,
        selectedModeratorId,
        messageText.trim()
      );
      console.log("Message sent successfully:", newMessage);
      
      // Add the new message to the UI immediately without waiting for the subscription
      setMessages((prevMessages) => [
        ...prevMessages, 
        {
          $id: newMessage.messageId || Date.now().toString(),
          messageId: newMessage.messageId || Date.now().toString(),
          text: messageText.trim(),
          senderId: studentId,
          receiverId: selectedModeratorId,
          timestamp: new Date().toISOString()
        } as Message
      ]);
      
      // Clear the input field
      setMessageText("");
      
      // Scroll to the bottom to show the new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  // Set up real-time listener for new messages
  useEffect(() => {
    if (!studentId || !selectedModeratorId) return;
    
    console.log("Setting up real-time message subscription for student:", studentId);
    
    // Use the client-side implementation for real-time updates
    const unsubscribeFunction = subscribeToMessages((newMessage) => {
      console.log("Real-time message received:", newMessage);
      
      // Check if the message is from the current conversation
      if ((newMessage.senderId === studentId && newMessage.receiverId === selectedModeratorId) ||
          (newMessage.senderId === selectedModeratorId && newMessage.receiverId === studentId)) {
        
        console.log("Adding new message to current conversation");
        
        // Avoid duplicate messages by checking if we already have it
        setMessages((prevMessages) => {
          // Check if message with this ID already exists
          if (prevMessages.some(msg => msg.$id === newMessage.$id)) {
            return prevMessages;
          }
          
          // Add the new message
          const updatedMessages = [...prevMessages, newMessage];
          
          // Sort messages by timestamp to ensure correct order
          updatedMessages.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
          
          return updatedMessages;
        });
        
        // Scroll to the bottom to show the new message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });
    
    return () => {
      console.log("Cleaning up message subscription");
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, [studentId, selectedModeratorId]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  return (
    <div className="p-6 h-[calc(100vh-6rem)]">
      <Card className="flex-1 h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={moderator.avatar} />
                <AvatarFallback>ST</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{moderator.name}</CardTitle>
                <p className="text-sm text-gray-500">
                  {moderator.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedModeratorId} onValueChange={handleModeratorChange}>
                <SelectTrigger className="w-[220px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select moderator" />
                </SelectTrigger>
                <SelectContent>
                  {moderators.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id}>
                      <div className="flex items-center gap-2">
                        <span>{mod.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-4 overflow-auto">
          <ScrollArea className="h-[calc(100vh-12rem)]">
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
                    key={message.$id}
                    className={`flex ${
                      message.senderId === studentId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.senderId === studentId
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
              disabled={!messageText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
