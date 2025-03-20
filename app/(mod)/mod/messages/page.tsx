"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Send } from "lucide-react";
import {
	createGuestUser,
	getMessagesBetweenUsers,
	getUsersWithRecentMessages,
	sendMessage,
	subscribeToMessages,
} from "@/controllers/ChatController";
import { useAuthStore } from "@/lib/stores/auth_store";
import { useToast } from "@/hooks/use-toast";
import { UserDataInterface } from "@/lib/type";

interface Message {
	$id: string;
	messageId: string;
	text: string;
	senderId: string;
	receiverId: string;
	timestamp: string;
}

interface User {
	id: string;
	name: string;
	avatar: string;
	lastMessage: string;
	lastMessageTime: string | null;
	unread: number;
	online: boolean;
	type: "student" | "guest";
}

export default function MessagesManagement() {
	const [selectedUser, setSelectedUser] = useState<string | null>(null);
	const [messageText, setMessageText] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [users, setUsers] = useState<User[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [loading, setLoading] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [user, setUser] = useState<UserDataInterface | null>(null);
	const { getCurrentUser } = useAuthStore();
	const { toast } = useToast();

	// Initialize auth on component mount
	useEffect(() => {
		async function run() {
			const user = await getCurrentUser();
			if (user) {
				setUser(user);
			}
		}
		run();
	}, []);

	const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASEID || "";
	const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTID || "";

	// Fetch users and their most recent messages
	useEffect(() => {
		async function fetchUsers() {
			// Use a consistent moderator ID across the app
			const modId = user?.$id || "mod123";

			try {
				setLoading(true);
				console.log(
					"Fetching users with recent messages for moderator:",
					modId,
				);
				const usersWithMessages = await getUsersWithRecentMessages(modId);
				console.log(
					"Retrieved",
					usersWithMessages.length,
					"users with messages",
				);
				setUsers(usersWithMessages);
			} catch (error) {
				console.error("Error fetching users:", error);
				toast({
					title: "Error",
					description: "Failed to load chat users",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		fetchUsers();
	}, [moderatorId, toast]);

	// Set up real-time listener for new messages
	useEffect(() => {
		// Use a consistent moderator ID across the app
		const modId = moderatorId || "mod123";

		console.log(
			"Setting up real-time message subscription for moderator:",
			modId,
		);

		const unsubscribe = subscribeToMessages((newMessage) => {
			// Update messages if this is for the currently selected conversation
			if (
				selectedUser &&
				(newMessage.senderId === selectedUser ||
					newMessage.receiverId === selectedUser) &&
				(newMessage.senderId === modId || newMessage.receiverId === modId)
			) {
				console.log("New message for current conversation received");
				setMessages((prevMessages) => [...prevMessages, newMessage]);
			}

			// Update the users list with new last message
			setUsers((prevUsers) => {
				return prevUsers.map((user) => {
					if (
						user.id === newMessage.senderId ||
						user.id === newMessage.receiverId
					) {
						return {
							...user,
							lastMessage: newMessage.text,
							lastMessageTime: newMessage.timestamp,
							unread:
								user.id === newMessage.receiverId &&
								newMessage.senderId !== moderatorId
									? user.unread + 1
									: user.unread,
						};
					}
					return user;
				});
			});
		});

		return () => {
			unsubscribe();
		};
	}, [moderatorId, selectedUser]);

	// Load conversation when selecting a user
	useEffect(() => {
		async function loadConversation() {
			if (!selectedUser) return;

			// Use a consistent moderator ID across the app
			const modId = moderatorId || "mod123";

			try {
				setLoading(true);
				console.log(
					"Loading conversation between moderator",
					modId,
					"and user",
					selectedUser,
				);
				const conversationHistory = await getMessagesBetweenUsers(
					modId,
					selectedUser,
				);
				console.log("Retrieved", conversationHistory.length, "messages");
				// No need for casting as the controller now returns plain objects
				setMessages(conversationHistory);

				// Mark messages as read
				setUsers((prevUsers) =>
					prevUsers.map((user) =>
						user.id === selectedUser ? { ...user, unread: 0 } : user,
					),
				);
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

		loadConversation();
	}, [selectedUser, moderatorId, toast]);

	// Scroll to bottom of messages when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleStartConversation = async () => {
		try {
			const guestUser = await createGuestUser(DATABASE_ID, USERS_COLLECTION_ID);
			const newUser: User = {
				id: guestUser.$id,
				name: guestUser.name,
				avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestUser.name}`,
				lastMessage: "",
				lastMessageTime: null,
				unread: 0,
				online: false,
				type: "guest",
			};

			setUsers((prevUsers) => [newUser, ...prevUsers] as User[]);
			setSelectedUser(guestUser.$id);

			toast({
				title: "Success",
				description: "Created a new guest conversation",
			});
		} catch (error) {
			console.error("Error starting conversation:", error);
			toast({
				title: "Error",
				description: "Failed to create guest conversation",
				variant: "destructive",
			});
		}
	};

	const filteredUsers = users.filter((user) =>
		user.name.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleSendMessage = async () => {
		if (!messageText.trim() || !selectedUser) return;

		// Use a consistent moderator ID across the app
		const modId = moderatorId || "mod123";

		try {
			console.log(
				"Sending message from moderator",
				modId,
				"to user",
				selectedUser,
			);
			await sendMessage(modId, selectedUser, messageText);
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

	return (
		<div className="p-6 h-[calc(100vh-2rem)]">
			<div className="flex h-full gap-6">
				{/* Users List */}
				<Card className="w-80">
					<CardHeader>
						<CardTitle>Messages</CardTitle>
						<div className="relative mt-2">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
							<Input
								placeholder="Search conversations..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-9"
							/>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<ScrollArea className="h-[calc(100vh-16rem)]">
							{filteredUsers.map((user) => (
								<button
									key={user.id}
									className="w-full p-4 flex items-center gap-4 hover:bg-gray-100 transition-colors border-b relative"
									onClick={() => setSelectedUser(user.id)}
								>
									<div className="relative">
										<Avatar>
											<AvatarImage src={user.avatar} />
											<AvatarFallback>
												{user.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										{user.online && (
											<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
										)}
									</div>
									<div className="flex-1 text-left">
										<div className="flex justify-between items-center">
											<p className="font-medium">
												{user.name}{" "}
												{user.type === "student" ? "(Verified)" : "(Guest)"}
											</p>
											{user.unread > 0 && (
												<span className="bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
													{user.unread}
												</span>
											)}
										</div>
										<p className="text-sm text-gray-500 truncate">
											{user.lastMessage}
										</p>
									</div>
								</button>
							))}
						</ScrollArea>
					</CardContent>
				</Card>

				{/* Chat Area */}
				<Card className="flex-1">
					{selectedUser ? (
						<div className="h-full flex flex-col">
							<CardHeader className="border-b">
								<div className="flex items-center gap-4">
									<Avatar>
										<AvatarImage
											src={users.find((u) => u.id === selectedUser)?.avatar}
										/>
										<AvatarFallback>
											{users
												.find((u) => u.id === selectedUser)
												?.name.split(" ")
												.map((n) => n[0])
												.join("")}
										</AvatarFallback>
									</Avatar>
									<div>
										<CardTitle>
											{users.find((u) => u.id === selectedUser)?.name}
										</CardTitle>
										<p className="text-sm text-gray-500">
											{users.find((u) => u.id === selectedUser)?.online
												? "Online"
												: "Offline"}
										</p>
									</div>
								</div>
							</CardHeader>
							<CardContent className="flex-1 p-4 overflow-auto">
								<ScrollArea className="h-[calc(100vh-20rem)]">
									<div className="space-y-4">
										{messages
											.filter(
												(message) =>
													(message.senderId === selectedUser &&
														message.receiverId === moderatorId) ||
													(message.senderId === moderatorId &&
														message.receiverId === selectedUser),
											)
											.map((message) => (
												<div
													key={message.$id}
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
															{new Date(message.timestamp).toLocaleTimeString(
																[],
																{
																	hour: "2-digit",
																	minute: "2-digit",
																},
															)}
														</p>
													</div>
												</div>
											))}
										<div ref={messagesEndRef} />
									</div>
								</ScrollArea>
							</CardContent>
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
										disabled={!messageText.trim()}
									>
										<Send className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					) : (
						<div className="h-full flex items-center justify-center text-gray-500">
							Select a conversation to start messaging
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
