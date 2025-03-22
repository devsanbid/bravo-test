"use client";

import { Client } from "appwrite";

// Create a client-side only Appwrite client
let client: Client;

// Initialize the client only on the client side to avoid serialization issues
if (typeof window !== 'undefined') {
  client = new Client();
  
  // These values need to be accessed at runtime in the browser
  const endpoint = process.env.NEXT_PUBLIC_ENDPOINT || "";
  const projectId = process.env.NEXT_PUBLIC_PROJECTID || "";
  
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
    
  console.log("Gallery Realtime Client initialized");
}

// Collection IDs for gallery
const databaseId = process.env.NEXT_PUBLIC_DATABASEID || "";
const galleryCollectionId = process.env.NEXT_PUBLIC_GALLERY_ID || "";

/**
 * Subscribe to real-time gallery updates
 * @param callback Function to call when a gallery item is created, updated, or deleted
 * @returns Function to unsubscribe from updates
 */
export function subscribeToGallery(callback: (galleryItem: any, eventType: string) => void) {
  console.log("Setting up client-side gallery subscription");
  
  try {
    // Subscribe to all database events for the gallery collection
    const subscriptionChannel = `databases.${databaseId}.collections.${galleryCollectionId}.documents`;
    console.log("Subscribing to gallery channel:", subscriptionChannel);
    
    // Subscribe to the gallery collection for all document events
    const unsubscribe = client.subscribe(
      subscriptionChannel,
      (response: any) => {
        console.log("Received gallery realtime event:", response.events, response.payload);
        
        // Check for any document events (create, update, delete)
        if (response.events && response.payload) {
          // Only process if it's a document event from our collection
          const relevantEvents = response.events.filter((event: string) => 
            event.startsWith(`databases.${databaseId}.collections.${galleryCollectionId}.documents`)
          );
          
          if (relevantEvents.length > 0) {
            console.log("Gallery event received:", response.payload.$id);
            
            // Determine the event type (create, update, delete)
            let eventType = "unknown";
            if (relevantEvents.some((e: string) => e.includes(".create"))) {
              eventType = "create";
            } else if (relevantEvents.some((e: string) => e.includes(".update"))) {
              eventType = "update";
            } else if (relevantEvents.some((e: string) => e.includes(".delete"))) {
              eventType = "delete";
            }
            
            callback(response.payload, eventType);
          }
        }
      }
    );
    
    return () => {
      console.log("Unsubscribing from gallery updates");
      unsubscribe();
    };
  } catch (error) {
    console.error("Error setting up gallery subscription:", error);
    return () => {}; // Return empty function as fallback
  }
}
