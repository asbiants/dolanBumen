import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-development";

// Define protected and auth routes
const consumerProtectedRoutes = ["/consumer/dashboard"];
const consumerAuthRoutes = ["/consumer/login", "/consumer/register"];
const adminProtectedRoutes = ["/admin/dashboard"];
const adminAuthRoutes = ["/admin/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Consumer logic
  const isConsumerProtected = consumerProtectedRoutes.some(route => pathname.startsWith(route));
  const isConsumerAuth = consumerAuthRoutes.some(route => pathname === route);
  const consumerToken = request.cookies.get("consumer-token")?.value;

  if (isConsumerProtected && !consumerToken) {
    return NextResponse.redirect(new URL("/consumer/login", request.url));
  }
  if (isConsumerAuth && consumerToken) {
    try {
      const decoded = jwt.verify(consumerToken, JWT_SECRET);
      if (decoded && typeof decoded === "object" && decoded.role === "CONSUMER") {
        return NextResponse.redirect(new URL("/consumer/dashboard", request.url));
      }
    } catch {
      // If token invalid, clear cookie
      const response = NextResponse.next();
      response.cookies.set({
        name: "consumer-token",
        value: "",
        expires: new Date(0),
        path: "/",
      });
      return response;
    }
  }

  // Admin logic
  const isAdminProtected = adminProtectedRoutes.some(route => pathname.startsWith(route));
  const isAdminAuth = adminAuthRoutes.some(route => pathname === route);
  const adminToken = request.cookies.get("admin-token")?.value;

  if (isAdminProtected && !adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (isAdminAuth && adminToken) {
    try {
      const decoded = jwt.verify(adminToken, JWT_SECRET);
      if (
        decoded &&
        typeof decoded === "object" &&
        (decoded.role === "SUPER_ADMIN" || decoded.role === "TOURISM_ADMIN")
      ) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    } catch {
      // If token invalid, clear cookie
      const response = NextResponse.next();
      response.cookies.set({
        name: "admin-token",
        value: "",
        expires: new Date(0),
        path: "/",
      });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/consumer/:path*",
    "/admin/:path*",
  ],
}; 