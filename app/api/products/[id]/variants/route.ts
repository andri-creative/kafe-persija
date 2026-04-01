import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ImageHelperServer as ImageHelper } from "@/lib/image-helper.server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Get all variants for a product
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);

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
        created_at: "desc",
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

// POST:
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);
    const formData = await request.formData();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const created_by = parseInt(session.user.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const desc = formData.get("desc") as string;
    const price = formData.get("price") as string;
    const stok = formData.get("stok") as string;
    const size = formData.get("size") as string;

    let imageFiles = formData.getAll("images") as File[];
    if (imageFiles.length === 0) {
      const keyCheck = formData.getAll("image") as File[];
      if (keyCheck.length > 0) {
        imageFiles = keyCheck;
      }
    }

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

    const variant = await prisma.product_variants.create({
      data: {
        product_id: productId,
        desc,
        price: parseInt(price),
        stok: stok ? parseInt(stok) : 0,
        size: size || null,
        created_by,
      },
    });

    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file.size > 0) {
          const imagePath = await ImageHelper.upload(file, "variant");
          if (imagePath) {
            await prisma.product_variant_images.create({
              data: {
                product_variant_id: variant.id,
                image: imagePath,
                created_by,
              },
            });
          }
        }
      }
    }

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
