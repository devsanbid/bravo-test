import { ID, Query } from 'appwrite';
import { createAdminClient } from '@/lib/server/appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASEID || "";
const COLLECTION_ID = process.env.NEXT_PUBLIC_STUDY_MATERIALS_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKETID || "";

export async function createMaterial(title: string, description: string, category: string, file: File, userId: string) {

  try {
    if (!file || !title || !description || !category || !userId) {
      throw new Error("Missing required fields");
    }

    const { databases, storage } = await createAdminClient();
    
    // Upload file to storage
    const fileUpload = await storage.createFile(BUCKET_ID, ID.unique(), file);
    
    // Generate the direct file URL
    const fileUrl = `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileUpload.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}`;
    
    // Create document with file reference
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        title,
        description,
        category,
        fileId: fileUpload.$id,
        fileUrl: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        createdAt: new Date().toISOString(),
        userId
      }
    );
  } catch (error) {
    console.error("Error creating study material:", error);
    throw error;
  }
}

export async function getMaterials(limit = 25, offset = 0, category?: string) {
  try {
    const { databases } = await createAdminClient();
    
    let queries = [
      Query.orderDesc('createdAt'),
      Query.limit(limit),
      Query.offset(offset)
    ];
    
    if (category) {
      queries.push(Query.equal('category', category));
    }
    
    const results = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      queries
    );
    
    return results.documents;
  } catch (error) {
    console.error("Error fetching study materials:", error);
    throw error;
  }
}

export async function getMaterial(id: string) {
  try {
    const { databases } = await createAdminClient();
    
    return await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
  } catch (error) {
    console.error(`Error fetching study material with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteMaterial(id: string, fileId: string) {
  try {
    const { databases, storage } = await createAdminClient();
    
    // Delete file from storage
    await storage.deleteFile(BUCKET_ID, fileId);
    
    // Delete document
    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting study material with ID ${id}:`, error);
    throw error;
  }
}

export async function updateMaterial(id: string, data: { title?: string; description?: string; category?: string; file?: File }) {
  try {
    const { databases, storage } = await createAdminClient();
    
    // Get the existing document
    const existingDoc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
    
    let updateData: any = {};
    
    // Update basic fields if provided
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    
    // If a new file is provided, upload it and update the reference
    if (data.file) {
      // Delete the old file if it exists
      if (existingDoc.fileId) {
        try {
          await storage.deleteFile(BUCKET_ID, existingDoc.fileId);
        } catch (error) {
          console.warn(`Could not delete old file ${existingDoc.fileId}:`, error);
        }
      }
      
      // Upload the new file
      const fileUpload = await storage.createFile(BUCKET_ID, ID.unique(), data.file);
      
      // Generate the direct file URL
      const fileUrl = `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileUpload.$id}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}`;
      
      // Update file-related fields
      updateData.fileId = fileUpload.$id;
      updateData.fileUrl = fileUrl;
      updateData.fileName = data.file.name;
      updateData.fileSize = data.file.size;
      updateData.fileType = data.file.type;
    }
    
    // Update the document
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id,
      updateData
    );
  } catch (error) {
    console.error(`Error updating study material with ID ${id}:`, error);
    throw error;
  }
}