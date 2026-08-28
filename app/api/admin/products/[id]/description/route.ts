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
  const body = (await request.json().catch(() => null)) as { description?: string } | null;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const description = body?.description?.trim() || null;
  const updated = await prisma.product.update({ where: { id }, data: { description } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PRODUCT_DESCRIPTION_UPDATE,
    targetType: "Product",
    targetId: id,
    targetLabel: product.name,
    note: description ?? undefined,
    request,
  });

  return NextResponse.json({ ok: true, product: { id: updated.id, description: updated.description } });
}
