import { NextResponse, NextRequest } from "next/server";
import { syncRolePermissions, deleteRole, updateRole, getRoleById } from "@/services/role.service";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;
        const role = await getRoleById(Number(id));
        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }
        return NextResponse.json(role);
    } catch (error: any) {
        console.error("[API_ROLE_GET]", error);
        return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;
        const body = await req.json();
        const role = await updateRole(Number(id), body);
        return NextResponse.json(role);
    } catch (error: any) {
        console.error("[API_ROLE_PUT]", error);
        return NextResponse.json({ error: error.message || "Failed to update role" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        const { id } = await params;
        await deleteRole(Number(id));
        return NextResponse.json({ message: "Role deleted" });
    } catch (error: any) {
        console.error("[API_ROLE_DELETE]", error);
        return NextResponse.json({ error: error.message || "Failed to delete role" }, { status: 500 });
    }
}
