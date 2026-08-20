import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const certificate = await prisma.certificate.findUnique({ where: { id }, include: { product: true } });

  if (!certificate || certificate.product.brandId !== session.brandId) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (certificate.product.status === "APPROVED") {
    return NextResponse.json(
      { error: "This product is already approved — contact TruOrigin support to remove supporting evidence." },
      { status: 400 },
    );
  }

  await prisma.certificate.delete({ where: { id } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.DOCUMENT_DELETE,
    targetType: "Certificate",
    targetId: id,
    targetLabel: certificate.title,
    metadata: { productId: certificate.productId },
    request,
  });

  return NextResponse.json({ ok: true });
}
