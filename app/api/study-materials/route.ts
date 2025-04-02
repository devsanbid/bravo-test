"use server";

import { NextRequest, NextResponse } from "next/server";
import { getMaterials, getMaterial, deleteMaterial } from "@/controllers/StudyMaterialController";

// GET /api/study-materials - Get all study materials
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category") || undefined;
    
    const materials = await getMaterials(limit, offset, category);
    
    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch study materials" },
      { status: 500 }
    );
  }
}

// DELETE /api/study-materials?id=123&fileId=456 - Delete a study material
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const fileId = searchParams.get("fileId");
    
    if (!id || !fileId) {
      return NextResponse.json(
        { error: "Material ID and File ID are required" },
        { status: 400 }
      );
    }
    
    await deleteMaterial(id, fileId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting study material:", error);
    return NextResponse.json(
      { error: "Failed to delete study material" },
      { status: 500 }
    );
  }
}
