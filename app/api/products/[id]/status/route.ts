import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    const { status } = await req.json();

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value. Must be 'active' or 'inactive'" },
        { status: 400 }
      );
    }

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
