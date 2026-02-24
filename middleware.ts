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

  if (pathname.startsWith("/dashboard") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/order") ||
    pathname.startsWith("/order-lama") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/layar-tv")) {
    if (!roles.includes("MANAGER") && !roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  if (pathname.startsWith("/staff")) {
    if (!roles.includes("STAFF") && !roles.includes("MANAGER") && !roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/product/:path*",
    "/order/:path*",
    "/order-lama/:path*",
    "/users/:path*",
    "/profile/:path*",
    "/layar-tv/:path*",
    "/staff/:path*",
  ],
};
