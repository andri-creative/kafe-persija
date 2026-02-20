// services/auth-service.ts
import prisma from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { randomUUID } from "crypto";

export const authService = {
  async getUserByEmail(email: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      if (!user) return null;

      return {
        id: user.id.toString(),
        nickname: user.nickname,
        email: user.email,
        picture: user.picture || "",
        auth_token: user.auth_token,
        roles: user.user_role_trx.map((trx) => trx.role.name),
        type: user.type,
      };
    } catch (error) {
      console.error("Get user by email error:", error);
      return null;
    }
  },

  // Email & Password
  async loginWithEmail(email: string, password: string) {
    try {
      console.log("loginWithEmail called:", email);
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      if (!user) {
        console.error("User not found in DB");
        throw new Error("User tidak ditemukan");
      }

      if (!user.password) {
        console.error("User has no password");
        throw new Error("User belum setup password");
      }

      const isValidPassword = await compare(password, user.password);
      console.log("Password validation result:", isValidPassword);

      if (!isValidPassword) {
        throw new Error("Password salah");
      }

      // Ambil token dari DB jika sudah ada, atau generate baru jika kosong
      const authToken = user.auth_token || randomUUID();

      // Hanya update DB jika sebelumnya token masih kosong
      if (!user.auth_token) {
        await prisma.user.update({
          where: { id: user.id },
          data: { auth_token: authToken, updated_at: new Date() },
        });
      }

      return {
        id: user.id.toString(),
        nickname: user.nickname,
        email: user.email,
        picture: user.picture || "",
        auth_token: authToken,
        roles: user.user_role_trx.map((trx) => trx.role.name),
        type: user.type,
      };
    } catch (error: any) {
      console.error("Login error:", error.message);
      throw new Error(error.message || "Login gagal");
    }
  },

  // REGISTER (DISABLED for public users)
  async registerUser(nickname: string, email: string, password: string) {
    try {
      throw new Error("Pendaftaran mandiri dinonaktifkan. Silakan hubungi Admin.");
    } catch (error: any) {
      console.error("Register error:", error.message);
      throw new Error(error.message || "Registrasi gagal");
    }
  },

  // LOGOUT
  async logoutUser(userId: string) {
    try {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { auth_token: null, updated_at: new Date() },
      });
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  },

  // LOGIN GOOGLE
  async loginWithGoogle(email: string, nickname: string, picture?: string) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      const authToken = randomUUID();

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            type: "GOOGLE",
            picture: picture || existingUser.picture,
            auth_token: authToken,
            updated_at: new Date(),
          },
        });

        return {
          id: existingUser.id.toString(),
          nickname: existingUser.nickname,
          email: existingUser.email,
          picture: picture || existingUser.picture || "",
          auth_token: authToken,
          roles: existingUser.user_role_trx.map((trx) => trx.role.name),
          type: "GOOGLE",
        };
      }

      throw new Error("Akun Google belum terdaftar. Silakan hubungi Admin.");
    } catch (error: any) {
      console.error("Google login error:", error.message);
      throw new Error(error.message || "Google login gagal");
    }
  },

  // LOGIN APPLE
  async loginWithApple(email: string, nickname: string) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      const authToken = randomUUID();

      if (existingUser) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            type: "APPLE",
            auth_token: authToken,
            updated_at: new Date(),
          },
        });

        return {
          id: existingUser.id.toString(),
          nickname: existingUser.nickname,
          email: existingUser.email,
          picture: existingUser.picture || "",
          auth_token: authToken,
          roles: existingUser.user_role_trx.map((trx) => trx.role.name),
          type: "APPLE",
        };
      }

      throw new Error("Akun Apple belum terdaftar. Silakan hubungi Admin.");
    } catch (error: any) {
      console.error("Apple login error:", error.message);
      throw new Error(error.message || "Apple login gagal");
    }
  },

  // VERIFY TOKEN
  async verifyToken(token: string) {
    try {
      const user = await prisma.user.findFirst({
        where: { auth_token: token },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id.toString(),
        nickname: user.nickname,
        email: user.email,
        picture: user.picture || "",
        roles: user.user_role_trx.map((trx) => trx.role.name),
        type: user.type,
      };
    } catch (error) {
      console.error("Verify token error:", error);
      return null;
    }
  },
};
