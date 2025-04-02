"use server";

import { NextRequest, NextResponse } from "next/server";
import { getImages, getImageById, deleteImage } from "@/controllers/GalleryController";

// GET /api/gallery - Get all gallery images
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const images = await getImages(limit, offset);
    
    // Process images to include URLs
    const processedImages = images.map((img) => {
      // Make sure we have a valid image URL
      let imageUrl = img.imageUrl;
      
      // If no imageUrl is provided, construct it from the imageId
      if (!imageUrl && img.imageId) {
        imageUrl = `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_BUCKETID}/files/${img.imageId}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}`;
      }
      
      return {
        $id: img.$id,
        title: img.title,
        description: img.description,
        imageId: img.imageId,
        imageUrl: imageUrl
      };
    });
    
    return NextResponse.json(processedImages);
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery?id=123 - Delete a gallery image
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }
    
    await deleteImage(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { error: "Failed to delete gallery image" },
      { status: 500 }
    );
  }
}
