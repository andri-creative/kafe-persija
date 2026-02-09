import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadVariantImage, deleteVariantImage } from "@/lib/path-img";

// GET: Get variant by ID
export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    console.log("🚀 ~ GET ~ params:", params);
    const variantId = parseInt(params.id);

    const variant = await prisma.product_variants.findUnique({
      where: { id: variantId },
      include: {
        product_variant_images: true,
        product: {
          include: {
            product_category_trx: {
              include: {
                product_category: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Error fetching variant:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant" },
      { status: 500 },
    );
  }
}

// PUT: Update variant
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const params = await context.params;
    const variantId = parseInt(params.id);
    const formData = await request.formData();
    const updated_by = 1;

    // Check if variant exists
    const existingVariant = await prisma.product_variants.findUnique({
      where: { id: variantId },
      include: {
        product_variant_images: true,
      },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Parse data
    const desc = formData.get("desc") as string;
    const price = formData.get("price") as string;
    const imageFile = formData.get("image") as File;
    const removeImage = formData.get("removeImage") === "true";

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

    // Handle image removal
    if (removeImage && existingVariant.product_variant_images.length > 0) {
      await deleteVariantImage(existingVariant.product_variant_images[0].image);
      await prisma.product_variant_images.deleteMany({
        where: { product_variant_id: variantId },
      });
    }

    // Upload new image if exists
    let imagePath = null;
    if (imageFile && imageFile.size > 0) {
      // Delete old image if exists
      if (existingVariant.product_variant_images.length > 0) {
        await deleteVariantImage(
          existingVariant.product_variant_images[0].image,
        );
        await prisma.product_variant_images.deleteMany({
          where: { product_variant_id: variantId },
        });
      }

      imagePath = await uploadVariantImage(imageFile);
    }

    // Update variant
    const updatedVariant = await prisma.product_variants.update({
      where: { id: variantId },
      data: {
        desc,
        price: parseInt(price),
      },
    });

    // Create variant image record if new image
    if (imagePath) {
      await prisma.product_variant_images.create({
        data: {
          product_variant_id: variantId,
          image: imagePath,
          created_by: updated_by,
        },
      });
    }

    // Get updated data
    const completeVariant = await prisma.product_variants.findUnique({
      where: { id: variantId },
      include: {
        product_variant_images: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Variant updated successfully",
      data: completeVariant,
    });
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update variant",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE: Delete variant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const variantId = parseInt(params.id);

    // Check if variant exists
    const variant = await prisma.product_variants.findUnique({
      where: { id: variantId },
      include: {
        product_variant_images: true,
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Delete image from storage
    if (variant.product_variant_images.length > 0) {
      await deleteVariantImage(variant.product_variant_images[0].image);
    }

    // Delete variant (cascade will delete variant_images)
    await prisma.product_variants.delete({
      where: { id: variantId },
    });

    return NextResponse.json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete variant",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
