import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";

type Params = {
  params: Promise<{ id: string }>;
};

/* =====================
   GET BY ID
===================== */
export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const category = await getCategoryById(id);
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}

import { saveImage } from "@/lib/upload";

/* =====================
   UPDATE
===================== */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (imageFile instanceof File) {
      imageUrl = await saveImage(imageFile, "images/category");
    }

    const category = await updateCategory(id, {
      name: name || undefined,
      image: imageUrl,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

/* =====================
   DELETE
===================== */
export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}