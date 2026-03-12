import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const type = searchParams.get("type") || "";
        const is_active = searchParams.get("is_active");

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }
        if (type) where.type = type;
        if (is_active !== null && is_active !== "") {
            where.is_active = is_active === "true";
        }

        const discounts = await prisma.discount.findMany({
            where,
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json(discounts);
    } catch (error) {
        console.error("Error fetching discounts:", error);
        return NextResponse.json({ error: "Failed to fetch discounts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const creator = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!creator) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const body = await request.json();
        const { name, description, type, value, is_active } = body;

        if (!name || !type || value === undefined || value === null) {
            return NextResponse.json({ error: "Nama, tipe, dan nilai wajib diisi" }, { status: 400 });
        }

        const discount = await prisma.discount.create({
            data: {
                name,
                description: description || null,
                type,
                value: Number(value),
                is_active: is_active ?? true,
                created_by: creator.id,
            },
        });

        return NextResponse.json(discount, { status: 201 });
    } catch (error: any) {
        console.error("Error creating discount:", error);
        return NextResponse.json({ error: error.message || "Failed to create discount" }, { status: 500 });
    }
}