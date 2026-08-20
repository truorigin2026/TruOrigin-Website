import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken, normalizeEmail, RESET_TOKEN_TTL_MS } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

const GENERIC_RESPONSE = {
  ok: true,
  message: "If an account exists for that email, we've sent a password reset link.",
};

export async function POST(request: NextRequest) {
  const ipLimit = checkRateLimit(`forgot-password:ip:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!ipLimit.allowed) {
    return rateLimitResponse(ipLimit.retryAfterSeconds);
  }

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = normalizeEmail(body?.email ?? "");

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const emailLimit = checkRateLimit(`forgot-password:email:${email}`, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.role === "BRAND" && user.active) {
    const { token, tokenHash } = createResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your TruOrigin password",
      body: `We received a request to reset your TruOrigin brand account password.\n\nReset it here (link expires in 1 hour): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    });
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
