import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ permissions: [], roles: [] });
        }

        const userRoles: string[] = (session.user as any).roles ?? [];

        const permissionSet = new Set<string>();
        const visitedRoleIds = new Set<number>();
        const roleQueue: number[] = [];

        const initialRoles = await prisma.role.findMany({
            where: { name: { in: userRoles } },
            select: { id: true },
        });

        for (const role of initialRoles) {
            roleQueue.push(role.id);
        }

        while (roleQueue.length > 0) {
            const currentRoleId = roleQueue.shift()!;

            if (visitedRoleIds.has(currentRoleId)) {
                continue;
            }
            visitedRoleIds.add(currentRoleId);

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
                for (const trx of roleData.role_permission_trx) {
                    permissionSet.add(trx.permission.name);
                }
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
