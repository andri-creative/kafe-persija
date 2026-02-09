import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createCategory, getCategories } from "@/services/category.service";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;
    const created_by = formData.get("created_by") as string;

    // Validate required fields
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

    // Validate image file
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // Generate filename format: detikmenitjam-tgldbmntahun.webp
    const now = new Date();
    const filename = `${now.getSeconds()}${now.getMinutes()}${now.getHours()}-${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}.webp`;

    // Create directory path
    const uploadDir = path.join(process.cwd(), "public", "images", "category");

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating directory:", error);
    }

    const filePath = path.join(uploadDir, filename);

    // Convert image to WebP and save
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Convert to WebP with optimization
      await sharp(buffer)
        .webp({
          quality: 80,
          effort: 6,
        })
        .resize(800, 800, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .toFile(filePath);
    } catch (error) {
      console.error("Error processing image:", error);
      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 500 },
      );
    }

    // Prepare data for database
    const imageUrl = `/images/category/${filename}`;
    const categoryData = {
      name: name.trim(),
      image: imageUrl,
      created_by: parseInt(created_by) || 1,
    };

    // Create category in database
    const category = await createCategory(categoryData);

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: category,
        image: {
          url: imageUrl,
          filename: filename,
          path: filePath,
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
