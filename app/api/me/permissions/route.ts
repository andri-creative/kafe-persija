import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ permissions: [], roles: [] });
        }

        const userRoles: string[] = (session.user as any).roles ?? [];

        // Fetch permissions dari DB berdasarkan role names — semua role, termasuk SUPER_ADMIN
        const roles = await prisma.role.findMany({
            where: { name: { in: userRoles } },
            include: {
                role_permission_trx: {
                    include: { permission: true },
                },
            },
        });

        // Kumpulkan unique permissions dari semua role user
        const permissionSet = new Set<string>();
        for (const role of roles) {
            for (const trx of role.role_permission_trx) {
                permissionSet.add(trx.permission.name);
            }
        }

        return NextResponse.json({
            roles: userRoles,
            permissions: Array.from(permissionSet),
        });
    } catch (error) {
        console.error("[API_ME_PERMISSIONS]", error);
        return NextResponse.json({ permissions: [], roles: [] }, { status: 500 });
    }
}
