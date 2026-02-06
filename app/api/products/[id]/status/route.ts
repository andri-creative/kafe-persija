import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // Validate status value
    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'active' or 'inactive'" },
        { status: 400 }
      );
    }

    // Update product status
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { status },
      select: { id: true, status: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product status:", error);
    return NextResponse.json(
      { error: "Failed to update product status" },
      { status: 500 }
    );
  }
}
