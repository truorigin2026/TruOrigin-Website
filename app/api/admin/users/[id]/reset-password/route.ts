import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { createResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { token, tokenHash } = createResetToken();

  await prisma.user.update({
    where: { id },
    data: { resetTokenHash: tokenHash, resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
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
