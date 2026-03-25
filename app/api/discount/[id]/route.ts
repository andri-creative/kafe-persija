import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const discount = await prisma.discount.findUnique({ where: { id: parseInt(id) } });
        if (!discount) return NextResponse.json({ error: "Discount not found" }, { status: 404 });
        return NextResponse.json(discount);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch discount" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, description, type, value, is_active } = body;

        // Try to get session for updated_by — not required (updated_by is nullable)
        let updatedById: number | undefined;
        try {
            const session = await getServerSession(authOptions);
            if (session?.user?.email) {
                const updater = await prisma.user.findUnique({ where: { email: session.user.email } });
                if (updater) updatedById = updater.id;
            }
        } catch { }

        const discount = await prisma.discount.update({
            where: { id: parseInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(type !== undefined && { type }),
                ...(value !== undefined && { value: Number(value) }),
                ...(is_active !== undefined && { is_active }),
                ...(updatedById !== undefined && { updated_by: updatedById }),
                updated_at: new Date(),
            },
        });

        return NextResponse.json(discount);
    } catch (error: any) {
        console.error("Error updating discount:", error);
        return NextResponse.json({ error: error.message || "Failed to update discount" }, { status: 500 });
    }
}


export async function DELETE(_: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        await prisma.discount.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ message: "Discount deleted" });
    } catch (error: any) {
        console.error("Error deleting discount:", error);
        return NextResponse.json({ error: error.message || "Failed to delete discount" }, { status: 500 });
    }
}
