// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authService } from "@/services/auth-service";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user = await authService.authenticateUser(credentials.email);

        console.log("AUTHORIZE USER:", user);

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = user.roles;
        token.id = user.id;
        token.auth_token = user.auth_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.roles = token.roles;
        session.user.id = token.id as string;
        session.user.auth_token = token.auth_token as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
