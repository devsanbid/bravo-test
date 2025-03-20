"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ImageCard } from "@/components/ui/ImageCard";
import { toast } from "sonner";
import { getImages, deleteImage, getImagesLink } from "@/controllers/GalleryController";

interface ImageInterface {
  $id: string;
  title: string;
  description: string;
  imageId: string;
  imageUrl: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        const fetchedImages = await getImages(25, 0);
        console.log("fetchedImages")
        setImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images");
      } finally {
        setLoading(false);
      }
    }
    
    fetchImages();
  }, []);

  const handleDelete = async (imageId: string) => {
    try {
      await deleteImage(imageId);
      setImages(images.filter((img) => img.$id !== imageId));
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image.");
    }
  };


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gallery</h1>
        <Button onClick={() => router.push("/mod/gallery/create")}>
          Upload Image
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p className="text-gray-500">No images found. Upload your first image!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image: ImageInterface) => (
            <ImageCard
              key={image.$id}
              imageId={image.$id}
              title={image.title}
              description={image.description}
              imageUrl={image.imageUrl}
              onUpdate={(imageId) =>
                router.push(`/mod/gallery/update/${imageId}`)
              }
              onDelete={handleDelete}
              isMod={true}
              imageUrls={images.map((img) => img.imageUrl)}
              cacheBuster={Date.now().toString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
