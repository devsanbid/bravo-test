import { databases } from '@/lib/appwrite/config';
import { ID } from 'appwrite';

export class AdminController {
  private static readonly DATABASE_ID = 'your_database_id';
  private static readonly USERS_COLLECTION = 'users';
  private static readonly ROLES_COLLECTION = 'roles';

  static async getAllUsers() {
    try {
      return await databases.listDocuments(
        this.DATABASE_ID,
        this.USERS_COLLECTION
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateUserRole(userId: string, role: 'admin' | 'moderator' | 'student') {
    try {
      return await databases.updateDocument(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        userId,
        { role }
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      await databases.deleteDocument(
        this.DATABASE_ID,
        this.USERS_COLLECTION,
        userId
      );
    } catch (error) {
      throw error;
    }
  }

  static async getUserStats() {
    try {
      const users = await this.getAllUsers();
      return {
        total: users.total,
        admins: users.documents.filter(user => user.role === 'admin').length,
        moderators: users.documents.filter(user => user.role === 'moderator').length,
        students: users.documents.filter(user => user.role === 'student').length
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserActivity(userId: string) {
    try {
      // Get user's test attempts, study materials access, etc.
      const [testAttempts, materialAccess] = await Promise.all([
        databases.listDocuments(
          this.DATABASE_ID,
          'test_attempts',
          [databases.equal('user_id', userId)]
        ),
        databases.listDocuments(
          this.DATABASE_ID,
          'material_access',
          [databases.equal('user_id', userId)]
        )
      ]);

      return {
        testAttempts: testAttempts.documents,
        materialAccess: materialAccess.documents
      };
    } catch (error) {
      throw error;
    }
  }
}