import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveImage } from "@/lib/upload";

// GET ALL CATEGORIES
export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

// CREATE CATEGORY
export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    let imagePath: string | undefined;

    if (imageFile && imageFile.size > 0) {
      imagePath = await saveImage(imageFile, "images/categories");
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
        image: imagePath,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create category" },
      { status: 500 }
    );
  }
}
