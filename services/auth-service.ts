// services/auth-service.ts
import { prisma } from "@/lib/prisma";

export const authService = {
  async authenticateUser(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          user_role_trx: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) return null;

      const token = crypto.randomUUID();

      await prisma.user.update({
        where: { id: user.id },
        data: { auth_token: token },
      });

      return {
        id: user.id.toString(),
        name: user.nickname,
        email: user.email,
        picture: user.picture || "",
        auth_token: token,
        roles: user.user_role_trx.map((r) => r.role.name),
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  },

  async registerUser(data: { name: string; email: string }) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const authToken = crypto.randomUUID();

      const user = await prisma.user.create({
        data: {
          email: data.email,
          nickname: data.name,
          auth_token: authToken,
          status: "active",
          type: "USER",
          user_role_trx: {
            create: [
              {
                role: {
                  connectOrCreate: {
                    where: { name: "USER" },
                    create: { name: "USER" },
                  },
                },
              },
            ],
          },
        },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.nickname,
        auth_token: authToken,
        roles: user.user_role_trx.map((r) => r.role.name),
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async logoutUser(userId: string) {
    try {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { auth_token: null },
      });
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  },

  async getUserByToken(token: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { auth_token: token },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      if (!user) return null;

      return {
        id: user.id.toString(),
        email: user.email,
        name: user.nickname,
        roles: user.user_role_trx.map((r) => r.role.name),
      };
    } catch (error) {
      console.error("Get user by token error:", error);
      return null;
    }
  },
};
