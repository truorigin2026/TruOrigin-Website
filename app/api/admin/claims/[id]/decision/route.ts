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
  const body = (await request.json().catch(() => null)) as
    | { decision?: "APPROVE" | "DENY"; note?: string }
    | null;

  if (!body?.decision) {
    return NextResponse.json({ error: "Missing decision" }, { status: 400 });
  }

  const claim = await prisma.claim.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  const nextStatus = body.decision === "APPROVE" ? "VERIFIED" : "REJECTED";
  const updated = await prisma.claim.update({
    where: { id },
    data: {
      status: nextStatus,
      evidence: body.note?.trim() ? `${claim.evidence ?? ""}${claim.evidence ? " " : ""}${body.note.trim()}` : claim.evidence,
    },
  });

  await logAudit({
    actor: session,
    action: body.decision === "APPROVE" ? AUDIT_ACTIONS.CLAIM_APPROVE : AUDIT_ACTIONS.CLAIM_DENY,
    targetType: "Claim",
    targetId: id,
    targetLabel: `${claim.label} (${claim.product.name})`,
    note: body.note?.trim() || undefined,
    request,
  });

  return NextResponse.json({ ok: true, claim: updated });
}
