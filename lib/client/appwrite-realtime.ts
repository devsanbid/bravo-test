"use client";

import { Client, Databases, Account, Models } from "appwrite";

// Initialize the Appwrite client for browser use
const client = new Client();

// These values need to be accessed at runtime in the browser
const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || "";
const projectId = process.env.NEXT_PUBLIC_PROJECTID || "";
const databaseId = process.env.NEXT_PUBLIC_DATABASEID || "";
const messageCollectionId = process.env.NEXT_PUBLIC_MESSAGE_ID || ""; // Match the variable name used in ChatController

client
  .setEndpoint(endpoint)
  .setProject(projectId);

console.log("Appwrite Realtime Client initialized with:", {
  endpoint,
  projectId,
  databaseId,
  messageCollectionId
});

/**
 * Subscribe to real-time message updates
 * @param callback Function to call when a new message is received
 * @returns Function to unsubscribe from updates
 */
export function subscribeToMessages(callback: (message: any) => void) {
  console.log("Setting up client-side message subscription");
  
  try {
    // Subscribe to all database events
    const subscriptionChannel = `databases.${databaseId}.collections.${messageCollectionId}.documents`;
    console.log("Subscribing to channel:", subscriptionChannel);
    
    // Subscribe to the messages collection for all document events
    const unsubscribe = client.subscribe(
      subscriptionChannel, // Subscribe to all events in this collection
      (response) => {
        console.log("Received realtime event:", response.events, response.payload);
        
        // Check for any document events (create, update, delete)
        if (response.events && response.payload) {
          // Only process if it's a document event from our collection
          if (response.events.some(event => 
            event.startsWith(`databases.${databaseId}.collections.${messageCollectionId}.documents`))) {
            console.log("New message event received:", response.payload.$id);
            callback(response.payload);
          }
        }
      }
    );
    
    console.log("Subscription set up successfully");
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up subscription:", error);
    // Return a dummy unsubscribe function
    return () => console.log("Dummy unsubscribe called");
  }
}

/**
 * Get the current user's session token
 * @returns The session token or null if not logged in
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const account = new Account(client);
    const session = await account.getSession('current');
    return session.$id;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Set the session token for authenticated requests
 * @param token The session token
 */
export function setSessionToken(token: string) {
  client.setSession(token);
}

export { client };
