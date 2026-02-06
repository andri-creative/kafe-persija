import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveImage } from "@/lib/upload";

// GET all variants for a product
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    const variants = await prisma.productVariant.findMany({
      where: { product_id: productId },
      include: { images: true },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch variants" },
      { status: 500 },
    );
  }
}

// POST create a variant
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);
    const formData = await req.formData();

    const desc = formData.get("desc") as string | null;
    const price = formData.get("price") as string | null;
    const imageFile = formData.get("image") as File | null;

    if (!price)
      return NextResponse.json(
        { message: "Price is required" },
        { status: 400 },
      );

    const variant = await prisma.productVariant.create({
      data: {
        product_id: productId,
        desc: desc || undefined,
        price: Number(price),
        created_by: 1, // dummy admin id, ganti dengan auth user id
      },
    });

    // Upload image jika ada
    if (imageFile && imageFile.size > 0) {
      const imagePath = await saveImage(imageFile, "images/variants");
      await prisma.productVariantImage.create({
        data: {
          product_variant_id: variant.id,
          image: imagePath,
          created_by: 1,
        },
      });
    }

    const createdVariant = await prisma.productVariant.findUnique({
      where: { id: variant.id },
      include: { images: true },
    });

    return NextResponse.json(createdVariant, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create variant" },
      { status: 500 },
    );
  }
}

// PUT update variant
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const productId = Number(id);
    const variantId = Number(new URL(req.url).searchParams.get("variant_id"));

    const formData = await req.formData();
    const desc = formData.get("desc") as string | null;
    const price = formData.get("price") as string | null;
    const imageFile = formData.get("image") as File | null;

    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        desc: desc || undefined,
        price: price ? Number(price) : undefined,
      },
    });

    // Upload new image jika ada
    if (imageFile && imageFile.size > 0) {
      const imagePath = await saveImage(imageFile, "images/variants");
      await prisma.productVariantImage.create({
        data: {
          product_variant_id: variant.id,
          image: imagePath,
          created_by: 1,
        },
      });
    }

    const updatedVariant = await prisma.productVariant.findUnique({
      where: { id: variant.id },
      include: { images: true },
    });

    return NextResponse.json(updatedVariant);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update variant" },
      { status: 500 },
    );
  }
}

// DELETE variant
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const variantId = Number(new URL(req.url).searchParams.get("variant_id"));

    // Hapus images dulu
    await prisma.productVariantImage.deleteMany({
      where: { product_variant_id: variantId },
    });

    // Hapus variant
    await prisma.productVariant.delete({ where: { id: variantId } });

    return NextResponse.json({ message: "Variant deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete variant" },
      { status: 500 },
    );
  }
}
