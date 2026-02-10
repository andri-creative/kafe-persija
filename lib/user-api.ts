import { prisma } from "./prisma";

export const userApi = {
    getAll: async () => {
        return await prisma.user.findMany();
    },

    getById: async (id: string) => {
        return await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });
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