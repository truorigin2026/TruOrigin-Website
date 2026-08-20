import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { generateQrDataUrl } from "@/lib/qr";
import { nextSerialNumber } from "@/lib/serial";

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

  const serialNumber = product.serialNumber ?? (await nextSerialNumber());
  const qrCodeUrl = await generateQrDataUrl(serialNumber);

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { serialNumber, qrCodeUrl },
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.QR_GENERATE,
    targetType: "Product",
    targetId: productId,
    targetLabel: product.name,
    metadata: { serialNumber },
    request,
  });

  return NextResponse.json({ ok: true, product: updated });
}
