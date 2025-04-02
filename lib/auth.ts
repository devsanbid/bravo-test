import { cookies } from "next/headers";
import { createAdminClient } from "./server/appwrite";
import { Query } from "appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASEID || "";
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "";

export async function getSession() {
  try {
    // Get the cookie store
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get("appwrite_session");
    
    if (!sessionCookie) {
      return null;
    }
    
    const { databases } = await createAdminClient();
    
    // Get the user from the session
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.limit(1)]
    );
    
    if (users.documents.length === 0) {
      return null;
    }
    
    const user = users.documents[0];
    
    return {
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    return null;
  }
  
  return session.user;
}

export async function requireModeratorRole() {
  const user = await requireAuth();
  
  if (!user || user.role !== "moderator") {
    return null;
  }
  
  return user;
}
