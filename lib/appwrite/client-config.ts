import { Client, Account, Databases, Storage, ID } from "appwrite";

// Get environment variables
const endpoint: string = process.env.NEXT_PUBLIC_ENDPOINT || "";
const projectId: string = process.env.NEXT_PUBLIC_PROJECTID || "";

// Validate required environment variables
if (!endpoint || !projectId) {
  console.error("Missing required Appwrite configuration. Check your environment variables.");
}

// Create and configure the client
const client = new Client();
try {
  client
    .setEndpoint(endpoint)
    .setProject(projectId);
    
  console.log("Appwrite client initialized successfully");
} catch (error) {
  console.error("Error initializing Appwrite client:", error);
}

// Initialize services
export const client_account = new Account(client);
export const client_databases = new Databases(client);
export const client_storage = new Storage(client);

// Export the client and ID utility
export { client, ID };
