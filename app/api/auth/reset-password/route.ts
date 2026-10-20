import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashResetToken, isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/auth";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`reset-password:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as
    | { token?: string; password?: string }
    | null;

  const token = body?.token ?? "";
  const password = body?.password ?? "";

  if (!token || !password) {
    return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json({ error: PASSWORD_REQUIREMENTS_MESSAGE }, { status: 400 });
  }

  const tokenHash = hashResetToken(token);
  const user = await prisma.user.findUnique({ where: { resetTokenHash: tokenHash } });

  // Same generic message for every rejection reason (expired, reused —
  // resetTokenHash is cleared below so a second use of the same token
  // simply matches no user — wrong role, or a suspended account) so a
  // leaked/guessed token can't be used to learn *why* it didn't work,
  // which would otherwise leak account status.
  const invalidOrExpired = NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return invalidOrExpired;
  }
  // Both BRAND and ADMIN accounts can legitimately hold a reset token:
  // the brand self-service/forgot-password flow for BRAND, and
  // app/api/admin/users/[id]/reset-password (deliberately requested,
  // not the auto-sync-on-login path) for ADMIN — that route places no
  // role restriction on which user it can target. Anything else
  // (VISITOR/CONSUMER) should never have a resetTokenHash set by any
  // code path; rejected here as defense in depth regardless.
  if ((user.role !== "BRAND" && user.role !== "ADMIN") || !user.active) {
    return invalidOrExpired;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpires: null,
      mustChangePassword: false,
      // Same reasoning as the self-service password-change route: this
      // is a real credential change, so every other already-issued
      // session for this user should stop working.
      tokenVersion: { increment: 1 },
    },
  });

  return NextResponse.json({ ok: true });
}
