import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const roles = token.roles as string[];

  if (pathname.startsWith("/admin")) {
    if (!roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  if (pathname.startsWith("/super-admin")) {
    if (!roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  if (pathname.startsWith("/staff")) {
    if (!roles.includes("STAFF")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/super-admin/:path*",
    "/staff/:path*",
    "/products/:path*",
    "/transactions/:path*",
    "/promo/:path*",
    "/reports/:path*",
  ],
};
