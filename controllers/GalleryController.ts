import { ID, Query } from "appwrite";
import { client_databases, client_storage } from "@/lib/appwrite/client-config";
import { createAdminClient } from "@/lib/server/appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASEID || "";
const COLLECTION_ID = process.env.NEXT_PUBLIC_GALLERY_ID || "";
const BUCKET_ID = process.env.NEXT_PUBLIC_BUCKETID || "";

export async function uploadImage(
	file: File,
	title: string,
	description: string,
	userId: string,
) {
	console.log("File received:", file, file instanceof File);

	if (!file || !title || !description || !userId) {
		throw new Error("Missing required fields");
	}

	try {
		const imageUpload = await client_storage.createFile(BUCKET_ID, ID.unique(), file);

		// Create document with image reference
		return await client_databases.createDocument(
			DATABASE_ID,
			COLLECTION_ID,
			ID.unique(),
			{
				title,
				description,
				imageId: imageUpload.$id,
				createdAt: new Date().toISOString(),
				userId,
			},
		);
	} catch (error) {
		throw error;
	}
}


export async function getImages(limit = 25, offset = 0) {
	try {

		const results = await client_databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
			Query.limit(25),
		]);
		return results.documents;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

//get image by id
export async function getImageById(id: string) {
	try {

		const image = await client_databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
		return image;
	} catch (error) {
		console.error("Error getting image by ID:", error);
		throw error; // Might want to handle 404 specifically
	}
}

export async function updateImage(id: string, data: {title: string, description: string, file?: File}) {
	try {
    let imageId = data.file ? (await client_storage.createFile(BUCKET_ID, ID.unique(), data.file)).$id : undefined;

    if(imageId){
      const currentImage = await getImageById(id);
      await client_storage.deleteFile(BUCKET_ID, currentImage.imageId)
    }
    const updateData = imageId ? {
      title: data.title,
      description: data.description,
      imageId: imageId
    } : {
      title: data.title,
      description: data.description,
    }

		return await client_databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, updateData);

	} catch (error) {
		throw error;
	}
}

export async function deleteImage(id: string) {
	try {
		const currentImage = await getImageById(id);

		// Delete image from storage
		await client_storage.deleteFile(BUCKET_ID, currentImage.imageId);

		// Delete document
		await client_databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
	} catch (error) {
		throw error;
	}
}
