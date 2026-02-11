// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nickname?: string | null;
      email?: string | null;
      picture?: string | null;
      roles: string[];
      auth_token: string;
      type: string;
    };
  }

  interface User {
    id: string;
    nickname: string;
    email: string;
    picture?: string | null;
    roles: string[];
    auth_token: string;
    type: string;
  }

  interface Profile {
    picture?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nickname: string;
    email: string;
    picture?: string | null;
    roles: string[];
    auth_token: string;
    type: string;
  }
}
