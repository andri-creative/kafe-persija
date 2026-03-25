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

  // Allow static assets (images, etc.) to load without auth
  const isPublicAsset = /\.(png|jpg|jpeg|gif|webp|svg|ico|json|js|css|webmanifest)$/.test(pathname);
  if (isPublicAsset) {
    return NextResponse.next();
  }

  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If already logged in and at login page, redirect to dashboard
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Note: Granular RBAC is now handled at the component level
  // using the AccessControl component or hasPermission helper.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public images/assets)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|public|manifest.json|manifest.webmanifest|sw.js).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
    "/dashboard/:path*",
    "/product/:path*",
    "/order/:path*",
    "/promo/:path*",
    "/discount/:path*",
    "/accounts/:path*",
    "/layar-tv/:path*",
    "/sales-reports/:path*",
    "/inventory/:path*",
    "/settings/:path*",
    "/audit-logs/:path*",
    "/admin-manage/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/menu/:path*",
  ],
};

