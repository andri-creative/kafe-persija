import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        categories: { include: { category: true } },
        variants: {
          include: {
            images: true,
          },
        },
        promos: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, description, status, category_ids } = body;

    // Hapus relasi category lama
    await prisma.productCategoryTrx.deleteMany({ where: { product_id: Number(id) } });

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        status,
        categories: category_ids
          ? {
              create: category_ids.map((categoryId: number) => ({
                category_id: categoryId,
              })),
            }
          : undefined,
      },
      include: {
        categories: { include: { category: true } },
        variants: true,
        promos: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.productCategoryTrx.deleteMany({ where: { product_id: Number(id) } });

    const variants = await prisma.productVariant.findMany({
      where: { product_id: Number(id) },
    });
    for (const v of variants) {
      await prisma.productVariantImage.deleteMany({
        where: { product_variant_id: v.id },
      });
    }
    await prisma.productVariant.deleteMany({ where: { product_id: Number(id) } });

    await prisma.promoProductTrx.deleteMany({ where: { product_id: Number(id) } });

    await prisma.product.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
