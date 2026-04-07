import { NextRequest, NextResponse } from "next/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";
import { ImageHelperServer as ImageHelper } from "@/lib/image-helper.server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/* =====================
   GET BY ID
===================== */
export async function GET(_: NextRequest, { params }: RouteContext) {
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
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const imageFile = formData.get("image") as File | null;

    let imageUrl: string | undefined;

    if (imageFile instanceof File) {
      imageUrl = await ImageHelper.upload(imageFile, "category"); // Save filename only
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updated_by = parseInt(session.user.id);

    const category = await updateCategory(id, {
      name: name || undefined,
      image: imageUrl,
      updated_by,
    });

    // Emit socket event for real-time update
    if ((global as any).io) {
      (global as any).io.emit("menu_updated", { action: "category_updated", category });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

/* =====================
   DELETE
===================== */
export async function DELETE(_: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    await deleteCategory(id);

    // Emit socket event for real-time update
    if ((global as any).io) {
      (global as any).io.emit("menu_updated", { action: "category_deleted", id });
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    if (error.message === "CATEGORY_NOT_FOUND") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    if (error.message === "CATEGORY_IN_USE") {
      return NextResponse.json(
        { error: "Cannot delete category because it is being used by products" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}