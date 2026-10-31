import { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken, isSessionRevoked, type SessionPayload } from "@/lib/auth";
import { isSameOriginRequest } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";

/**
 * Shared guard for app/api/admin/** routes — replaces the requireAdmin() copy-pasted per file.
 * Re-checks `active` in the DB on every call (not just the JWT claim) so a suspended admin's
 * still-valid token is rejected immediately, matching what requireAdminUser() already does for
 * page loads instead of only page-level enforcement. Also rejects a token whose sessionVersion
 * claim no longer matches the account's current one -- the same check getCurrentUser() applies
 * for page loads, re-done here since this guard doesn't go through it. sessionVersion piggybacks
 * on the SAME select this guard already runs, so this isn't an extra query.
 */
export async function requireAdminSession(request: NextRequest): Promise<SessionPayload | null> {
  if (!isSameOriginRequest(request)) return null;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session?.role !== "ADMIN") return null;

  const user = await prisma.user.findUnique({ where: { id: session.sub }, select: { active: true, sessionVersion: true } });
  if (!user?.active || isSessionRevoked(session.sessionVersion, user.sessionVersion)) return null;

  return session;
}

/**
 * Shared guard for app/api/brand/** routes — replaces the role check copy-pasted per file.
 * Re-checks `active` and the brand's status in the DB on every call, matching requireBrandUser().
 * Also rejects a token whose sessionVersion claim no longer matches the account's current one --
 * see requireAdminSession above. Piggybacks on the SAME select this guard already runs.
 */
export async function requireBrandSession(request: NextRequest): Promise<SessionPayload | null> {
  if (!isSameOriginRequest(request)) return null;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session?.role !== "BRAND" || !session.brandId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { active: true, sessionVersion: true, brand: { select: { status: true } } },
  });
  if (!user?.active || !user.brand || user.brand.status === "SUSPENDED") return null;
  if (isSessionRevoked(session.sessionVersion, user.sessionVersion)) return null;

  return session;
}
