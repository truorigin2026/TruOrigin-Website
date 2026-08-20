import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionPayload } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/csrf";

/** Shared guard for app/api/admin/** routes — replaces the requireAdmin() copy-pasted per file. */
export async function requireAdminSession(request: NextRequest): Promise<SessionPayload | null> {
  if (!isSameOriginRequest(request)) return null;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  return session?.role === "ADMIN" ? session : null;
}

/** Shared guard for app/api/brand/** routes — replaces the role check copy-pasted per file. */
export async function requireBrandSession(request: NextRequest): Promise<SessionPayload | null> {
  if (!isSameOriginRequest(request)) return null;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  return session?.role === "BRAND" && session.brandId ? session : null;
}
