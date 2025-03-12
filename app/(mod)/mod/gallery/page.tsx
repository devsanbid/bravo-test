"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { client_databases, client_storage } from "@/lib/appwrite/client-config";
import { ImageCard } from "@/components/ui/ImageCard";
import { toast } from "sonner";
import { deleteImage } from "@/controllers/GalleryController";

interface imageInterface {
	$id: string;
	title: string;
	description: string;
	imageId: string;
}

export default function GalleryPage() {
	const [images, setImages] = useState<imageInterface[]>([]);
	const router = useRouter();
	const [selectedImage, setSelectedImage] = useState(null);
	useEffect(() => {
		async function fetchImages() {
			try {
				const response = await client_databases.listDocuments(
					process.env.NEXT_PUBLIC_DATABASEID as string,
					process.env.NEXT_PUBLIC_GALLERY_ID as string,
				);
				console.log("running....");
				const fetchedImages = response.documents.map((doc) => ({
					$id: doc.$id,
					title: doc.title,
					description: doc.description,
					imageId: doc.imageId,
				}));
				setImages(fetchedImages);
			} catch (error) {
				console.error("Error fetching images:", error);
			}
		}
		fetchImages();
	}, []);

	return (
		<div className="p-4">
			<div className="flex justify-end mb-4">
				<Button onClick={() => router.push("/mod/gallery/create")}>
					Upload Image
				</Button>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{images.map((image: imageInterface) => (
					<ImageCard
						key={image.$id}
						imageId={image.$id}
						title={image.title}
						description={image.description}
						imageUrl={`${
							client_storage.getFileView(
								process.env.NEXT_PUBLIC_BUCKETID as string,
								image.imageId,
							).href
						}&project=${process.env.NEXT_PUBLIC_PROJECTID}&mode=admin`}
						onUpdate={(imageId) =>
							router.push(`/mod/gallery/update/${imageId}`)
						}
						onDelete={async (imageId) => {
							// Implement delete functionality here
							try {
								await deleteImage(imageId);
								setImages(images.filter((img) => img.$id !== imageId));
								toast.success("Image deleted successfully!");
							} catch (error) {
								console.error("Error deleting image:", error);
								toast.error("Failed to delete image.");
							}
						}}
						isMod={true}
						imageUrls={images.map(
							(img) =>
								`${
									client_storage.getFileView(
										process.env.NEXT_PUBLIC_BUCKETID as string,
										img.imageId,
									).href
								}&project=${process.env.NEXT_PUBLIC_PROJECTID}&mode=admin`,
						)}
						cacheBuster={Date.now().toString()}
					/>
				))}
			</div>
		</div>
	);
}
