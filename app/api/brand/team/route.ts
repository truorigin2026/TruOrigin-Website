import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { createResetToken, normalizeEmail, RESET_TOKEN_TTL_MS } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

const INVITABLE_ROLES = new Set(["ADMIN", "EDITOR", "VIEWER"]);

export async function POST(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!actor || (actor.brandRole !== "OWNER" && actor.brandRole !== "ADMIN")) {
    return NextResponse.json({ error: "Only a team owner or admin can invite members." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; brandRole?: string } | null;
  const email = normalizeEmail(body?.email ?? "");
  const brandRole = body?.brandRole;

  if (!email || !brandRole || !INVITABLE_ROLES.has(brandRole)) {
    return NextResponse.json({ error: "A valid email and role are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(randomBytes(24).toString("hex"), 10);
  const { token, tokenHash } = createResetToken();

  const brand = await prisma.brand.findUnique({ where: { id: session.brandId } });

  const invited = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "BRAND",
      brand: { connect: { id: session.brandId } },
      brandRole: brandRole as never,
      resetTokenHash: tokenHash,
      resetTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  const setupUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: `You've been invited to ${brand?.name ?? "a TruOrigin workspace"}`,
    body: `You've been invited to join ${brand?.name ?? "a TruOrigin brand workspace"} on TruOrigin.\n\nSet up your account here (link expires in 1 hour): ${setupUrl}`,
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.TEAM_INVITE,
    targetType: "User",
    targetId: invited.id,
    targetLabel: invited.email,
    metadata: { brandRole },
    request,
  });

  return NextResponse.json({ ok: true, user: { id: invited.id, email: invited.email } });
}
