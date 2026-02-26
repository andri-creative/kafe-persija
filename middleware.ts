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

  // 1. SUPER_ADMIN ONLY
  if (pathname.startsWith("/super-admin")) {
    if (!roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  // 2. ADMIN (and Super Admin / Staff for specific sub-routes)
  if (pathname.startsWith("/admin")) {
    const isStaffAllowed = pathname.startsWith("/admin/order") || pathname.startsWith("/admin/layar-tv");
    if (!roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN") && !(roles.includes("STAFF") && isStaffAllowed)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  // 3. DASHBOARD & MANAGER (and Super Admin)
  if (pathname.startsWith("/manager") || pathname.startsWith("/dashboard")) {
    if (!roles.includes("MANAGER") && !roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN") && !roles.includes("STAFF")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  // 4. STAFF ONLY (and Super Admin)
  if (pathname.startsWith("/staff")) {
    if (!roles.includes("STAFF") && !roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/super-admin/:path*",
    "/admin/:path*",
    "/manager/:path*",
    "/staff/:path*",
  ],
};

