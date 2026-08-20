import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { generateQrBuffer } from "@/lib/qr";

export async function GET(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product?.serialNumber) {
    return NextResponse.json({ error: "Product has no serial number yet" }, { status: 404 });
  }

  const buffer = await generateQrBuffer(product.serialNumber);

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.QR_DOWNLOAD,
    targetType: "Product",
    targetId: productId,
    targetLabel: product.name,
    request,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${product.serialNumber}.png"`,
    },
  });
}
