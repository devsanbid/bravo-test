"use server";

import { NextRequest, NextResponse } from "next/server";
import { getMaterial, updateMaterial } from "@/controllers/StudyMaterialController";
import { getSession } from "@/lib/auth";

// GET /api/study-materials/update?id=123 - Get a study material by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }
    
    const material = await getMaterial(id);
    
    return NextResponse.json(material);
  } catch (error) {
    console.error("Error fetching study material:", error);
    return NextResponse.json(
      { error: "Failed to fetch study material" },
      { status: 500 }
    );
  }
}

// PATCH /api/study-materials/update?id=123 - Update a study material
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Material ID is required" },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File | null;
    
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (file) updateData.file = file;
    
    const updatedMaterial = await updateMaterial(id, updateData);
    
    return NextResponse.json(updatedMaterial);
  } catch (error) {
    console.error("Error updating study material:", error);
    return NextResponse.json(
      { error: "Failed to update study material" },
      { status: 500 }
    );
  }
}
