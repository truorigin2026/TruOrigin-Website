import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

type StatusAction = "ACTIVATE" | "CANCEL" | "EXTEND";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { action?: StatusAction } | null;

  if (!body?.action || !["ACTIVATE", "CANCEL", "EXTEND"].includes(body.action)) {
    return NextResponse.json({ error: "Missing or invalid action" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({ where: { id }, include: { brand: true, plan: true } });
  if (!subscription) {
    return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
  }

  let data: Parameters<typeof prisma.subscription.update>[0]["data"];
  if (body.action === "ACTIVATE") {
    data = { status: "ACTIVE", canceledAt: null, cancelAtPeriodEnd: false };
  } else if (body.action === "CANCEL") {
    data = { status: "CANCELED", canceledAt: new Date(), cancelAtPeriodEnd: true };
  } else {
    const base = subscription.currentPeriodEnd ?? new Date();
    const extended = new Date(base);
    extended.setMonth(extended.getMonth() + 1);
    data = { currentPeriodEnd: extended, status: "ACTIVE" };
  }

  const updated = await prisma.subscription.update({ where: { id }, data });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.SUBSCRIPTION_UPDATE,
    targetType: "Subscription",
    targetId: id,
    targetLabel: `${subscription.brand.name} → ${subscription.plan.name}`,
    metadata: { event: body.action },
    request,
  });

  return NextResponse.json({ ok: true, subscription: updated });
}
