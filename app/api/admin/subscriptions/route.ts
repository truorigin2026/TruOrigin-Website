import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { brandId?: string; planId?: string } | null;
  if (!body?.brandId || !body?.planId) {
    return NextResponse.json({ error: "brandId and planId are required" }, { status: 400 });
  }

  const [brand, plan] = await Promise.all([
    prisma.brand.findUnique({ where: { id: body.brandId } }),
    prisma.plan.findUnique({ where: { id: body.planId } }),
  ]);

  if (!brand || !plan) {
    return NextResponse.json({ error: "Brand or plan not found" }, { status: 404 });
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscription = await prisma.subscription.create({
    data: {
      brandId: brand.id,
      planId: plan.id,
      status: "ACTIVE",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.SUBSCRIPTION_UPDATE,
    targetType: "Subscription",
    targetId: subscription.id,
    targetLabel: `${brand.name} → ${plan.name}`,
    metadata: { event: "created" },
    request,
  });

  return NextResponse.json({ ok: true, subscription });
}
