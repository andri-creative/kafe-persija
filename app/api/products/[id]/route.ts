import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteVariantImage, uploadVariantImage } from "@/lib/file-upload";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Get product by ID
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const params = await context.params;

    console.log("🚀 ~ GET ~ params:", params);

    const productId = parseInt(params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
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
          orderBy: {
            created_at: "asc",
          },
        },
      },
    });

    console.log("🚀 ~ GET ~ product:", product);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PUT: Update product
export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);
    const formData = await request.formData();

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const updated_by = parseInt(session.user.id);

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        product_category_trx: {
          include: { product_category: true },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    let formatCategories = formData.getAll("categories") as string[];
    if (formatCategories.length === 0) {
      const singleCategory = formData.get("category") as string;
      if (singleCategory) {
        formatCategories.push(singleCategory);
      }
    }

    if (!name || !status || formatCategories.length === 0) {
      return NextResponse.json(
        { error: "Nama, status, dan kategori harus diisi" },
        { status: 400 },
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description: description || null,
        status,
        updated_by,
      },
    });

    await prisma.product_category_trx.deleteMany({
      where: { product_id: productId },
    });
    for (const categoryName of formatCategories) {
      let category = await prisma.product_category.findFirst({
        where: { name: categoryName },
      });

      if (!category) {
        category = await prisma.product_category.create({
          data: {
            name: categoryName,
            created_by: updated_by,
          },
        });
      }

      await prisma.product_category_trx.create({
        data: {
          product_id: productId,
          category_id: category.id,
          created_by: updated_by,
        },
      });
    }

    const existingVariants = await prisma.product_variants.findMany({
      where: { product_id: productId },
      select: { id: true },
    });
    const existingVariantIds = existingVariants.map((v) => v.id);
    const processedVariantIds: number[] = [];

    let index = 0;
    while (true) {
      const idStr = formData.get(`variants[${index}][id]`) as string;
      const desc = formData.get(`variants[${index}][desc]`) as string;
      const priceStr = formData.get(`variants[${index}][price]`) as string;
      const stokStr = formData.get(`variants[${index}][stok]`) as string;
      const size = formData.get(`variants[${index}][size]`) as string;

      const removedImageIdsStr = formData.get(`variants[${index}][removedImageIds]`) as string;

      const newImageFiles = formData.getAll(`variants[${index}][images]`) as File[];

      // Fallback for old single image if needed (optional, but good for safety)
      // const singleImage = formData.get(`variants[${index}][image]`) as File;
      // if (singleImage && singleImage.size > 0 && newImageFiles.length === 0) newImageFiles.push(singleImage);


      if (!desc) {
        // If desc is missing but ID exists, maybe it's the end of list? 
        // But checking just 'desc' might be risky if there are gaps (though UI sends array). 
        // Assuming packed array from 0.
        if (!formData.has(`variants[${index}][desc]`)) break;
      }

      const price = parseInt(priceStr);
      const stok = stokStr ? parseInt(stokStr) : 0;
      const variantId = idStr ? parseInt(idStr) : null;

      let currentVariantId = variantId;

      if (variantId && existingVariantIds.includes(variantId)) {
        await prisma.product_variants.update({
          where: { id: variantId },
          data: {
            desc,
            price,
            stok,
            size: size || null,
          },
        });
        processedVariantIds.push(variantId);
      } else {
        const newVariant = await prisma.product_variants.create({
          data: {
            product_id: productId,
            desc,
            price,
            stok,
            size: size || null,
            created_by: updated_by,
          },
        });
        currentVariantId = newVariant.id;
      }

      if (currentVariantId) {

        if (removedImageIdsStr) {
          const idsToDelete = removedImageIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

          if (idsToDelete.length > 0) {
            const imagesToDelete = await prisma.product_variant_images.findMany({
              where: {
                id: { in: idsToDelete },
                product_variant_id: currentVariantId
              }
            });

            for (const img of imagesToDelete) {
              await deleteVariantImage(img.image);
              await prisma.product_variant_images.delete({
                where: { id: img.id }
              });
            }
          }
        }

        if (newImageFiles && newImageFiles.length > 0) {
          for (const file of newImageFiles) {
            if (file.size > 0) {
              const imagePath = await uploadVariantImage(file);
              if (imagePath) {
                await prisma.product_variant_images.create({
                  data: {
                    product_variant_id: currentVariantId,
                    image: imagePath,
                    created_by: updated_by,
                  }
                });
              }
            }
          }
        }
      }

      index++;
    }

    const variantsToDelete = existingVariantIds.filter(
      (id) => !processedVariantIds.includes(id)
    );

    for (const deleteId of variantsToDelete) {
      const images = await prisma.product_variant_images.findMany({
        where: { product_variant_id: deleteId }
      });
      for (const img of images) {
        await deleteVariantImage(img.image);
      }

      await prisma.product_variants.delete({
        where: { id: deleteId }
      });
    }


    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        product_variants: {
          include: {
            product_variant_images: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    for (const variant of product.product_variants) {
      for (const image of variant.product_variant_images) {
        await deleteVariantImage(image.image);
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const params = await context.params;
    const productId = parseInt(params.id);
    const body = await request.json();
    const updated_by = 1;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const { status } = body;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: status || undefined,
        updated_by,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
