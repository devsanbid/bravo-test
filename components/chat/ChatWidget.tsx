"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createGuestUser, sendMessage, subscribeToMessages } from "@/controllers/chatController";
import { useAuthStore } from "@/lib/stores/authStore";

interface Message {
  $id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export default function ChatWidget() {
  // Get authentication state first
  const { user, checkUser } = useAuthStore();
  const { toast } = useToast();
  
  // Initialize auth on component mount
  useEffect(() => {
    checkUser();
  }, [checkUser]);
  
  // Initialize all state and refs
  const [isStartChatOpen, setIsStartChatOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [messageText, setMessageText] = useState("");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock chat data for the list
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "support",
      name: "Support Team",
      lastMessage: "How can we help you today?",
      timestamp: new Date(),
      unread: 0,
    },
  ]);

  // Config - use the same moderator ID as in other components
  const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASEID || "";
  const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTID || "";
  const moderatorId = "mod123"; // Using consistent moderator ID across the app
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Set up real-time listener for new messages
  useEffect(() => {
    if (!guestUserId) return;
    
    const unsubscribe = subscribeToMessages((newMessage) => {
      // Check if the message is for this guest
      if (newMessage.senderId === guestUserId || newMessage.receiverId === guestUserId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [guestUserId]);

  const handleStartChat = async () => {
    if (!name || !phone) return;
    
    try {
      setLoading(true);
      // Create guest user
      const guestUser = await createGuestUser(DATABASE_ID, USERS_COLLECTION_ID);
      setGuestUserId(guestUser.$id);
      
      // Send initial message including contact info
      const initialMessage = `Hello, my name is ${name}. My phone number is ${phone}. I'd like to get some information.`;
      await sendMessage(guestUser.$id, moderatorId, initialMessage);
      
      // Add this message to local state
      const newMessage = {
        $id: Date.now().toString(),
        text: initialMessage,
        senderId: guestUser.$id,
        receiverId: moderatorId,
        timestamp: new Date().toISOString()
      };
      setMessages([newMessage]);
      
      // Close dialog, show chat
      setIsStartChatOpen(false);
      setActiveChat("support");
      
      // Send welcome message
      setTimeout(() => {
        const welcomeMessage = {
          $id: (Date.now() + 1).toString(),
          text: "Thanks for reaching out! A moderator will connect with you shortly.",
          senderId: moderatorId,
          receiverId: guestUser.$id,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, welcomeMessage]);
      }, 1000);
      
    } catch (error) {
      console.error("Error starting chat:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !guestUserId) return;
    
    try {
      await sendMessage(guestUserId, moderatorId, messageText);
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

  // If user is logged in, don't render the chat UI, but still render a fragment
  // to ensure hooks are still called in the same order
  if (user) {
    return <></>;
  }

  return (
    <>
      {/* Chat List Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-20 right-4 h-12 w-12 rounded-full shadow-lg md:bottom-8"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Open chat</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-[400px] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Messages</SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(100vh-5rem)]">
            <ScrollArea className="flex-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors border-b"
                  onClick={() => setActiveChat(chat.id)}
                >
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{chat.name}</p>
                      <span className="text-xs text-gray-500">
                        {chat.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))}
            </ScrollArea>

            <div className="p-4 border-t mt-auto">
              <Dialog open={isStartChatOpen} onOpenChange={setIsStartChatOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Start New Chat</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start a New Chat</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          placeholder="+1 (555) 000-0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleStartChat}
                      className="w-full"
                      disabled={!name || !phone}
                    >
                      Start Chat
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Chat Dialog */}
      <Dialog open={!!activeChat} onOpenChange={() => setActiveChat(null)}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Chat with Support</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col h-[600px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.$id}
                    className={`flex ${
                      msg.senderId === guestUserId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.senderId === guestUserId
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
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
                  disabled={!messageText.trim() || loading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
