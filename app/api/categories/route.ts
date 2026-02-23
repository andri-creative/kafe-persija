import { NextRequest, NextResponse } from "next/server";
import { createCategory, getCategories } from "@/services/category.service";
import { uploadFile } from "@/lib/file-upload";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const created_by = parseInt(session.user.id);

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 },
      );
    }

    if (!imageFile) {
      return NextResponse.json(
        { error: "Category image is required" },
        { status: 400 },
      );
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Upload file and get filename only
    const filename = await uploadFile(imageFile, "category", true);

    const categoryData = {
      name: name.trim(),
      image: filename, // Save only filename
      created_by: created_by,
    };

    const category = await createCategory(categoryData);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
        image: {
          filename: filename,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error in POST category:", error);

    if (error.message === "CATEGORY_EXISTS") {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
