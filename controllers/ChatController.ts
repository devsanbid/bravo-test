"use server";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { ID, Query } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASEID || "";
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTID || "";
const MESSAGE_COLLECTION_ID = process.env.MESSAGE_ID || "";
const CHAT_ROOMS_COLLECTION_ID = process.env.CHAT_ROOMS_ID || "";
const ROOM_MESSAGES_COLLECTION_ID = process.env.ROOM_MESSAGES_ID || "";

interface MessageData {
	messageId: string;
	senderId: string;
	receiverId: string;
	text: string;
	timestamp: string;
}

export async function createGuestUser() {
	try {
		console.log(
			"Creating guest user with DATABASE_ID:",
			DATABASE_ID,
			"USERS_COLLECTION_ID:",
			USERS_COLLECTION_ID,
		);

		const adminClient = await createAdminClient();
		if (!adminClient) {
			throw new Error("Failed to initialize admin client");
		}

		const { account, databases } = adminClient;

		// Generate unique values
		const userId = ID.unique();
		const username = `Guest${Math.floor(Math.random() * 10000)}`;
		const password = Math.random().toString(36).slice(-10); // Generate a random password
		const email = `${username.toLowerCase()}@guest.example.com`;

		console.log("Attempting to create guest user with ID:", userId);

		try {
			// Create user in Appwrite
			const user = await account.create(userId, email, password, username);

			console.log("Guest user created successfully:", user.$id);

			// Create user document in Users collection
			try {
				const userDoc = await databases.createDocument(
					DATABASE_ID,
					USERS_COLLECTION_ID,
					ID.unique(),
					{
						userId: user.$id,
						firstName: username,
						lastName: "",
						email: email,
						gender: "other",
						dateOfBirth: new Date().toISOString(),
						phone: "",
						service: "",
						role: "student",
						type: "guest",
					},
				);

				console.log("Guest user document created:", userDoc.$id);
			} catch (docError) {
				console.error("Error creating user document:", docError);
				// Continue anyway as we at least have the user account
			}

			return user;
		} catch (userError) {
			console.error("Error creating guest user account:", userError);
			throw userError;
		}
	} catch (error: any) {
		console.error("Error in createGuestUser:", error);
		throw new Error(
			`Failed to create guest user: ${error?.message || "Unknown error"}`,
		);
	}
}

export async function sendMessage(
	senderId: string,
	receiverId: string,
	text: string,
) {
	try {
		console.log("Sending message from", senderId, "to", receiverId);

		const adminClient = await createAdminClient();
		if (!adminClient) {
			throw new Error("Failed to initialize admin client");
		}

		const { databases } = adminClient;

		const messageId = ID.unique();
		const documentId = ID.unique();

		const messageData: MessageData = {
			messageId,
			senderId,
			receiverId,
			text,
			timestamp: new Date().toISOString(),
		};

		console.log("Creating message document with ID:", documentId);

		try {
			const result = await databases.createDocument(
				DATABASE_ID,
				MESSAGE_COLLECTION_ID,
				documentId,
				messageData,
			);

			console.log("Message sent successfully:", result.$id);
			return result;
		} catch (dbError) {
			console.error("Database error when sending message:", dbError);
			throw dbError;
		}
	} catch (error: any) {
		console.error("Error in sendMessage:", error);
		throw new Error(
			`Failed to send message: ${error?.message || "Unknown error"}`,
		);
	}
}

export async function getMessagesBetweenUsers(
	userId1: string,
	userId2: string,
) {
	try {
		console.log(`Fetching messages between users ${userId1} and ${userId2}`);
		const { databases } = await createAdminClient();

		// Query messages where either:
		// 1. userId1 is sender and userId2 is receiver, OR
		// 2. userId2 is sender and userId1 is receiver
		// Get messages where user1 is sender and user2 is receiver
		const sentMessages = await databases.listDocuments(
			DATABASE_ID,
			MESSAGE_COLLECTION_ID,
			[
				Query.equal("senderId", userId1),
				Query.equal("receiverId", userId2),
				Query.orderDesc("timestamp"),
			],
		);

		// Get messages where user2 is sender and user1 is receiver
		const receivedMessages = await databases.listDocuments(
			DATABASE_ID,
			MESSAGE_COLLECTION_ID,
			[
				Query.equal("senderId", userId2),
				Query.equal("receiverId", userId1),
				Query.orderDesc("timestamp"),
			],
		);

		// Convert Appwrite documents to plain serializable objects
		const sentMessagesPlain = sentMessages.documents.map((doc) => ({
			$id: doc.$id,
			messageId: doc.messageId,
			senderId: doc.senderId,
			receiverId: doc.receiverId,
			text: doc.text,
			timestamp: doc.timestamp,
		}));

		const receivedMessagesPlain = receivedMessages.documents.map((doc) => ({
			$id: doc.$id,
			messageId: doc.messageId,
			senderId: doc.senderId,
			receiverId: doc.receiverId,
			text: doc.text,
			timestamp: doc.timestamp,
		}));

		// Combine and sort messages
		const allMessages = [...sentMessagesPlain, ...receivedMessagesPlain];
		allMessages.sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
		);

		console.log(`Retrieved ${allMessages.length} messages`);
		return allMessages;
	} catch (error) {
		console.error("Error getting messages:", error);
		throw error;
	}
}

