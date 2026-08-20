import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { isActive?: boolean; name?: string; priceMonthly?: number | null; maxProducts?: number | null }
    | null;

  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const updated = await prisma.plan.update({
    where: { id },
    data: {
      isActive: body?.isActive ?? plan.isActive,
      ...(body?.name !== undefined ? { name: body.name.trim() || plan.name } : {}),
      ...(body?.priceMonthly !== undefined ? { priceMonthly: body.priceMonthly } : {}),
      ...(body?.maxProducts !== undefined ? { maxProducts: body.maxProducts } : {}),
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PLAN_UPDATE,
    targetType: "Plan",
    targetId: id,
    targetLabel: plan.name,
    metadata: { isActive: updated.isActive },
    request,
  });

  return NextResponse.json({ ok: true, plan: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await prisma.plan.findUnique({ where: { id }, include: { _count: { select: { subscriptions: true } } } });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  if (plan._count.subscriptions > 0) {
    return NextResponse.json({ error: "This plan has active subscriptions and can't be deleted." }, { status: 400 });
  }

  await prisma.plan.delete({ where: { id } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PLAN_UPDATE,
    targetType: "Plan",
    targetId: id,
    targetLabel: plan.name,
    note: "Plan deleted",
    request,
  });

  return NextResponse.json({ ok: true });
}
