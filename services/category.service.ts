import prisma from "@/lib/prisma";

/* =====================
   TYPES
===================== */
export interface CreateCategoryInput {
  name: string;
  image?: string | null;
  created_by: number;
}

export interface UpdateCategoryInput {
  name?: string;
  image?: string | null;
  updated_by?: Number | null;
}

/* =====================
   CREATE
===================== */
export async function createCategory(data: CreateCategoryInput) {
  const existing = await prisma.product_category.findFirst({
    where: { name: data.name },
  });

  if (existing) {
    throw new Error("CATEGORY_EXISTS");
  }

  return prisma.product_category.create({
    data: {
      name: data.name,
      image: data.image ?? null,
      created_by: Number(data.created_by),
      updated_by: null,
    },
  });
}

/* =====================
   GET ALL
===================== */
export async function getCategories() {
  const categories = await prisma.product_category.findMany({
    include: {
      _count: {
        select: { product_category_trx: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const creatorIds = Array.from(new Set(categories.map((c: any) => c.created_by)));
  const users = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, nickname: true },
  });

  const userMap = new Map(users.map((u: any) => [u.id, u.nickname]));

  return categories.map((c: any) => ({
    ...c,
    creator_name: userMap.get(c.created_by) || "Unknown",
    product_count: c._count.product_category_trx,
  }));
}


/* =====================
   GET BY ID
===================== */
export async function getCategoryById(id: string) {
  const category = await prisma.product_category.findUnique({
    where: { id: Number(id) },
  });

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  return category;
}

/* =====================
   UPDATE
===================== */

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  const existing = await getCategoryById(id);

  // If updating with new image, delete old one
  if (data.image && existing.image && data.image !== existing.image) {
    const { deleteFile } = await import('@/lib/file-upload');
    await deleteFile(existing.image, 'category'); // Pass type for filename-only format
  }

  return prisma.product_category.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      image: data.image,
      updated_by: data.updated_by ? Number(data.updated_by) : undefined,
      updated_at: new Date(),
    },
  });
}

/* =====================
   DELETE
===================== */
export async function deleteCategory(id: string) {
  const categoryId = Number(id);
  const category = await prisma.product_category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { product_category_trx: true },
      },
    },
  });

  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }

  if (category._count.product_category_trx > 0) {
    throw new Error("CATEGORY_IN_USE");
  }

  // Delete image file if exists
  if (category.image) {
    const { deleteFile } = await import("@/lib/file-upload");
    await deleteFile(category.image, "category"); // Pass type for filename-only format
  }

  return prisma.product_category.delete({
    where: { id: categoryId },
  });
}
