"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, X } from "lucide-react";
import { createGuestUser, sendMessage, getAllModerators } from "@/controllers/ChatController";
import { subscribeToMessages } from "@/lib/client/appwrite-realtime";
import { useToast } from "@/hooks/use-toast";

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

export default function GuestChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [selectedModeratorId, setSelectedModeratorId] = useState<string>("");
  const [guestUser, setGuestUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Initialize guest user on component mount
  useEffect(() => {
    const initGuestUser = async () => {
      try {
        // Check if we have a guest user in localStorage
        const storedUser = localStorage.getItem('guestUser');
        
        if (storedUser) {
          setGuestUser(JSON.parse(storedUser));
        } else {
          // Create a new guest user
          const newGuestUser = await createGuestUser();
          setGuestUser(newGuestUser);
          localStorage.setItem('guestUser', JSON.stringify(newGuestUser));
        }
      } catch (error) {
        console.error("Error initializing guest user:", error);
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again later.",
          variant: "destructive",
        });
      }
    };
    
    initGuestUser();
  }, [toast]);
  
  // Load available moderators
  useEffect(() => {
    async function loadModerators() {
      try {
        setLoading(true);
        const availableModerators = await getAllModerators();
        setModerators(availableModerators);
        
        // If there's at least one moderator, select the first one
        if (availableModerators.length > 0) {
          setSelectedModeratorId(availableModerators[0].id);
        }
      } catch (error) {
        console.error("Error loading moderators:", error);
        toast({
          title: "Error",
          description: "Failed to load available moderators",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (isOpen && !isMinimized) {
      loadModerators();
    }
  }, [isOpen, isMinimized, toast]);
  
  // Set up real-time listener for new messages
  useEffect(() => {
    if (!guestUser || !selectedModeratorId || isMinimized) return;
    
    // Use the client-side implementation for real-time updates
    const unsubscribeFunction = subscribeToMessages((newMessage) => {
      // Check if the message is from the current conversation
      if ((newMessage.senderId === guestUser.$id && newMessage.receiverId === selectedModeratorId) ||
          (newMessage.senderId === selectedModeratorId && newMessage.receiverId === guestUser.$id)) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    return () => {
      if (unsubscribeFunction) {
        unsubscribeFunction();
      }
    };
  }, [guestUser, selectedModeratorId, isMinimized]);
  
  // Load conversation with the selected moderator
  useEffect(() => {
    const loadConversation = async () => {
      if (!guestUser || !selectedModeratorId) return;
      
      try {
        setLoading(true);
        
        // Import the function dynamically to avoid server-side issues
        const { getMessagesBetweenUsers } = await import('@/controllers/ChatController');
        
        const conversationHistory = await getMessagesBetweenUsers(guestUser.$id, selectedModeratorId);
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
    };
    
    if (isOpen && !isMinimized && guestUser && selectedModeratorId) {
      loadConversation();
    }
  }, [guestUser, selectedModeratorId, isOpen, isMinimized, toast]);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!messageText.trim() || !guestUser || !selectedModeratorId) return;
    
    try {
      await sendMessage(guestUser.$id, selectedModeratorId, messageText);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };
  
  const toggleChat = () => {
    if (isMinimized) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsMinimized(true);
    }
  };
  
  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };
  
  // Render the chat button when minimized
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={toggleChat} 
          className="rounded-full w-14 h-14 bg-brand-orange hover:bg-brand-orange/90"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }
  
  // Get the selected moderator details
  const selectedModerator = moderators.find(mod => mod.id === selectedModeratorId) || {
    name: "Support Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Support"
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-lg rounded-lg bg-white border overflow-hidden flex flex-col h-[500px]">
      {/* Chat Header */}
      <div className="p-3 border-b bg-brand-orange text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={selectedModerator.avatar} />
            <AvatarFallback>ST</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">{selectedModerator.name}</h3>
            <p className="text-xs opacity-80">Online</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
            onClick={toggleChat}
          >
            <span className="sr-only">Minimize</span>
            <span className="h-1 w-4 bg-white rounded-full block"></span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
            onClick={closeChat}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Start a conversation with our support team!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.$id}
                className={`flex ${
                  message.senderId === guestUser?.$id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.senderId === guestUser?.$id
                      ? "bg-brand-orange text-white"
                      : "bg-gray-100"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
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
      
      {/* Chat Input */}
      <div className="p-3 border-t mt-auto">
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
            className="text-sm"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!messageText.trim() || !guestUser || !selectedModeratorId}
            className="bg-brand-orange hover:bg-brand-orange/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
