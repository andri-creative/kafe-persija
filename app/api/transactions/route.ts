import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET all transactions
export async function GET(req: Request) {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { created_at: "desc" },
      include: {
        user: { select: { nickname: true } },
        items: {
          include: {
            product: { select: { name: true } },
            variant: { select: { desc: true, price: true } },
          },
        },
      },
    });

    // Format response agar mudah di UI
    const formatted = transactions.map(trx => ({
      id: trx.id,
      user_name: trx.user.nickname,
      total: trx.total,
      status: trx.status,
      created_at: trx.created_at,
      items: trx.items.map(item => ({
        product_name: item.product.name,
        variant: item.variant.desc,
        qty: item.qty,
        price: item.price,
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch transactions" }, { status: 500 });
  }
}
