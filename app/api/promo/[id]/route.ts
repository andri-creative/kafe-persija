import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        
        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const promo = await prisma.promo.findUnique({
            where: { id: Number(id) }
        });

        if (!promo) {
            return NextResponse.json({ error: "Promo not found" }, { status: 404 });
        }

        return NextResponse.json(promo);
    } catch (error) {
        console.error("Error fetching promo by ID:", error);
        return NextResponse.json({ error: "Failed to fetch promo" }, { status: 500 });
    }
}
