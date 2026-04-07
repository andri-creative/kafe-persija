import { NextResponse, NextRequest } from "next/server";
import { syncRoleRoles } from "@/services/role.service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT(
    req: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = await params;
        const body = await req.json();  
        const roleIds: number[] = body.roleIds ?? [];
        const role = await syncRoleRoles(Number(id), roleIds);
        return NextResponse.json(role);
    } catch (error: any) {
        console.error("[API_ROLE_ROLES_PUT]", error);
        return NextResponse.json({ error: error.message || "Failed to sync roles" }, { status: 500 });
    }
}
