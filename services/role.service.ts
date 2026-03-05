import prisma from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function getRoles(page = 1, search = "") {
    const skip = (page - 1) * PAGE_SIZE
    const where = search ? {
        OR: [
            { name: { contains: search } },
            { description: { contains: search } }
        ]
    } : undefined

    const [data, total] = await Promise.all([
        prisma.role.findMany({
            where,
            orderBy: { name: "asc" },
            skip,
            take: PAGE_SIZE,
            include: {
                role_permission_trx: {
                    include: { permission: true },
                },
                user_role_trx: true,
            },
        }),
        prisma.role.count({ where }),
    ])

    return {
        data,
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
    }

    // return await prisma.role.findMany({
    //     const skip = (page - 1) * PAGE_SIZE;
    //     orderBy: { name: "asc" },
    //     include: {
    //         role_permission_trx: {
    //             include: { permission: true },
    //         },
    //         user_role_trx: true,
    //     },
    // });
}

export async function getRoleById(id: number) {
    return await prisma.role.findUnique({
        where: { id },
        include: {
            role_permission_trx: {
                include: { permission: true },
            },
        },
    });
}

export async function createRole(data: { name: string; description?: string }) {
    return await prisma.role.create({ data });
}

export async function updateRole(id: number, data: { name?: string; description?: string }) {
    return await prisma.role.update({ where: { id }, data });
}

export async function deleteRole(id: number) {
    return await prisma.role.delete({ where: { id } });
}

export async function syncRolePermissions(roleId: number, permissionIds: number[]) {
    // Hapus semua permission lama, lalu insert yang baru
    await prisma.role_permission_trx.deleteMany({ where: { role_id: roleId } });

    if (permissionIds.length > 0) {
        await prisma.role_permission_trx.createMany({
            data: permissionIds.map((permission_id) => ({
                role_id: roleId,
                permission_id,
            })),
        });
    }

    return getRoleById(roleId);
}
