import { databases } from '@/lib/appwrite/config';
import { ID } from 'appwrite';

export class UserController {
  private static readonly DATABASE_ID = 'your_database_id';
  private static readonly COLLECTION_ID = 'users';

  static async createUserProfile(userId: string, data: any) {
    try {
      return await databases.createDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        userId,
        {
          ...data,
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      return await databases.getDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        userId
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateUserProfile(userId: string, data: any) {
    try {
      return await databases.updateDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        userId,
        data
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      await databases.deleteDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        userId
      );
    } catch (error) {
      throw error;
    }
  }

  static async listUsers() {
    try {
      return await databases.listDocuments(
        this.DATABASE_ID,
        this.COLLECTION_ID
      );
    } catch (error) {
      throw error;
    }
  }
}