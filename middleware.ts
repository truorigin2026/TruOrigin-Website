import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function roleHome(role: "ADMIN" | "BRAND") {
  return role === "ADMIN" ? "/admin" : "/account";
}

const CORS_ALLOWED_METHODS = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
const CORS_ALLOWED_HEADERS = "Content-Type";

/** Same-origin-only CORS, made explicit instead of left to implicit browser behavior.
 *  There is no external API consumer today, so cross-origin requests get no CORS
 *  headers at all (denied by omission) — only the site's own origin is ever echoed back. */
function applyCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
    response.headers.set("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);
    return applyCorsHeaders(response, request);
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  function withSecurityHeaders(response: NextResponse) {
    return applyCorsHeaders(response, request);
  }

  const isPublicAuthPage =
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isPublicAuthPage && session) {
    return withSecurityHeaders(NextResponse.redirect(new URL(roleHome(session.role), request.url)));
  }

  if (pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login")) {
    if (!session) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin/login", request.url)));
    }

    if (session.role !== "ADMIN") {
      return withSecurityHeaders(NextResponse.redirect(new URL(roleHome(session.role), request.url)));
    }
  }

  if (pathname === "/account" || pathname.startsWith("/brand/")) {
    if (!session) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }

    if (session.role !== "BRAND") {
      return withSecurityHeaders(NextResponse.redirect(new URL(roleHome(session.role), request.url)));
    }

    if (session.mustChangePassword && pathname !== "/brand/set-password") {
      return withSecurityHeaders(NextResponse.redirect(new URL("/brand/set-password", request.url)));
    }
  }

  if (pathname.startsWith("/api/admin/")) {
    if (!session) {
      return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    if (session.role !== "ADMIN") {
      return withSecurityHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }
  }

  if (pathname.startsWith("/api/brand/")) {
    if (!session) {
      return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    if (session.role !== "BRAND") {
      return withSecurityHeaders(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }

    if (session.mustChangePassword && pathname !== "/api/brand/account/password") {
      return withSecurityHeaders(
        NextResponse.json({ error: "You must set a new password before continuing." }, { status: 403 }),
      );
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.png).*)"],
};
