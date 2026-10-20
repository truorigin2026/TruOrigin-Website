import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, signSession } from "@/lib/auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`brand-password-change:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as { currentPassword?: string; newPassword?: string } | null;
  const currentPassword = body?.currentPassword ?? "";
  const newPassword = body?.newPassword ?? "";

  if (!newPassword) {
    return NextResponse.json({ error: "A new password is required." }, { status: 400 });
  }
  if (!isStrongPassword(newPassword)) {
    return NextResponse.json({ error: PASSWORD_REQUIREMENTS_MESSAGE }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  // A forced temp-password change trusts the just-authenticated session instead of asking again.
  if (!user.mustChangePassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  // Incrementing tokenVersion invalidates every other already-issued
  // session for this user (different device/browser, or a stolen
  // cookie) — their embedded tokenVersion claim no longer matches once
  // this lands, even though the token itself is still validly signed
  // and unexpired. The current request re-issues a fresh token below
  // with the new version, so it isn't locked out by its own change.
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false, tokenVersion: { increment: 1 } },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PASSWORD_CHANGE,
    targetType: "User",
    targetId: user.id,
    targetLabel: user.email,
    request,
  });

  const response = NextResponse.json({ ok: true });
  const token = await signSession({ ...session, mustChangePassword: false, tokenVersion: updated.tokenVersion });
  response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return response;
}
