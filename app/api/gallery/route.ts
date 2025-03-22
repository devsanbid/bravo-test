"use server";

import { NextRequest, NextResponse } from "next/server";
import { getImages, getImageById, deleteImage, getImagesLink } from "@/controllers/GalleryController";

// GET /api/gallery - Get all gallery images
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    const images = await getImages(limit, offset);
    
    // Process images to include URLs
    const processedImages = await Promise.all(
      images.map(async (img) => ({
        $id: img.$id,
        title: img.title,
        description: img.description,
        imageId: img.imageId,
        imageUrl: img.imageUrl || `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_BUCKETID}/files/${img.imageId}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}`
      }))
    );
    
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
