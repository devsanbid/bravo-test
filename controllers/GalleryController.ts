import { ID, Query } from "node-appwrite";
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
		const { databases, storage } = await createAdminClient();
		const imageUpload = await storage.createFile(BUCKET_ID, ID.unique(), file);

		// Create document with image reference
		return await databases.createDocument(
			DATABASE_ID,
			COLLECTION_ID,
			ID.unique(),
			{
				title,
				description,
        imageUrl: await getImagesLink(imageUpload.$id),
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
		const { storage, databases } = await createAdminClient();
		const results = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
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
		const { databases, storage } = await createAdminClient();
		const image = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
		return image;
	} catch (error) {
		console.error("Error getting image by ID:", error);
		throw error; // Might want to handle 404 specifically
	}
}

export async function updateImage(
	id: string,
	data: { title: string; description: string; file?: File },
) {
	try {
		const { databases, storage } = await createAdminClient();
		let imageId = data.file
			? (await storage.createFile(BUCKET_ID, ID.unique(), data.file)).$id
			: undefined;

		if (imageId) {
			const currentImage = await getImageById(id);
			await storage.deleteFile(BUCKET_ID, currentImage.imageId);
		}
		const updateData = imageId
			? {
					title: data.title,
					description: data.description,
					imageId: imageId,
				}
			: {
					title: data.title,
					description: data.description,
				};

		return await databases.updateDocument(
			DATABASE_ID,
			COLLECTION_ID,
			id,
			updateData,
		);
	} catch (error) {
		throw error;
	}
}

export async function deleteImage(id: string) {
	try {
		const { databases, storage } = await createAdminClient();

		const currentImage = await getImageById(id);

		// Delete image from storage
		await storage.deleteFile(BUCKET_ID, currentImage.imageId);

		// Delete document
		await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
	} catch (error) {
		throw error;
	}
}

export async function getImagesLink(imageId: string) {
	try {
		const { storage } = await createAdminClient();
		const imageLink = await storage.getFileView(BUCKET_ID, imageId);
		return `${imageLink}.href&project=${process.env.NEXT_PUBLIC_PROJECTID}&mode=admin`;
	} catch (error) {
		throw error;
	}
}
