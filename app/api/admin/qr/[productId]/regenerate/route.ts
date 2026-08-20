import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { generateQrDataUrl } from "@/lib/qr";

/**
 * Re-renders the QR image from the EXISTING serial. Never reissues the
 * serial — doing so would break any tags already printed with the old code.
 */
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

  if (!product.serialNumber) {
    return NextResponse.json({ error: "Product has no serial number to regenerate a QR from" }, { status: 400 });
  }

  const qrCodeUrl = await generateQrDataUrl(product.serialNumber);
  const updated = await prisma.product.update({ where: { id: productId }, data: { qrCodeUrl } });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.QR_REGENERATE,
    targetType: "Product",
    targetId: productId,
    targetLabel: product.name,
    metadata: { serialNumber: product.serialNumber },
    request,
  });

  return NextResponse.json({ ok: true, product: updated });
}
