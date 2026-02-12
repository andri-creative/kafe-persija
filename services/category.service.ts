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
  return prisma.product_category.findMany({
    orderBy: { created_at: "desc" },
  });
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
  await getCategoryById(id);

  return prisma.product_category.update({
    where: { id: Number(id) },
    data: {
      name: data.name,
      image: data.image,
      updated_at: new Date(),
    },
  });
}

/* =====================
   DELETE
===================== */
export async function deleteCategory(id: string) {
  await getCategoryById(id); // validasi exists

  return prisma.product_category.delete({
    where: { id: Number(id) },
  });
}
