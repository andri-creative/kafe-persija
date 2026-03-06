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

        const permissionSet = new Set<string>();
        const visitedRoleIds = new Set<number>();
        const roleQueue: number[] = [];

        // 1. Ambil role IDs awal berdasarkan nama dari session
        const initialRoles = await prisma.role.findMany({
            where: { name: { in: userRoles } },
            select: { id: true },
        });

        for (const role of initialRoles) {
            roleQueue.push(role.id);
        }

        // 2. Lakukan pencarian mendalam (BFS) untuk mengambil semua permission termasuk dari child_roles (pewarisan multi-level)
        while (roleQueue.length > 0) {
            const currentRoleId = roleQueue.shift()!;

            if (visitedRoleIds.has(currentRoleId)) {
                continue; // Hindari infinite loop jika ada perulangan (circular dependency) role
            }
            visitedRoleIds.add(currentRoleId);

            // Ambil data role beserta direct permissions dan child_roles (turunannya)
            const roleData = await prisma.role.findUnique({
                where: { id: currentRoleId },
                include: {
                    role_permission_trx: {
                        include: { permission: true },
                    },
                    child_roles: true,
                },
            });

            if (roleData) {
                // Masukkan semua permission dari role saat ini
                for (const trx of roleData.role_permission_trx) {
                    permissionSet.add(trx.permission.name);
                }

                // Masukkan child roles ke dalam antrean untuk diproses
                for (const childTrx of roleData.child_roles) {
                    if (!visitedRoleIds.has(childTrx.child_role_id)) {
                        roleQueue.push(childTrx.child_role_id);
                    }
                }
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
