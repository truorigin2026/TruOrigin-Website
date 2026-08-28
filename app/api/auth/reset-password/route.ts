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

  if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpires: null,
      mustChangePassword: false,
    },
  });

  return NextResponse.json({ ok: true });
}
