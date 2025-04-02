import { NextRequest, NextResponse } from "next/server";
import { getStudyMaterialById } from "@/controllers/StudyMaterialController";
import { validateSession } from "@/lib/server/session";

export async function GET(request: NextRequest) {
  try {
    // Validate user session
    const session = await validateSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get the study material ID from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Study material ID is required" },
        { status: 400 }
      );
    }

    // Fetch the study material by ID
    const material = await getStudyMaterialById(id);

    if (!material) {
      return NextResponse.json(
        { error: "Study material not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error fetching study material:", error);
    return NextResponse.json(
      { error: "Failed to fetch study material" },
      { status: 500 }
    );
  }
}
