"use server";
import { Client, Account, Databases, Storage } from "node-appwrite";
import { cookies } from "next/headers";

// Helper function to create a properly configured client
const createBaseClient = () => {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT || "")
    .setProject(process.env.NEXT_PUBLIC_PROJECTID || "")
    .setSelfSigned(true); // Enable this if using self-signed certificates
};

export async function createSessionClient() {
  const client = createBaseClient();

  const sessionName = `a_session_${process.env.NEXT_PUBLIC_PROJECTID}`;
  const session = (await cookies()).get(sessionName);

  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    client,
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    }
  };
}

export async function createAdminClient() {
  try {
    const client = createBaseClient();
    
    // Set API key
    const apiKey = process.env.APPWRITE_API_KEY || "";
    if (!apiKey) {
      throw new Error("Missing Appwrite API key");
    }
    
    client.setKey(apiKey);

    // Return services
    return {
      client,
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
      get storage() {
        return new Storage(client);
      }
    };
  } catch (error) {
    console.error("Error creating admin client:", error);
    throw error;
  }
}
