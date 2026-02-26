import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createUser } from "@/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { nickname: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (type) where.type = type;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, email, password, type, status, role_id } = body;

    if (!nickname || !email || !password || !type) {
      return NextResponse.json(
        { error: "Nama, email, password, dan tipe wajib diisi" },
        { status: 400 }
      );
    }

    const user = await createUser({ nickname, email, password, type, status, role_id });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat akun" },
      { status: 500 }
    );
  }
}
