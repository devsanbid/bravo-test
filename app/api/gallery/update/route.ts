"use server";

import { NextRequest, NextResponse } from "next/server";
import { updateImage, getImageById } from "@/controllers/GalleryController";

// PUT /api/gallery/update?id=123 - Update a gallery image
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }
    
    const result = await updateImage(id, {
      title,
      description,
      file: file || undefined
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { error: "Failed to update gallery image" },
      { status: 500 }
    );
  }
}

// GET /api/gallery/update?id=123 - Get a specific gallery image
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }
    
    const image = await getImageById(id);
    
    // Add the image URL
    const processedImage = {
      ...image,
      imageUrl: image.imageUrl || `${process.env.NEXT_PUBLIC_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_BUCKETID}/files/${image.imageId}/view?project=${process.env.NEXT_PUBLIC_PROJECTID}`
    };
    
    return NextResponse.json(processedImage);
  } catch (error) {
    console.error("Error fetching gallery image:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery image" },
      { status: 500 }
    );
  }
}