export async function getAllUsers() {
	try {
		const { databases } = await createAdminClient();

		const users = await databases.listDocuments(
			DATABASE_ID,
			USERS_COLLECTION_ID,
		);

		// Convert Appwrite documents to plain serializable objects
		const plainUsers = users.documents.map((user) => ({
			$id: user.$id,
			userId: user.userId,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			type: user.type || "student",
			role: user.role || "student",
			// Add other needed properties
		}));

		return plainUsers;
	} catch (error) {
		console.error("Error getting users:", error);
		throw error;
	}
}

// Get all moderators
export async function getAllModerators() {
	try {
		console.log("Fetching all moderators");
		const { databases } = await createAdminClient();

		const users = await databases.listDocuments(
			DATABASE_ID,
			USERS_COLLECTION_ID,
		);

		// Filter for moderators and convert to plain objects
		const moderators = users.documents
			.filter((user) => user.role === "admin" || user.role === "mod")
			.map((mod) => ({
				id: mod.userId,
				name: `${mod.firstName} ${mod.lastName}`.trim(),
				avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${mod.firstName}`,
				email: mod.email,
				role: mod.role,
			}));

		console.log(`Found ${moderators.length} moderators`);
		return moderators;
	} catch (error) {
		console.error("Error getting moderators:", error);
		return [
			// Default moderator in case of error
			{
				id: "mod123",
				name: "Support Team",
				avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Support",
				role: "moderator",
			},
		];
	}
}

export async function getUsersWithRecentMessages(moderatorId: string) {
	try {
		const { databases } = await createAdminClient();

		// Get all users first
		const users = await databases.listDocuments(
			DATABASE_ID,
			USERS_COLLECTION_ID,
		);

		// For each user, get the most recent message (if any)
		const usersWithMessages = await Promise.all(
			users.documents.map(async (user) => {
				try {
					// Get the most recent message between this user and the moderator
					// Get latest sent message
					const sentMessages = await databases.listDocuments(
						DATABASE_ID,
						MESSAGE_COLLECTION_ID,
						[
							Query.equal("senderId", user.userId),
							Query.equal("receiverId", moderatorId),
							Query.orderDesc("timestamp"),
							Query.limit(1),
						],
					);

					// Get latest received message
					const receivedMessages = await databases.listDocuments(
						DATABASE_ID,
						MESSAGE_COLLECTION_ID,
						[
							Query.equal("senderId", moderatorId),
							Query.equal("receiverId", user.userId),
							Query.orderDesc("timestamp"),
							Query.limit(1),
						],
					);

					// Convert to plain objects to avoid serialization issues
					const sentMessagePlain =
						sentMessages.documents.length > 0
							? {
									$id: sentMessages.documents[0].$id,
									text: sentMessages.documents[0].text,
									timestamp: sentMessages.documents[0].timestamp,
									// Add other properties as needed
								}
							: null;

					const receivedMessagePlain =
						receivedMessages.documents.length > 0
							? {
									$id: receivedMessages.documents[0].$id,
									text: receivedMessages.documents[0].text,
									timestamp: receivedMessages.documents[0].timestamp,
									// Add other properties as needed
								}
							: null;

					// Determine which is more recent
					let latestMessage = null;

					if (sentMessagePlain && receivedMessagePlain) {
						latestMessage =
							new Date(sentMessagePlain.timestamp) >
							new Date(receivedMessagePlain.timestamp)
								? sentMessagePlain
								: receivedMessagePlain;
					} else {
						latestMessage = sentMessagePlain || receivedMessagePlain;
					}

					// Build a plain serializable object
					return {
						id: user.userId,
						name: `${user.firstName} ${user.lastName}`.trim(),
						avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
						lastMessage: latestMessage ? latestMessage.text : "",
						lastMessageTime: latestMessage ? latestMessage.timestamp : null,
						unread: 0, // We'll implement this later
						online: false, // We'll implement this later
						type: user.type || "student",
					};
				} catch (error) {
					console.error(
						`Error getting messages for user ${user.userId}:`,
						error,
					);
					return {
						id: user.userId,
						name: `${user.firstName} ${user.lastName}`.trim(),
						avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`,
						lastMessage: "",
						lastMessageTime: null,
						unread: 0,
						online: false,
						type: user.type || "student",
					};
				}
			}),
		);

		// Sort by most recent message
		return usersWithMessages.sort((a, b) => {
			if (!a.lastMessageTime && !b.lastMessageTime) return 0;
			if (!a.lastMessageTime) return 1;
			if (!b.lastMessageTime) return -1;
			return (
				new Date(b.lastMessageTime).getTime() -
				new Date(a.lastMessageTime).getTime()
			);
		});
	} catch (error) {
		console.error("Error getting users with messages:", error);
		throw error;
	}
}

