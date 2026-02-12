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

/* =====================
   UPDATE
===================== */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const category = await updateCategory(id, body);

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
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