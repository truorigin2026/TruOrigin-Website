import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { action?: "SUSPEND" | "REACTIVATE" } | null;

  if (!body?.action || !["SUSPEND", "REACTIVATE"].includes(body.action)) {
    return NextResponse.json({ error: "Missing or invalid action" }, { status: 400 });
  }

  if (id === session.sub && body.action === "SUSPEND") {
    return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { active: body.action === "REACTIVATE" },
  });

  await logAudit({
    actor: session,
    action: body.action === "SUSPEND" ? AUDIT_ACTIONS.ADMIN_USER_SUSPEND : AUDIT_ACTIONS.ADMIN_USER_REACTIVATE,
    targetType: "User",
    targetId: id,
    targetLabel: user.email,
    request,
  });

  return NextResponse.json({ ok: true, user: updated });
}
