"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface FullScreenImageProps {
  imageUrl: string;
  title: string;
  description: string;
  imageUrls: string[];
  onClose: () => void;
}

export function FullScreenImage({ imageUrl, title, description, imageUrls, onClose }: FullScreenImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(imageUrls.indexOf(imageUrl));

  useEffect(() => {
    setCurrentImageIndex(imageUrls.indexOf(imageUrl));
  }, [imageUrl, imageUrls]);

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  return (
    <>
    <DialogTitle>{title}</DialogTitle>
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="relative">
        <Image
          src={imageUrls[currentImageIndex]}
          alt={title}
          width={800}
          height={600}
          className="max-w-screen-md max-h-screen object-contain rounded-lg"
          style={{maxWidth: '80vw', maxHeight: '80vh', outline: 'none'}}
        />
        <Button
          variant="ghost"
          className="absolute top-4 right-4 text-white hover:bg-gray-700 rounded-full p-2"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button variant="ghost" className="text-white hover:bg-gray-700 rounded-full p-2" onClick={goToPreviousImage}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="ghost" className="text-white hover:bg-gray-700 rounded-full p-2" onClick={goToNextImage}>
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute bottom-4 right-4 text-white">
            {currentImageIndex + 1} / {imageUrls.length}
        </div>
      </div>
    </div>
    </>
  );
}