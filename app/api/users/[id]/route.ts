import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/services/user.service";

export const dynamic = "force-dynamic";

type Params = {
    params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const user = await getUserById(parseInt(id));

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const body = await req.json();

        const user = await updateUser(parseInt(id), body);

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(_: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        await deleteUser(parseInt(id));
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: error.message || "Failed to delete user" }, { status: 500 });
    }
}
