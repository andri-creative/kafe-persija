import { NextResponse, NextRequest } from "next/server";
import { getRoles, createRole } from "@/services/role.service";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all") === "true";

        if (all) {
            const data = await prisma.role.findMany({
                orderBy: { name: "asc" },
            });
            return NextResponse.json(data);
        }

        const page = Number(searchParams.get("page") || "1");
        const search = searchParams.get("search") || "";
        const roles = await getRoles(page, search);

        return NextResponse.json(roles);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.name?.trim()) {
            return NextResponse.json({ error: "Nama role wajib diisi" }, { status: 400 });
        }
        const role = await createRole(body);
        return NextResponse.json(role);
    } catch (error: any) {
        console.error("[API_ROLES_POST]", error);
        return NextResponse.json({ error: error.message || "Failed to create role" }, { status: 500 });
    }
}
