"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "admin";
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

export default function UserChat() {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  
  // Mock data - replace with real data from your backend
  const [chats] = useState<Chat[]>([
    {
      id: "1",
      name: "Support Team",
      lastMessage: "How can we help you today?",
      timestamp: new Date(),
      unread: 2,
    },
    {
      id: "2",
      name: "Course Advisor",
      lastMessage: "Your application has been received",
      timestamp: new Date(),
      unread: 0,
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can we help you today?",
      sender: "admin",
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Here you would typically:
      // 1. Send message to your backend
      // 2. Update local state
      setMessage("");
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageCircle className="h-5 w-5" />
          {chats.reduce((acc, chat) => acc + chat.unread, 0) > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {chats.reduce((acc, chat) => acc + chat.unread, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[400px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Messages</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-[calc(100vh-5rem)]">
          {!activeChat ? (
            <ScrollArea className="flex-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors border-b"
                  onClick={() => setActiveChat(chat.id)}
                >
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {chat.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
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
          ) : (
            <>
              <div className="p-4 border-b flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveChat(null)}
                >
                  Back
                </Button>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {chats.find((c) => c.id === activeChat)?.name}
                  </p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender === "user"
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}