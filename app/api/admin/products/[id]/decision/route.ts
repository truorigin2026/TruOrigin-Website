import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, productVerificationUrl } from "@/lib/qr";
import { nextSerialNumber } from "@/lib/serial";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { decision?: "APPROVE" | "REJECT"; note?: string }
    | null;

  if (!body?.decision) {
    return NextResponse.json({ error: "Missing decision" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, category: true, claims: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (body.decision === "REJECT") {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        rejectionNote: body.note?.trim() || "Rejected by admin review.",
      },
    });

    await logAudit({
      actor: session,
      action: AUDIT_ACTIONS.PRODUCT_REJECT,
      targetType: "Product",
      targetId: id,
      targetLabel: product.name,
      note: updated.rejectionNote ?? undefined,
      request,
    });

    return NextResponse.json({ ok: true, product: updated });
  }

  const serialNumber = product.serialNumber ?? (await nextSerialNumber());
  const qrCodeUrl = await generateQrDataUrl(serialNumber);

  const updated = await prisma.$transaction(async (tx) => {
    const updatedProduct = await tx.product.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        reviewedAt: new Date(),
        serialNumber,
        qrCodeUrl,
        rejectionNote: null,
      },
    });

    const existingOriginCard = await tx.originCard.findFirst({ where: { productId: id } });
    if (!existingOriginCard) {
      await tx.originCard.create({
        data: { product: { connect: { id } }, title: product.name, status: "DRAFT" },
      });
    }

    return updatedProduct;
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PRODUCT_APPROVE,
    targetType: "Product",
    targetId: id,
    targetLabel: product.name,
    metadata: { serialNumber },
    request,
  });

  return NextResponse.json({
    ok: true,
    product: updated,
    verificationUrl: productVerificationUrl(serialNumber),
    qrCodeDataUrl: qrCodeUrl,
  });
}
