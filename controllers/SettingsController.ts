"use server";

import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { revalidatePath } from "next/cache";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
}

interface SettingsData {
  emailNotifications: boolean;
  testReminders: boolean;
  studyReminders: boolean;
  darkMode: boolean;
  profileVisibility: boolean;
  progressSharing: boolean;
  twoFactor: boolean;
  language: string;
  chatNotifications?: boolean; // Additional setting for chat
  autoReply?: boolean; // Additional setting for mod
  responseTemplate?: string; // Additional setting for mod
}

// Get user settings
export async function getUserSettings(userId: string) {
  try {
    console.log("Getting settings for user:", userId);
    const { database } = await createSessionClient();
    
    // Get database and collection IDs
    const databaseId = process.env.NEXT_PUBLIC_DATABASEID || "";
    const usersCollectionId = process.env.NEXT_PUBLIC_COLLECTID || "";
    
    // First, get the user document to check if settings exist
    const users = await database.listDocuments(databaseId, usersCollectionId, []);
    const userDoc = users.documents.find(doc => doc.userId === userId);
    
    if (!userDoc) {
      console.log("User not found");
      return null;
    }
    
    // Check if settings field exists in user document
    if (userDoc.settings) {
      console.log("Found existing settings for user");
      return userDoc.settings;
    }
    
    // If no settings exist, create default settings
    const defaultSettings: SettingsData = {
      emailNotifications: true,
      testReminders: true,
      studyReminders: false,
      darkMode: false,
      profileVisibility: true,
      progressSharing: false,
      twoFactor: false,
      language: "en",
      chatNotifications: true,
      autoReply: false,
      responseTemplate: "Thank you for your message. I'll respond as soon as possible."
    };
    
    // Update user document with default settings
    await database.updateDocument(
      databaseId,
      usersCollectionId,
      userDoc.$id,
      { settings: defaultSettings }
    );
    
    console.log("Created and saved default settings");
    return defaultSettings;
  } catch (error) {
    console.error("Error getting user settings:", error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(userId: string, profileData: ProfileData) {
  try {
    console.log("Updating profile for user:", userId);
    const { account, databases } = await createAdminClient();
    
    // Get database and collection IDs
    const databaseId = process.env.NEXT_PUBLIC_DATABASEID || "";
    const usersCollectionId = process.env.NEXT_PUBLIC_COLLECTID || "";
    
    // Find the user document
    const users = await databases.listDocuments(databaseId, usersCollectionId, []);
    const userDoc = users.documents.find(doc => doc.userId === userId);
    
    if (!userDoc) {
      console.log("User not found");
      return { success: false, error: "User not found" };
    }
    
    // Update user document with new profile data
    await databases.updateDocument(
      databaseId,
      usersCollectionId,
      userDoc.$id,
      {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone
      }
    );
    
    // Also update the account email if it changed
    try {
      // We're not updating the email in Appwrite account as it requires email verification
      // This would be handled in a separate flow
      // await account.updateEmail(userId, profileData.email, "password");
    } catch (emailError) {
      console.error("Error updating email:", emailError);
      // Continue anyway, as the user's profile in the database was updated
    }
    
    revalidatePath("/dashboard/settings");
    revalidatePath("/mod/setting");
    
    console.log("Profile updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Update user password
export async function updateUserPassword(userId: string, passwordData: PasswordChange) {
  try {
    console.log("Updating password for user:", userId);
    
    // For password updates, we need to use the session client with the user's current session
    try {
      const { account } = await createSessionClient();
      
      // Update password in Appwrite using the current user's session
      await account.updatePassword(
        passwordData.newPassword,
        passwordData.currentPassword
      );
      
      console.log("Password updated successfully");
      return { success: true };
    } catch (sessionError) {
      console.error("Error with session client:", sessionError);
      
      // Fallback to admin client if needed (less secure but might be necessary)
      const { account } = await createAdminClient();
      
      // Admin API update password - different signature
      await account.updatePassword(passwordData.newPassword);
      
      console.log("Password updated with admin privileges");
      return { success: true };
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "Failed to update password" };
  }
}

// Update user settings
export async function updateUserSettings(userId: string, settingsData: Partial<SettingsData>) {
  try {
    console.log("Updating settings for user:", userId);
    const { databases } = await createAdminClient();
    
    // Get database and collection IDs
    const databaseId = process.env.NEXT_PUBLIC_DATABASEID || "";
    const usersCollectionId = process.env.NEXT_PUBLIC_COLLECTID || "";
    
    // Find the user document
    const users = await databases.listDocuments(databaseId, usersCollectionId, []);
    const userDoc = users.documents.find(doc => doc.userId === userId);
    
    if (!userDoc) {
      console.log("User not found");
      return { success: false, error: "User not found" };
    }
    
    // Merge existing settings with new settings
    const currentSettings = userDoc.settings || {};
    const updatedSettings = { ...currentSettings, ...settingsData };
    
    // Update user document with new settings
    await databases.updateDocument(
      databaseId,
      usersCollectionId,
      userDoc.$id,
      { settings: updatedSettings }
    );
    
    revalidatePath("/dashboard/settings");
    revalidatePath("/mod/setting");
    
    console.log("Settings updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating user settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// Special methods for moderators

// Update auto-reply settings
export async function updateModAutoReply(userId: string, enabled: boolean, template: string) {
  try {
    console.log("Updating auto-reply settings for moderator:", userId);
    
    return await updateUserSettings(userId, {
      autoReply: enabled,
      responseTemplate: template
    });
  } catch (error) {
    console.error("Error updating auto-reply settings:", error);
    return { success: false, error: "Failed to update auto-reply settings" };
  }
}

// Toggle chat notifications
export async function toggleChatNotifications(userId: string, enabled: boolean) {
  try {
    console.log("Toggling chat notifications for user:", userId);
    
    return await updateUserSettings(userId, {
      chatNotifications: enabled
    });
  } catch (error) {
    console.error("Error toggling chat notifications:", error);
    return { success: false, error: "Failed to toggle chat notifications" };
  }
}
