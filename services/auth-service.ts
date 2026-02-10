// services/auth-service.ts
import { prisma } from "@/lib/prisma";
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
        name: user.nickname,
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

      const authToken = randomUUID();

      await prisma.user.update({
        where: { id: user.id },
        data: { auth_token: authToken, updated_at: new Date() },
      });

      return {
        id: user.id.toString(),
        name: user.nickname,
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

  // REGISTER
  async registerUser(name: string, email: string, password: string) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("Email sudah terdaftar");
      }
      const hashedPassword = await hash(password, 12);
      const authToken = randomUUID();
      let customerRole = await prisma.role.findUnique({
        where: { name: "customer" },
      });
      if (!customerRole) {
        customerRole = await prisma.role.create({
          data: { name: "customer", description: "Customer role" },
        });
      }

      const user = await prisma.user.create({
        data: {
          nickname: name,
          email: email,
          password: hashedPassword,
          auth_token: authToken,
          type: "USER",
          picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          user_role_trx: {
            create: {
              role_id: customerRole.id,
            },
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
        name: user.nickname,
        email: user.email,
        picture: user.picture || "",
        auth_token: authToken,
        roles: user.user_role_trx.map((trx) => trx.role.name),
        type: user.type,
      };
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
  async loginWithGoogle(email: string, name: string, picture?: string) {
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
          name: existingUser.nickname,
          email: existingUser.email,
          picture: picture || existingUser.picture || "",
          auth_token: authToken,
          roles: existingUser.user_role_trx.map((trx) => trx.role.name),
          type: "GOOGLE",
        };
      }

      let customerRole = await prisma.role.findUnique({
        where: { name: "customer" },
      });

      if (!customerRole) {
        customerRole = await prisma.role.create({
          data: { name: "customer", description: "Customer role" },
        });
      }

      const newUser = await prisma.user.create({
        data: {
          nickname: name,
          email: email,
          auth_token: authToken,
          type: "GOOGLE",
          picture:
            picture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
          user_role_trx: {
            create: {
              role_id: customerRole.id,
            },
          },
        },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      return {
        id: newUser.id.toString(),
        name: newUser.nickname,
        email: newUser.email,
        picture: newUser.picture || "",
        auth_token: authToken,
        roles: newUser.user_role_trx.map((trx) => trx.role.name),
        type: "GOOGLE",
      };
    } catch (error: any) {
      console.error("Google login error:", error.message);
      throw new Error(error.message || "Google login gagal");
    }
  },

  // LOGIN APPLE
  async loginWithApple(email: string, name: string) {
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
          name: existingUser.nickname,
          email: existingUser.email,
          picture: existingUser.picture || "",
          auth_token: authToken,
          roles: existingUser.user_role_trx.map((trx) => trx.role.name),
          type: "APPLE",
        };
      }

      let customerRole = await prisma.role.findUnique({
        where: { name: "customer" },
      });

      if (!customerRole) {
        customerRole = await prisma.role.create({
          data: { name: "customer", description: "Customer role" },
        });
      }

      const newUser = await prisma.user.create({
        data: {
          nickname: name || email.split("@")[0],
          email: email,
          auth_token: authToken,
          type: "APPLE",
          picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split("@")[0])}`,
          user_role_trx: {
            create: {
              role_id: customerRole.id,
            },
          },
        },
        include: {
          user_role_trx: {
            include: { role: true },
          },
        },
      });

      return {
        id: newUser.id.toString(),
        name: newUser.nickname,
        email: newUser.email,
        picture: newUser.picture || "",
        auth_token: authToken,
        roles: newUser.user_role_trx.map((trx) => trx.role.name),
        type: "APPLE",
      };
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
        name: user.nickname,
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