// Setup a real-time listener for new messages
export async function subscribeToMessages(callback: (message: any) => void) {
	try {
		console.log(
			"Setting up message subscription for database:",
			DATABASE_ID,
			"collection:",
			MESSAGE_COLLECTION_ID,
		);

		const subscriptionChannel = `databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION_ID}.documents`;
		console.log("Subscribing to channel:", subscriptionChannel);

		// Return a Promise that resolves to the unsubscribe function
		return new Promise<() => void>(async (resolve, reject) => {
			try {
				const { client } = await createSessionClient();
				
				// Check if we have a realtime client
				if (!client.subscribe) {
					console.error("Realtime client not available");
					resolve(() => console.log("No subscription to unsubscribe from"));
					return;
				}
				
				const unsubscribe = client.subscribe(
					[subscriptionChannel],
					(response: any) => {
						// Check if this is a document creation event
						if (
							response.events &&
							response.events.includes(
								`databases.${DATABASE_ID}.collections.${MESSAGE_COLLECTION_ID}.documents.create`,
							)
						) {
							console.log("New message received:", response.payload?.$id);
							callback(response.payload);
						}
					},
				);

				console.log("Subscription set up successfully");
				resolve(unsubscribe);
			} catch (subError) {
				console.error("Subscription error:", subError);
				// Provide a dummy unsubscribe function in case of error
				resolve(() => console.log("Dummy unsubscribe called (from error)"));
				reject(subError);
			}
		});
	} catch (error: any) {
		console.error("Error in subscribeToMessages:", error);
		// Return a Promise that resolves to a dummy unsubscribe function
		return Promise.resolve(() => console.log("Dummy unsubscribe called"));
	}
}

// Get all active chat sessions for a user
export async function getUserChatSessions(userId: string) {
	try {
		console.log(`Getting chat sessions for user: ${userId}`);
		const { databases } = await createAdminClient();

		// Find all messages where the user is either sender or receiver
		const sentMessages = await databases.listDocuments(
			DATABASE_ID,
			MESSAGE_COLLECTION_ID,
			[Query.equal("senderId", userId), Query.orderDesc("timestamp"), Query.limit(100)]
		);

		const receivedMessages = await databases.listDocuments(
			DATABASE_ID,
			MESSAGE_COLLECTION_ID,
			[Query.equal("receiverId", userId), Query.orderDesc("timestamp"), Query.limit(100)]
		);

		// Extract unique user IDs the current user has chatted with
		const chatPartnerIds = new Set<string>();
		
		sentMessages.documents.forEach(doc => {
			chatPartnerIds.add(doc.receiverId);
		});
		
		receivedMessages.documents.forEach(doc => {
			chatPartnerIds.add(doc.senderId);
		});

		// Get user details for each chat partner
		const chatSessions = [];
		for (const partnerId of Array.from(chatPartnerIds)) {
			try {
				// Get the most recent message between these users
				const recentMessages = await databases.listDocuments(
					DATABASE_ID,
					MESSAGE_COLLECTION_ID,
					[
						Query.or([
							Query.and([
								Query.equal("senderId", userId),
								Query.equal("receiverId", partnerId)
							]),
							Query.and([
								Query.equal("senderId", partnerId),
								Query.equal("receiverId", userId)
							])
						]),
						Query.orderDesc("timestamp"),
						Query.limit(1)
					]
				);

				// Get partner user details
				const partnerDetails = await getUserDetails(partnerId);
				
				if (recentMessages.documents.length > 0 && partnerDetails) {
					chatSessions.push({
						partnerId: partnerId,
						partnerName: partnerDetails.firstName + " " + partnerDetails.lastName,
						partnerRole: partnerDetails.role,
						partnerType: partnerDetails.type,
						lastMessage: recentMessages.documents[0].text,
						lastMessageTime: recentMessages.documents[0].timestamp,
						unreadCount: 0 // This would need additional logic to track read status
					});
				}
			} catch (error) {
				console.error(`Error getting details for chat partner ${partnerId}:`, error);
				// Continue with other partners
			}
		}

		// Sort by most recent message
		chatSessions.sort((a, b) => 
			new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
		);

		return chatSessions;
	} catch (error) {
		console.error("Error getting user chat sessions:", error);
		throw error;
	}
}

