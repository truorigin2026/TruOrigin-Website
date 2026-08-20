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
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.brand.update({ where: { id }, data: { deletedAt: now } }),
    prisma.product.updateMany({ where: { brandId: id }, data: { hidden: true } }),
  ]);

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.BRAND_DELETE,
    targetType: "Brand",
    targetId: id,
    targetLabel: brand.name,
    request,
  });

  return NextResponse.json({ ok: true });
}
