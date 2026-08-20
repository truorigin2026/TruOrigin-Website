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
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), hidden: true } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PRODUCT_DELETE,
    targetType: "Product",
    targetId: id,
    targetLabel: product.name,
    request,
  });

  return NextResponse.json({ ok: true });
}
