import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      picture?: string;
      roles: string[];
      auth_token?: string;
    };
  }

  interface User {
    id: string;
    name?: string;
    email?: string;
    picture?: string;
    roles: string[];
    auth_token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: string[];
    auth_token?: string;
  }
}
