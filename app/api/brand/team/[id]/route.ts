import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

async function requireManager(session: { sub: string; brandId?: string | null }) {
  if (!session.brandId) return null;
  const actor = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!actor || (actor.brandRole !== "OWNER" && actor.brandRole !== "ADMIN")) return null;
  return actor;
}

async function requireTargetMember(id: string, brandId: string) {
  const member = await prisma.user.findUnique({ where: { id } });
  if (!member || member.brandId !== brandId || member.role !== "BRAND") return null;
  return member;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await requireManager(session);
  if (!actor) {
    return NextResponse.json({ error: "Only a team owner or admin can manage members." }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.sub) {
    return NextResponse.json({ error: "You cannot change your own status." }, { status: 400 });
  }

  const member = await requireTargetMember(id, session.brandId);
  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { action?: "SUSPEND" | "REACTIVATE" } | null;
  if (!body?.action || !["SUSPEND", "REACTIVATE"].includes(body.action)) {
    return NextResponse.json({ error: "Missing or invalid action" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { active: body.action === "REACTIVATE" },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.TEAM_STATUS_UPDATE,
    targetType: "User",
    targetId: id,
    targetLabel: member.email,
    metadata: { action: body.action },
    request,
  });

  return NextResponse.json({ ok: true, user: { id: updated.id, active: updated.active } });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const actor = await requireManager(session);
  if (!actor) {
    return NextResponse.json({ error: "Only a team owner or admin can manage members." }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.sub) {
    return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });
  }

  const member = await requireTargetMember(id, session.brandId);
  if (!member) {
    return NextResponse.json({ error: "Team member not found" }, { status: 404 });
  }

  if (member.brandRole === "OWNER") {
    const ownerCount = await prisma.user.count({ where: { brandId: session.brandId, brandRole: "OWNER" } });
    if (ownerCount <= 1) {
      return NextResponse.json({ error: "A brand must have at least one owner." }, { status: 400 });
    }
  }

  await prisma.user.delete({ where: { id } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.TEAM_REMOVE,
    targetType: "User",
    targetId: id,
    targetLabel: member.email,
    request,
  });

  return NextResponse.json({ ok: true });
}
