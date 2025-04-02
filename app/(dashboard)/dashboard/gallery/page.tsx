"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageCard } from "@/components/ui/ImageCard";
// Using fetch API instead of direct server imports
import { useAuthStore } from "@/lib/stores/auth_store";
import { subscribeToGallery } from "@/lib/client/gallery-realtime";

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
  // Get authentication state
  const authStore = useAuthStore();

  // Process a gallery item to include the image URL
  const processGalleryItem = (item: any) => ({
    $id: item.$id,
    title: item.title,
    description: item.description,
    imageId: item.imageId,
    imageUrl: item.imageUrl || `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_BUCKETID}/files/${item.imageId}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}`
  });

  // Fetch initial gallery images using API route
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true);
        const response = await fetch('/api/gallery?limit=25&offset=0');
        
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        
        const processedImages = await response.json();
        setImages(processedImages);
        console.log("images: ", processedImages)
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images");
      } finally {
        setLoading(false);
      }
    }
    
    fetchImages();
  }, []);
  
  // Set up real-time listener for gallery updates
  useEffect(() => {
    console.log("Setting up real-time gallery subscription");
    
    // Use the client-side implementation for real-time updates
    const unsubscribe = subscribeToGallery((galleryItem, eventType) => {
      console.log(`Real-time gallery ${eventType} event received:`, galleryItem);
      
      if (eventType === "create") {
        // Add the new gallery item
        setImages((prevItems) => {
          // Check if item with this ID already exists
          if (prevItems.some(item => item.$id === galleryItem.$id)) {
            return prevItems;
          }
          
          // Process and add the new item
          const processedItem = processGalleryItem(galleryItem);
          return [processedItem, ...prevItems];
        });
        
        toast.success("New image added to gallery!");
      } 
      else if (eventType === "update") {
        // Update an existing gallery item
        setImages((prevItems) => {
          return prevItems.map(item => {
            if (item.$id === galleryItem.$id) {
              return processGalleryItem(galleryItem);
            }
            return item;
          });
        });
      } 
      else if (eventType === "delete") {
        // Remove a deleted gallery item
        setImages((prevItems) => {
          return prevItems.filter(item => item.$id !== galleryItem.$id);
        });
      }
    });
    
    // Clean up subscription when component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gallery</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p className="text-gray-500">No images available in the gallery.</p>
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
              isMod={false}
              imageUrls={images.map((img) => img.imageUrl)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
