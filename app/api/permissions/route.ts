import { NextResponse, NextRequest } from "next/server";
import { getPermissions, createPermission } from "@/services/permission.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const all = searchParams.get("all") === "true";

        if (all) {
            const data = await prisma.permission.findMany({
                orderBy: { name: "asc" },
            });
            return NextResponse.json(data);
        }

        const page = Number(searchParams.get("page") ?? "1");
        const search = searchParams.get("search") ?? "";
        const result = await getPermissions(page, search);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[API_PERMISSIONS_GET]", error);
        return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const permission = await createPermission(body);
        return NextResponse.json(permission);
    } catch (error: any) {
        console.error("[API_PERMISSIONS_POST]", error);
        return NextResponse.json({ error: error.message || "Failed to create permission" }, { status: 500 });
    }
}
