import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  try {
    const trxId = Number(params.id);

    const trx = await prisma.transaction.findUnique({
      where: { id: trxId },
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

    if (!trx) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    const formatted = {
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
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch transaction" }, { status: 500 });
  }
}
