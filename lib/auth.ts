// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { authService } from "@/services/auth-service";
import { rateLimit, resetRateLimit } from "./rate-limit";
import redis from "./redis";

export const authOptions: NextAuthOptions = {
  providers: [
    // GOOGLE
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // APPLE
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),

    // EMAIL & PASSWORD
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // console.log("Authorize called with:", { email: credentials?.email });
        if (!credentials?.email || !credentials?.password) {
          // console.error("Missing credentials");
          throw new Error("Email dan password diperlukan");
        }

        try {
          // Rate Limit check
          // console.log(`[AUTH] Checking rate limit for: ${credentials.email}`);
          const { allowed, retryAfter } = await rateLimit(credentials.email);

          if (!allowed) {
            // console.error(`[AUTH] Rate limit exceeded for: ${credentials.email}`);
            throw new Error(`Terlalu banyak percobaan login. Silakan coba lagi dalam ${retryAfter} detik.`);
          }

          // console.log(`[AUTH] Rate limit OK. Proceeding to login for: ${credentials.email}`);
          const user = await authService.loginWithEmail(
            credentials.email,
            credentials.password,
          );

          if (!user) {
            // console.error("User returned null from service");
            throw new Error("Email atau password salah");
          }

          // Reset rate limit on success
          // console.log(`[AUTH] Login success for ${credentials.email}. Resetting Redis rate limit.`);
          await resetRateLimit(credentials.email);

          // console.log("Authorize success:", user.email);
          return user;
        } catch (e: any) {
          // Re-throw inactive error so NextAuth surfaces it to the client
          if (e.message === "ACCOUNT_INACTIVE") throw e;
          // console.error("Authorize error:", e.message);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" || account?.provider === "apple") {
          const email = user.email || profile?.email;
          if (!email) return false;

          const name = user.name || profile?.name || email.split("@")[0];
          const picture = user.image || profile?.picture;

          if (account.provider === "google") {
            await authService.loginWithGoogle(email, name, picture);
          } else if (account.provider === "apple") {
            await authService.loginWithApple(email, name);
          }
        }

        return true;
      } catch (error: any) {
        // console.error("SignIn error:", error);
        if (error.message === "ACCOUNT_INACTIVE") throw error;
        return false;
      }
    },

    async jwt({ token, user, account }: any) {
      // 1. On initial login, store user data in Redis (optional/persistent) and JWT
      if (user) {
        let userData: any = user;

        // If social login, refresh data from DB to get roles
        if (account?.provider === "google" || account?.provider === "apple") {
          const dbUser = await authService.getUserByEmail(user.email!);
          if (dbUser) userData = dbUser;
        }

        // Generate a stable Session ID
        const sessionId = `sess_${userData.id}_${Date.now()}`;

        // Store the full user object in Redis in the background (TTL 30 days)
        // We don't await this if we want it to be even faster, but NextAuth callbacks might expect completion
        try {
          await redis.set(
            `persistent_session:${sessionId}`,
            JSON.stringify(userData),
            "EX",
            30 * 24 * 60 * 60
          );
        } catch (e) {
          console.error("[REDIS ERROR]", e);
        }

        // JWT stores all essential fields for fast access
        token.sessionId = sessionId;
        token.id = userData.id;
        token.email = userData.email;
        token.nickname = userData.nickname || userData.name;
        token.roles = userData.roles;
        token.type = userData.type;
        token.picture = userData.picture || userData.image || "";
      }
      return token;
    },

    async session({ session, token }: any) {
      // FAST SESSION: Use data directly from JWT token instead of waiting for Redis
      if (token) {
        session.user = {
          ...session.user,
          id: token.id,
          nickname: token.nickname,
          email: token.email,
          roles: token.roles,
          type: token.type,
          picture: token.picture,
        };
      }
      return session;
    },
  },

  events: {
    async signOut({ token }: any) {
      if (token.sessionId) {
        // console.log(`[REDIS SESSION] Logging out: Deleting session ${token.sessionId}`);
        await redis.del(`persistent_session:${token.sessionId}`);
      }
    },
  },

  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
