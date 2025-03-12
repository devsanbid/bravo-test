import { databases, storage } from '@/lib/appwrite/config';
import { ID } from 'appwrite';

export class StudyMaterialController {
  private static readonly DATABASE_ID = 'your_database_id';
  private static readonly COLLECTION_ID = 'study_materials';
  private static readonly BUCKET_ID = 'study_materials';

  static async createMaterial(title: string, description: string, category: string, file: File) {
    try {
      // Upload file to storage
      const fileUpload = await storage.createFile(
        this.BUCKET_ID,
        ID.unique(),
        file
      );

      // Create document with file reference
      return await databases.createDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        ID.unique(),
        {
          title,
          description,
          category,
          file_id: fileUpload.$id,
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      throw error;
    }
  }

  static async getMaterials() {
    try {
      return await databases.listDocuments(
        this.DATABASE_ID,
        this.COLLECTION_ID
      );
    } catch (error) {
      throw error;
    }
  }

  static async getMaterial(id: string) {
    try {
      return await databases.getDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        id
      );
    } catch (error) {
      throw error;
    }
  }

  static async deleteMaterial(id: string, fileId: string) {
    try {
      // Delete file from storage
      await storage.deleteFile(this.BUCKET_ID, fileId);
      
      // Delete document
      await databases.deleteDocument(
        this.DATABASE_ID,
        this.COLLECTION_ID,
        id
      );
    } catch (error) {
      throw error;
    }
  }
}