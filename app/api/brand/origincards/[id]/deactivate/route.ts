import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await prisma.originCard.findUnique({ where: { id }, include: { product: true } });

  if (!card || card.product.brandId !== session.brandId) {
    return NextResponse.json({ error: "OriginCard not found" }, { status: 404 });
  }

  if (card.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Only a published OriginCard can be deactivated." }, { status: 400 });
  }

  const updated = await prisma.originCard.update({ where: { id }, data: { status: "UNPUBLISHED" } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.ORIGINCARD_DEACTIVATE,
    targetType: "OriginCard",
    targetId: id,
    targetLabel: card.title ?? card.product.name,
    request,
  });

  return NextResponse.json({ ok: true, card: updated });
}
