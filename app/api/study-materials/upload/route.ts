"use server";

import { NextRequest, NextResponse } from "next/server";
import { createMaterial } from "@/controllers/StudyMaterialController";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File;
    
    if (!title || !description || !category || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const material = await createMaterial(
      title,
      description,
      category,
      file,
      session.user.id
    );
    
    return NextResponse.json(material);
  } catch (error) {
    console.error("Error creating study material:", error);
    return NextResponse.json(
      { error: "Failed to create study material" },
      { status: 500 }
    );
  }
}
