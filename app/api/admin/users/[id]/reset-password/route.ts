import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { createResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(`admin-reset-password:${session.sub}`, 10, 60 * 60 * 1000, "fail-closed");
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.retryAfterSeconds);
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { token, tokenHash } = createResetToken();

  await prisma.user.update({
    where: { id },
    data: {
      resetTokenHash: tokenHash,
      resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      // Takes effect immediately, not only once the user eventually
      // completes the reset: an admin triggering this for a specific
      // account is routinely a response to suspected compromise, and
      // this route is already gated behind requireAdminSession, so
      // there's no risk (unlike the self-service forgot-password flow)
      // of a stranger who merely knows someone's email forcing their
      // sessions to die by requesting a reset they were never sent.
      // app/api/auth/reset-password/route.ts bumps this again when the
      // user actually completes the reset -- harmless, it only ever
      // moves forward.
      sessionVersion: { increment: 1 },
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset-password?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your TruOrigin password",
    body: `An admin triggered a password reset for your TruOrigin account.\n\nReset it here (link expires in 1 hour): ${resetUrl}\n\nIf you didn't expect this, contact your TruOrigin admin.`,
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.USER_PASSWORD_RESET_SENT,
    targetType: "User",
    targetId: id,
    targetLabel: user.email,
    request,
  });

  return NextResponse.json({ ok: true });
}
