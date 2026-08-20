import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function roleHome(role: "ADMIN" | "BRAND") {
  return role === "ADMIN" ? "/admin" : "/account";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const session = token ? await verifySessionToken(token) : null;

  const isPublicAuthPage =
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isPublicAuthPage && session) {
    return NextResponse.redirect(new URL(roleHome(session.role), request.url));
  }

  if (pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleHome(session.role), request.url));
    }
  }

  if (pathname === "/account" || pathname.startsWith("/brand/")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session.role !== "BRAND") {
      return NextResponse.redirect(new URL(roleHome(session.role), request.url));
    }

    if (session.mustChangePassword && pathname !== "/brand/set-password") {
      return NextResponse.redirect(new URL("/brand/set-password", request.url));
    }
  }

  if (pathname.startsWith("/api/admin/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (pathname.startsWith("/api/brand/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "BRAND") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.mustChangePassword && pathname !== "/api/brand/account/password") {
      return NextResponse.json({ error: "You must set a new password before continuing." }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/account",
    "/brand",
    "/brand/:path*",
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/brand/:path*",
  ],
};
