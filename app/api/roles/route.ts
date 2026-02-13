import { NextResponse } from "next/server";
import { getRoles } from "@/services/role.service";

export async function GET() {
    try {
        const roles = await getRoles();
        return NextResponse.json(roles);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
}
