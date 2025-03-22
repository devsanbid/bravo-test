"use server";

import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/controllers/GalleryController";

// POST /api/gallery/upload - Upload a new gallery image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const userId = formData.get("userId") as string;
    
    if (!file || !title || !description || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const result = await uploadImage(file, title, description, userId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    return NextResponse.json(
      { error: "Failed to upload gallery image" },
      { status: 500 }
    );
  }
}
