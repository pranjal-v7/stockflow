import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

// Role → allowed route prefixes
const roleRoutes: Record<Role, string[]> = {
  ADMIN: ["/admin", "/warehouse", "/api/admin", "/api/products", "/api/warehouses", "/api/stock", "/api/orders"],
  WAREHOUSE_MANAGER: ["/warehouse", "/api/stock", "/api/orders", "/api/warehouses"],
  CUSTOMER: ["/customer", "/api/reservations", "/api/orders"],
  DELIVERY_AGENT: ["/delivery", "/api/orders"],
};

// Routes that require authentication
const protectedPrefixes = ["/admin", "/warehouse", "/customer", "/delivery", "/api/admin", "/api/products", "/api/warehouses", "/api/stock", "/api/reservations", "/api/orders"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  // Redirect unauthenticated users to login
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route guard
  if (token && isProtected) {
    const userRole = token.role as Role;
    const allowed = roleRoutes[userRole] || [];
    const hasAccess = allowed.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/warehouse/:path*",
    "/customer/:path*",
    "/delivery/:path*",
    "/api/admin/:path*",
    "/api/products/:path*",
    "/api/warehouses/:path*",
    "/api/stock/:path*",
    "/api/reservations/:path*",
    "/api/orders/:path*",
  ],
};
