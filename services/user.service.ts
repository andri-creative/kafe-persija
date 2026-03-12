import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

// ─── Create ──────────────────────────────────────────────────────────────────
export interface CreateUserInput {
    nickname: string;
    email: string;
    password: string;
    type: string;
    status?: string;
    role_id?: number;
}

export async function createUser(data: CreateUserInput) {
    const { role_id, password, ...userData } = data;
    const hashedPassword = await hash(password, 12);

    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                status: data.status ?? "ACTIVE",
            },
        });

        if (role_id) {
            await tx.user_role_trx.create({
                data: { user_id: user.id, role_id },
            });
        }

        return user;
    });
}

// ─── Read ────────────────────────────────────────────────────────────────────
export async function getUserById(id: number) {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            user_role_trx: {
                include: { role: true },
            },
        },
    });
}

// ─── Update ──────────────────────────────────────────────────────────────────
export interface UpdateUserInput {
    nickname?: string;
    email?: string;
    password?: string;
    status?: string;
    type?: string;
    role_id?: number;
}

export async function updateUser(id: number, data: UpdateUserInput) {
    const { role_id, password, ...userData } = data;
    const updateData: any = { ...userData };

    if (password) {
        updateData.password = await hash(password, 12);
    }

    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id },
            data: updateData,
        });

        if (role_id !== undefined) {
            await tx.user_role_trx.deleteMany({ where: { user_id: id } });
            if (role_id) {
                await tx.user_role_trx.create({
                    data: { user_id: id, role_id },
                });
            }
        }

        return user;
    });
}

// ─── Delete ──────────────────────────────────────────────────────────────────
export async function deleteUser(id: number) {
    return await prisma.$transaction(async (tx) => {
        await tx.user_role_trx.deleteMany({ where: { user_id: id } });
        return await tx.user.delete({ where: { id } });
    });
}
