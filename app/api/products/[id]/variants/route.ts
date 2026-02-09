import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadVariantImage } from "@/lib/path-img";

// GET: Get all variants for a product
export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variants = await prisma.product_variants.findMany({
      where: { product_id: productId },
      include: {
        product_variant_images: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 },
    );
  }
}

// POST: Add new variant to product
export async function POST(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);
    const formData = await request.formData();
    const created_by = 1;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Parse data
    const desc = formData.get("desc") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File;

    // Validation
    if (!desc || !price) {
      return NextResponse.json(
        { error: "Deskripsi dan harga harus diisi" },
        { status: 400 },
      );
    }

    if (Number(price) <= 0) {
      return NextResponse.json(
        { error: "Harga harus lebih dari 0" },
        { status: 400 },
      );
    }

    // Upload image if exists
    let imagePath = null;
    if (imageFile && imageFile.size > 0) {
      imagePath = await uploadVariantImage(imageFile);
    }

    // Create variant
    const variant = await prisma.product_variants.create({
      data: {
        product_id: productId,
        desc,
        price: parseInt(price),
        created_by,
      },
    });

    // Create variant image record
    if (imagePath) {
      await prisma.product_variant_images.create({
        data: {
          product_variant_id: variant.id,
          image: imagePath,
          created_by,
        },
      });
    }

    // Get complete variant data
    const completeVariant = await prisma.product_variants.findUnique({
      where: { id: variant.id },
      include: {
        product_variant_images: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Variant created successfully",
      data: completeVariant,
    });
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create variant",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
