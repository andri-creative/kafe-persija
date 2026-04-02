import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        
        const where: any = {};
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { code_promo: { contains: search } },
            ];
        }

        const promos = await prisma.promo.findMany({
            where,
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json(promos);
    } catch (error) {
        console.error("Error fetching promos:", error);
        return NextResponse.json({ error: "Failed to fetch promos" }, { status: 500 });
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
        
        // Map from Frontend Payload to Prisma 'promo' table fields
        const { 
            name, code_promo, type, value, description, 
            min_order, max_usage, start_date, end_date, 
            is_active, all_product, image 
        } = body;

        if (!name || !code_promo || !type || value === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const newPromo = await prisma.promo.create({
            data: {
                title: name,
                code_promo,
                type,
                value: Number(value),
                desc: description || null,
                min_order: Number(min_order) || 0,
                max_usage: Number(max_usage) || 1000,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                status: is_active ? "active" : "inactive",
                all_product: all_product ?? true,
                image: image || null,
                created_by: creator.id,
                updated_by: creator.id
            }
        });

        return NextResponse.json(newPromo, { status: 201 });
    } catch (error: any) {
        console.error("Error creating promo:", error);
        return NextResponse.json({ 
            error: "Failed to create promo", 
            details: error.message 
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { 
            id, name, code_promo, type, value, description, 
            min_order, max_usage, start_date, end_date, 
            is_active, all_product, image 
        } = body;

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const updatedPromo = await prisma.promo.update({
            where: { id: Number(id) },
            data: {
                title: name,
                code_promo,
                type,
                value: Number(value),
                desc: description || null,
                min_order: Number(min_order) || 0,
                max_usage: Number(max_usage) || 1000,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                status: is_active ? "active" : "inactive",
                all_product: all_product ?? true,
                image: image || null
            }
        });

        return NextResponse.json(updatedPromo);
    } catch (error: any) {
        console.error("Error updating promo:", error);
        return NextResponse.json({ error: "Failed to update promo" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await prisma.promo.delete({
            where: { id: Number(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting promo:", error);
        return NextResponse.json({ error: "Failed to delete promo" }, { status: 500 });
    }
}
