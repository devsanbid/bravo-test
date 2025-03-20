"use server";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { ID, Query } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASEID || "";
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_COLLECTID || "";
const MESSAGE_COLLECTION_ID = process.env.MESSAGE_ID || "";

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

		// Add more specific error handling
		try {
			const { client } = await createSessionClient();
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
			return unsubscribe;
		} catch (subError) {
			console.error("Subscription error:", subError);
			throw subError;
		}
	} catch (error: any) {
		console.error("Error in subscribeToMessages:", error);
		// Return a dummy unsubscribe function to prevent errors
		return () => console.log("Dummy unsubscribe called");
	}
}
