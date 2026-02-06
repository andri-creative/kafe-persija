import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const categoryId = url.searchParams.get("category_id")
      ? Number(url.searchParams.get("category_id"))
      : undefined;

    const products = await prisma.product.findMany({
      where: {
        name: search ? { contains: search, mode: "insensitive" } : undefined,
        status: status || undefined,
        categories: categoryId
          ? {
              some: { category_id: categoryId },
            }
          : undefined,
      },
      include: {
        categories: {
          include: { category: true },
        },
        variants: {
          include: {
            images: true,
          },
        },
        promos: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, status, category_ids } = body;

    if (!name || !status) {
      return NextResponse.json(
        { message: "Name & status required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
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
        variants: {
          include: {
            images: true,
          },
        },
        promos: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 },
    );
  }
}
