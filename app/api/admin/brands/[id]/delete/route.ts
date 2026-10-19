import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { revalidatePublicProduct } from "@/lib/revalidate";

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

  const affectedProducts = await prisma.product.findMany({
    where: { brandId: id, hidden: false },
    select: { slug: true, serialNumber: true },
  });

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

  // This hides every product the brand had live, which is a public-facing
  // change on statically-cached pages — same revalidation this route was
  // missing relative to every other product-visibility route.
  for (const product of affectedProducts) {
    revalidatePublicProduct({ slug: product.slug, serialNumber: product.serialNumber });
  }

  return NextResponse.json({ ok: true });
}
