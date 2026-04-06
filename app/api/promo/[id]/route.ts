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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ error: "ID Promo wajib ada untuk update!" }, { status: 400 });
        }

        const title = body.title || body.name;
        const code_promo = body.code_promo || body.code;
        
        const updateData: any = {};
        if (title) updateData.title = title;
        if (code_promo) updateData.code_promo = code_promo;
        if (body.type) updateData.type = body.type;
        if (body.value !== undefined) updateData.value = Number(body.value);
        
        if (body.status) {
            updateData.status = body.status;
        } else if (body.is_active !== undefined) {
            updateData.status = body.is_active ? 'active' : 'inactive';
        }

        if (body.desc || body.description) updateData.desc = body.desc || body.description;
        if (body.start_date) updateData.start_date = new Date(body.start_date);
        if (body.end_date) updateData.end_date = new Date(body.end_date);
        if (body.min_order !== undefined) updateData.min_order = Number(body.min_order);
        if (body.max_usage !== undefined) updateData.max_usage = Number(body.max_usage);
        if (body.all_product !== undefined) updateData.all_product = body.all_product;
        if (body.updated_by) updateData.updated_by = Number(body.updated_by);

        const updated = await prisma.promo.update({
            where: { id: Number(id) },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("Update Promo Error:", error);
        return NextResponse.json({ error: "Gagal memperbarui promo", message: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ error: "ID Promo wajib ada untuk menghapus!" }, { status: 400 });
        }

        await prisma.promo.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ message: "Promo berhasil dihapus" });
    } catch (error: any) {
        console.error("Delete Promo Error:", error);
        return NextResponse.json({ error: "Gagal menghapus promo", message: error.message }, { status: 500 });
    }
}
