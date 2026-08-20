import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { slugify } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { name?: string; slug?: string; priceMonthly?: number | null; maxProducts?: number | null }
    | null;

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Plan name is required" }, { status: 400 });
  }

  const slug = body.slug?.trim() ? slugify(body.slug) : slugify(body.name);

  const plan = await prisma.plan.create({
    data: {
      name: body.name.trim(),
      slug,
      priceMonthly: body.priceMonthly ?? null,
      maxProducts: body.maxProducts ?? null,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PLAN_CREATE,
    targetType: "Plan",
    targetId: plan.id,
    targetLabel: plan.name,
    request,
  });

  return NextResponse.json({ ok: true, plan });
}
