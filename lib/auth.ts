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
      // 1. On initial login, store user data in Redis
      if (user) {
        let userData: any = user;

        // If social login, refresh data from DB to get roles
        if (account?.provider === "google" || account?.provider === "apple") {
          const dbUser = await authService.getUserByEmail(user.email!);
          if (dbUser) userData = dbUser;
        }

        // Generate a stable Session ID (using the user ID or a random UUID)
        const sessionId = `sess_${userData.id}_${Date.now()}`;

        // console.log(`[REDIS SESSION] Storing data for session: ${sessionId}`);

        // Store the full user object in Redis (30 days TTL)
        await redis.set(
          `persistent_session:${sessionId}`,
          JSON.stringify(userData),
          "EX",
          30 * 24 * 60 * 60
        );

        // JWT stores sessionId AND essential fields for middleware (Edge runtime)
        token.sessionId = sessionId;
        token.id = userData.id;
        token.email = userData.email;
        token.roles = userData.roles;
        token.type = userData.type;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token.sessionId) {
        // console.log(`[REDIS SESSION] Fetching data for session: ${token.sessionId}`);

        // Retrieve the full user data from Redis
        const data = await redis.get(`persistent_session:${token.sessionId}`);

        if (data) {
          const userData = JSON.parse(data);
          session.user.id = userData.id;
          session.user.nickname = userData.nickname;
          session.user.email = userData.email;
          session.user.picture = userData.picture || "";
          session.user.roles = userData.roles;
          session.user.auth_token = userData.auth_token;
          session.user.type = userData.type;

          // console.log(`[REDIS SESSION] Session restored from Redis for: ${userData.email}`);
        } else {
          console.warn(`[REDIS SESSION] Session key not found or expired: ${token.sessionId}`);
          // Fallback: If Redis fails, we might want to logout or re-fetch from DB
          // For now, return incomplete session to trigger logout on client side if handled
        }
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
