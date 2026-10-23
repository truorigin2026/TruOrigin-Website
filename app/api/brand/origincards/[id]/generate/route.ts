import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { generateQrDataUrl } from "@/lib/qr";
import { nextSerialNumberForBrand } from "@/lib/serial";

/**
 * Self-heal path only: OriginCard generation is normally an automatic side
 * effect of admin approval (see app/api/admin/products/[id]/decision).
 * This exists to recover a product that reached APPROVED without ever
 * getting a card — a brand can never generate one for an unapproved product.
 * Route param is named `id` (not `productId`) because Next.js requires every
 * dynamic segment at this path level to share one name — the sibling
 * app/api/brand/origincards/[id]/deactivate route already claims `id`.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product || product.brandId !== session.brandId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.status !== "APPROVED") {
    return NextResponse.json({ error: "Only an approved product can have an OriginCard generated." }, { status: 400 });
  }

  const existingCard = await prisma.originCard.findFirst({ where: { productId } });
  if (existingCard) {
    return NextResponse.json({ error: "This product already has an OriginCard." }, { status: 400 });
  }

  try {
    const { updatedProduct, card } = await prisma.$transaction(async (tx) => {
      const serialNumber = product.serialNumber ?? (await nextSerialNumberForBrand(tx, product.brandId));
      const qrCodeUrl = product.qrCodeUrl ?? (await generateQrDataUrl(serialNumber));

      const updatedProduct = await tx.product.update({ where: { id: productId }, data: { serialNumber, qrCodeUrl } });
      const card = await tx.originCard.create({
        data: { product: { connect: { id: productId } }, title: product.name, status: "DRAFT" },
      });

      return { updatedProduct, card };
    });

    await logAudit({
      actor: session,
      action: AUDIT_ACTIONS.ORIGINCARD_SELF_HEAL_GENERATE,
      targetType: "OriginCard",
      targetId: card.id,
      targetLabel: product.name,
      metadata: { serialNumber: updatedProduct.serialNumber },
      request,
    });

    return NextResponse.json({ ok: true, product: updatedProduct, card });
  } catch (error) {
    console.error("[POST /api/brand/origincards/[id]/generate]", error);
    return NextResponse.json({ error: "Could not generate OriginCard. Please try again." }, { status: 500 });
  }
}
