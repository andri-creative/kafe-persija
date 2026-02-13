import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function getUserById(id: number) {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            user_role_trx: {
                include: {
                    role: true,
                },
            },
        },
    });
}

export interface UpdateUserInput {
    nickname?: string;
    email?: string;
    password?: string;
    status?: string;
    role_id?: number;
}

export async function updateUser(id: number, data: UpdateUserInput) {
    const { role_id, password, ...userData } = data;

    const updateData: any = { ...userData };

    if (password) {
        updateData.password = await hash(password, 12);
    }

    return await prisma.$transaction(async (tx) => {
        // Update basic user info
        const user = await tx.user.update({
            where: { id },
            data: updateData,
        });

        // Update role if provided
        if (role_id) {
            // For now, we assume a user has one primary role in the edit UI.
            // We delete existing roles and create the new one.
            await tx.user_role_trx.deleteMany({
                where: { user_id: id },
            });

            await tx.user_role_trx.create({
                data: {
                    user_id: id,
                    role_id: role_id,
                },
            });
        }

        return user;
    });
}

export async function deleteUser(id: number) {
    return await prisma.$transaction(async (tx) => {
        // Delete role transactions first
        await tx.user_role_trx.deleteMany({
            where: { user_id: id },
        });

        // Delete user
        return await tx.user.delete({
            where: { id },
        });
    });
}
