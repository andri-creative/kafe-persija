import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadVariantImage } from "@/lib/path-img";

// GET: Get semua products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Build filter
    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        product_category_trx: {
          include: {
            product_category: true,
          },
        },
        product_variants: {
          include: {
            product_variant_images: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Filter by category if specified
    let filteredProducts = products;
    if (category && category !== "all") {
      filteredProducts = products.filter((product) =>
        product.product_category_trx.some(
          (trx) => trx.product_category.name === category,
        ),
      );
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST: Create new product with variants
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const created_by = 1; // Ganti dengan user ID dari session/auth

    // Parse product data
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = (formData.get("status") as string) || "active";
    
    // Handle multiple categories
    let categories = formData.getAll("categories") as string[];
    
    // Fallback/Legacy support: check for "category" if "categories" is empty
    if (categories.length === 0) {
      const singleCategory = formData.get("category") as string;
      if (singleCategory) {
        categories.push(singleCategory);
      }
    }

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Nama produk harus diisi" },
        { status: 400 },
      );
    }

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Minimal satu kategori produk harus dipilih" },
        { status: 400 },
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        status,
        created_by,
      },
    });

    for (const categoryName of categories) {
      let category = await prisma.product_category.findFirst({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.product_category.create({
          data: {
            name: categoryName,
            created_by,
          },
        });
      }

      await prisma.product_category_trx.create({
        data: {
          product_id: product.id,
          category_id: category.id,
          created_by,
        },
      });
    }

    const variants: any[] = [];
    let index = 0;

    while (true) {
      const desc = formData.get(`variants[${index}][desc]`) as string;
      const price = formData.get(`variants[${index}][price]`) as string;
      const imageFile = formData.get(`variants[${index}][image]`) as File;

      if (!desc) break;

      if (!price || Number(price) <= 0) {
        await prisma.product.delete({ where: { id: product.id } });

        return NextResponse.json(
          { error: `Variant "${desc}" harus memiliki harga yang valid` },
          { status: 400 },
        );
      }

      variants.push({
        desc,
        price: parseInt(price),
        imageFile: imageFile && imageFile.size > 0 ? imageFile : null,
      });

      index++;
    }

    if (variants.length === 0) {
      await prisma.product.delete({ where: { id: product.id } });

      return NextResponse.json(
        { error: "Minimal satu variant diperlukan" },
        { status: 400 },
      );
    }

    for (const variant of variants) {
      let imagePath = null;

      if (variant.imageFile) {
        imagePath = await uploadVariantImage(variant.imageFile);
      }

      const createdVariant = await prisma.product_variants.create({
        data: {
          product_id: product.id,
          desc: variant.desc,
          price: variant.price,
          created_by,
        },
      });

      if (imagePath) {
        await prisma.product_variant_images.create({
          data: {
            product_variant_id: createdVariant.id,
            image: imagePath,
            created_by,
          },
        });
      }
    }

    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        product_category_trx: {
          include: { product_category: true },
        },
        product_variants: {
          include: { product_variant_images: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      data: completeProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
