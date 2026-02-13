import prisma from "@/lib/prisma";

export async function getRoles() {
    return await prisma.role.findMany({
        orderBy: {
            name: "asc",
        },
    });
}
