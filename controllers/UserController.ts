import { databases } from '@/lib/appwrite/config';
import { ID } from 'appwrite';

// creata a prime number finder function
const isPrime = (num: number) => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;  
}

// create a function to find the prime numbers in an array
const findPrimeNumbers = (arr: number[]) => {
  return arr.filter(isPrime);
};
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