// Get user details by user ID
export async function getUserDetails(userId: string) {
	try {
		console.log(`Getting user details for: ${userId}`);
		const { databases } = await createAdminClient();

		// Find user document by userId
		const users = await databases.listDocuments(
			DATABASE_ID,
			USERS_COLLECTION_ID,
			[Query.equal("userId", userId)]
		);

		if (users.documents.length > 0) {
			return users.documents[0];
		}
		
		return null;
	} catch (error) {
		console.error(`Error getting user details for ${userId}:`, error);
		return null;
	}
}

// Mark messages as read
export async function markMessagesAsRead(userId: string, partnerId: string) {
	try {
		console.log(`Marking messages as read from ${partnerId} to ${userId}`);
		const { databases } = await createAdminClient();

		// Find all unread messages from partner to user
		// Note: You would need to add a 'read' field to your message schema
		const unreadMessages = await databases.listDocuments(
			DATABASE_ID,
			MESSAGE_COLLECTION_ID,
			[
				Query.equal("senderId", partnerId),
				Query.equal("receiverId", userId),
				Query.equal("read", false)
			]
		);

		// Update each message to mark as read
		const updatePromises = unreadMessages.documents.map(doc => 
			databases.updateDocument(
				DATABASE_ID,
				MESSAGE_COLLECTION_ID,
				doc.$id,
				{ read: true }
			)
		);

		await Promise.all(updatePromises);
		
		return { success: true, count: unreadMessages.documents.length };
	} catch (error) {
		console.error("Error marking messages as read:", error);
		throw error;
	}
}

// Get unread message count
export async function getUnreadMessageCount(userId: string) {
	try {
		console.log(`Getting unread message count for user: ${userId}`);
		const { databases } = await createAdminClient();

		// Count unread messages sent to this user
		// Note: You would need to add a 'read' field to your message schema
		const unreadMessages = await databases.listDocuments(
			DATABASE_ID,
			MESSAGE_COLLECTION_ID,
			[
				Query.equal("receiverId", userId),
				Query.equal("read", false)
			]
		);

		return unreadMessages.total;
	} catch (error) {
		console.error("Error getting unread message count:", error);
		return 0;
	}
}

// Create a chat room (for group chats if needed)
export async function createChatRoom(name: string, creatorId: string, memberIds: string[]) {
	try {
		console.log(`Creating chat room: ${name}`);
		const { databases } = await createAdminClient();

		// Create a new chat room document
		// Note: You would need to create a CHAT_ROOMS_COLLECTION
		const roomId = ID.unique();
		const room = await databases.createDocument(
			DATABASE_ID,
			CHAT_ROOMS_COLLECTION_ID,
			roomId,
			{
				name,
				creatorId,
				members: [creatorId, ...memberIds],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}
		);

		return room;
	} catch (error) {
		console.error("Error creating chat room:", error);
		throw error;
	}
}

// Send message to a chat room
export async function sendRoomMessage(roomId: string, senderId: string, text: string) {
	try {
		console.log(`Sending message to room ${roomId} from ${senderId}`);
		const { databases } = await createAdminClient();

		// Verify room exists and user is a member
		const room = await databases.getDocument(
			DATABASE_ID,
			CHAT_ROOMS_COLLECTION_ID,
			roomId
		);

		if (!room.members.includes(senderId)) {
			throw new Error("User is not a member of this chat room");
		}

		// Create message document
		const messageId = ID.unique();
		const documentId = ID.unique();

		const messageData = {
			messageId,
			roomId,
			senderId,
			text,
			timestamp: new Date().toISOString(),
			read: false
		};

		const result = await databases.createDocument(
			DATABASE_ID,
			ROOM_MESSAGES_COLLECTION_ID,
			documentId,
			messageData
		);

		// Update room's updatedAt timestamp
		await databases.updateDocument(
			DATABASE_ID,
			CHAT_ROOMS_COLLECTION_ID,
			roomId,
			{ updatedAt: new Date().toISOString() }
		);

		return result;
	} catch (error) {
		console.error("Error sending room message:", error);
		throw error;
	}
}

// Get messages from a chat room
export async function getRoomMessages(roomId: string) {
	try {
		console.log(`Getting messages for room: ${roomId}`);
		const { databases } = await createAdminClient();

		// Get messages for this room
		const messages = await databases.listDocuments(
			DATABASE_ID,
			ROOM_MESSAGES_COLLECTION_ID,
			[
				Query.equal("roomId", roomId),
				Query.orderDesc("timestamp")
			]
		);

		return messages.documents;
	} catch (error) {
		console.error("Error getting room messages:", error);
		throw error;
	}
}
