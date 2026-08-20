import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await prisma.originCard.findUnique({ where: { id }, include: { product: true } });
  if (!card) {
    return NextResponse.json({ error: "OriginCard not found" }, { status: 404 });
  }

  await prisma.originCard.delete({ where: { id } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.ORIGINCARD_DELETE,
    targetType: "OriginCard",
    targetId: id,
    targetLabel: card.title ?? card.product.name,
    request,
  });

  return NextResponse.json({ ok: true });
}
