import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveImage } from "@/lib/upload";
import fs from "fs";
import path from "path"


// GET CATEGORY BY ID
export async function GET(req: Request,  context: { params: Promise<{ id: string }> }) {
  try {
const { id } = await context.params;
  const categoryId = Number(id);

  const category = await prisma.productCategory.findUnique({
    where: { id: categoryId },
  });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch category" },
      { status: 500 },
    );
  }
}

// UPDATE CATEGORY
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    let imagePath = category.image;

    if (imageFile && imageFile.size > 0) {
      if (category.image) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          category.image
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      imagePath = await saveImage(imageFile, "images/categories");
    }

    const updated = await prisma.productCategory.update({
      where: { id: categoryId },
      data: {
        name,
        image: imagePath,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE CATEGORY
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const categoryId = Number(id);

    await prisma.productCategory.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 },
    );
  }
}
