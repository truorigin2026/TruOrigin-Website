import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isStrongPassword, normalizeEmail, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = normalizeEmail(body?.email ?? "");
  const password = body?.password ?? "";

  if (!email || !isStrongPassword(password)) {
    return NextResponse.json({ error: `A valid email is required. ${PASSWORD_REQUIREMENTS_MESSAGE}` }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: "ADMIN" },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.ADMIN_USER_CREATE,
    targetType: "User",
    targetId: user.id,
    targetLabel: user.email,
    request,
  });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
}
