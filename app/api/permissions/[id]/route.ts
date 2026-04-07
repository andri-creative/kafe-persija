import { NextResponse, NextRequest } from "next/server";
import { getPermissionById, updatePermission, deletePermission } from "@/services/permission.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
    try {
        const { id } = await params;
        const permission = await getPermissionById(Number(id));
        if (!permission) {
            return NextResponse.json({ error: "Permission not found" }, { status: 404 });
        }
        return NextResponse.json(permission);
    } catch (error) {
        console.error("[API_PERMISSION_GET]", error);
        return NextResponse.json({ error: "Failed to fetch permission" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const permission = await updatePermission(Number(id), body);
        return NextResponse.json(permission);
    } catch (error: any) {
        console.error("[API_PERMISSION_PUT]", error);
        return NextResponse.json({ error: error.message || "Failed to update permission" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await deletePermission(Number(id));
        return NextResponse.json({ message: "Permission deleted successfully" });
    } catch (error: any) {
        console.error("[API_PERMISSION_DELETE]", error);
        return NextResponse.json({ error: error.message || "Failed to delete permission" }, { status: 500 });
    }
}
