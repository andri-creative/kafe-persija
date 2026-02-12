import prisma from "./prisma";

export const userApi = {
    getAll: async (page: number = 1, pageSize: number = 10) => {
        const skip = (page - 1) * pageSize;

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: pageSize,
                include: {
                    user_role_trx: {
                        include: {
                            role: true,
                        },
                    },
                },
                orderBy: {
                    id: 'asc',
                },
            }),
            prisma.user.count()
        ]);

        return {
            data: users,
            pagination: {
                page,
                pageSize,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                hasNextPage: page < Math.ceil(totalCount / pageSize),
                hasPreviousPage: page > 1,
            }
        };
    },

    getAllWithOptions: async (
        page: number = 1,
        pageSize: number = 10,
        options?: {
            orderBy?: 'asc' | 'desc';
            orderField?: string;
            where?: any;
        }
    ) => {
        const skip = (page - 1) * pageSize;

        const orderField = options?.orderField || 'id';
        const orderBy = {
            [orderField]: options?.orderBy || 'asc'
        };

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: pageSize,
                where: options?.where,
                include: {
                    user_role_trx: {
                        include: {
                            role: true,
                        },
                    },
                },
                orderBy,
            }),
            prisma.user.count({
                where: options?.where
            })
        ]);

        return {
            data: users,
            pagination: {
                page,
                pageSize,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                hasNextPage: page < Math.ceil(totalCount / pageSize),
                hasPreviousPage: page > 1,
            }
        };
    },

    create: async (data: any) => {
        return await prisma.user.create({
            data,
        });
    },

    update: async (id: string, data: any) => {
        return await prisma.user.update({
            where: {
                id: Number(id),
            },
            data,
        });
    },

    delete: async (id: string) => {
        return await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
    },
};
;