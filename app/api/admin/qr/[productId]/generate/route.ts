import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { generateQrDataUrl } from "@/lib/qr";
import { nextSerialNumberForBrand } from "@/lib/serial";

export async function POST(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.status !== "APPROVED") {
    return NextResponse.json({ error: "Only approved products can have a QR generated" }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const serialNumber = product.serialNumber ?? (await nextSerialNumberForBrand(tx, product.brandId));
      const qrCodeUrl = await generateQrDataUrl(serialNumber);

      return tx.product.update({
        where: { id: productId },
        data: { serialNumber, qrCodeUrl },
      });
    });

    await logAudit({
      actor: session,
      action: AUDIT_ACTIONS.QR_GENERATE,
      targetType: "Product",
      targetId: productId,
      targetLabel: product.name,
      metadata: { serialNumber: updated.serialNumber },
      request,
    });

    return NextResponse.json({ ok: true, product: updated });
  } catch (error) {
    console.error("[POST /api/admin/qr/[productId]/generate]", error);
    return NextResponse.json({ error: "Could not generate QR code. Please try again." }, { status: 500 });
  }
}
