import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

type StatusAction = "APPROVE" | "SUSPEND" | "REACTIVATE";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { action?: StatusAction; reason?: string } | null;

  if (!body?.action || !["APPROVE", "SUSPEND", "REACTIVATE"].includes(body.action)) {
    return NextResponse.json({ error: "Missing or invalid action" }, { status: 400 });
  }

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  if (body.action === "SUSPEND" && !body.reason?.trim()) {
    return NextResponse.json({ error: "A suspension reason is required" }, { status: 400 });
  }

  const data =
    body.action === "APPROVE"
      ? { status: "ACTIVE" as const, suspendedAt: null, suspendedReason: null }
      : body.action === "SUSPEND"
        ? { status: "SUSPENDED" as const, suspendedAt: new Date(), suspendedReason: body.reason!.trim() }
        : { status: "ACTIVE" as const, suspendedAt: null, suspendedReason: null };

  const updated = await prisma.brand.update({ where: { id }, data });

  await logAudit({
    actor: session,
    action:
      body.action === "APPROVE"
        ? AUDIT_ACTIONS.BRAND_APPROVE
        : body.action === "SUSPEND"
          ? AUDIT_ACTIONS.BRAND_SUSPEND
          : AUDIT_ACTIONS.BRAND_REACTIVATE,
    targetType: "Brand",
    targetId: id,
    targetLabel: brand.name,
    note: body.reason?.trim(),
    request,
  });

  return NextResponse.json({ ok: true, brand: updated });
}
