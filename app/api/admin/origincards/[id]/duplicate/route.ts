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
  const card = await prisma.originCard.findUnique({ where: { id }, include: { product: true } });
  if (!card) {
    return NextResponse.json({ error: "OriginCard not found" }, { status: 404 });
  }

  const duplicate = await prisma.originCard.create({
    data: {
      productId: card.productId,
      template: card.template,
      title: card.title ? `${card.title} (copy)` : null,
      status: "DRAFT",
      duplicatedFromId: card.id,
    },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.ORIGINCARD_DUPLICATE,
    targetType: "OriginCard",
    targetId: duplicate.id,
    targetLabel: card.title ?? card.product.name,
    metadata: { duplicatedFromId: card.id },
    request,
  });

  return NextResponse.json({ ok: true, card: duplicate });
}
