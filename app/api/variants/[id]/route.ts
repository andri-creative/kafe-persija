import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { ImageHelperServer as ImageHelper } from "@/lib/image-helper.server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET
export async function GET(
  request: NextRequest,
  { params }: RouteContext,
) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: "Build phase" });
  }

  try {
    const resolvedParams = await params;
    const variantId = parseInt(resolvedParams.id);

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

export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: "Build phase" });
  }

  try {
    const resolvedParams = await params;
    const variantId = parseInt(resolvedParams.id);
    const formData = await request.formData();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updated_by = parseInt(session.user.id);

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
    const stok = formData.get("stok") as string;
    const size = formData.get("size") as string;

    const removedImageIdsStr = formData.get("removedImageIds") as string;
    const newImageFiles = formData.getAll("images") as File[];

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

    if (removedImageIdsStr) {
      const idsToDelete = removedImageIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      if (idsToDelete.length > 0) {
        const imagesToDelete = await prisma.product_variant_images.findMany({
          where: {
            id: { in: idsToDelete },
            product_variant_id: variantId
          }
        });

        for (const img of imagesToDelete) {
          await ImageHelper.delete(img.image, "variant");
          await prisma.product_variant_images.delete({
            where: { id: img.id }
          });
        }
      }
    }

    if (newImageFiles && newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        if (file.size > 0) {
          const imagePath = await ImageHelper.upload(file, "variant");
          if (imagePath) {
            await prisma.product_variant_images.create({
              data: {
                product_variant_id: variantId,
                image: imagePath,
                created_by: updated_by,
              }
            });
          }
        }
      }
    }

    const updatedVariant = await prisma.product_variants.update({
      where: { id: variantId },
      data: {
        desc,
        price: parseInt(price),
        stok: stok ? parseInt(stok) : 0,
        size: size || null,
      },
    });


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

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const resolvedParams = await params;
    const variantId = parseInt(resolvedParams.id);

    const variant = await prisma.product_variants.findUnique({
      where: { id: variantId },
      include: {
        product_variant_images: true,
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (variant.product_variant_images.length > 0) {
      await ImageHelper.delete(variant.product_variant_images[0].image, "variant");
    }
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

// PATCH
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const resolvedParams = await params;
    const variantId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { status } = body;

    const existingVariant = await prisma.product_variants.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (status !== undefined) {
      const updatedVariant = await prisma.product_variants.update({
        where: { id: variantId },
        data: {
          status: status,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Variant status updated successfully",
        data: updatedVariant,
      });
    } else {
      return NextResponse.json({ error: "Status field is required" }, { status: 400 });
    }

  } catch (error) {
    console.error("Error updating variant status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update variant status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
