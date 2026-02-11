// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { authService } from "@/services/auth-service";

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
        console.log("Authorize called with:", { email: credentials?.email });
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          throw new Error("Email dan password diperlukan");
        }

        try {
          const user = await authService.loginWithEmail(
            credentials.email,
            credentials.password,
          );

          if (!user) {
            console.error("User returned null from service");
            throw new Error("Email atau password salah");
          }

          console.log("Authorize success:", user.email);
          return user;
        } catch (e: any) {
          console.error("Authorize error:", e.message);
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
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google" || account?.provider === "apple") {
          const dbUser: any = await authService.getUserByEmail(user.email!);
          if (dbUser) {
            token.id = dbUser.id;
            token.nickname = dbUser.nickname;
            token.email = dbUser.email;
            token.picture = dbUser.picture;
            token.roles = dbUser.roles;
            token.auth_token = dbUser.auth_token;
            token.type = dbUser.type;
          }
        } else {
          const u = user as any;
          token.id = u.id;
          token.nickname = u.nickname;
          token.email = u.email;
          token.picture = u.picture;
          token.roles = u.roles;
          token.auth_token = u.auth_token;
          token.type = u.type;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || "";
        session.user.nickname = (token.nickname as string) || "";
        session.user.email = (token.email as string) || "";
        session.user.picture = (token.picture as string) || "";
        session.user.roles = token.roles as string[];
        session.user.auth_token = token.auth_token as string;
        session.user.type = token.type as string;
      }
      return session;
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
