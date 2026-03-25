import prisma from "@/lib/prisma";

const PAGE_SIZE = 10;

export async function getPermissions(page = 1, search = "") {
    const skip = (page - 1) * PAGE_SIZE;
    const where = search
        ? {
            OR: [
                { name: { contains: search } },
                { description: { contains: search } },
            ],
        }
        : undefined;

    const [data, total] = await Promise.all([
        prisma.permission.findMany({
            where,
            orderBy: { name: "asc" },
            skip,
            take: PAGE_SIZE,
        }),
        prisma.permission.count({ where }),
    ]);

    return {
        data,
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
    };
}

export async function getPermissionById(id: number) {
    return await prisma.permission.findUnique({
        where: { id },
        include: {
            role_permission_trx: {
                include: { role: true },
            },
        },
    });
}

export async function createPermission(data: { name: string; description?: string }) {
    return await prisma.permission.create({
        data,
    });
}

export async function updatePermission(id: number, data: { name?: string; description?: string }) {
    return await prisma.permission.update({
        where: { id },
        data,
    });
}

export async function deletePermission(id: number) {
    return await prisma.permission.delete({
        where: { id },
    });
}
