import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl, productVerificationUrl } from "@/lib/qr";
import { nextSerialNumberForBrand } from "@/lib/serial";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { revalidatePublicProduct } from "@/lib/revalidate";

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
    try {
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

      await createNotification({
        brandId: product.brandId,
        type: "PRODUCT_REJECTED",
        message: `"${product.name}" was rejected`,
        detail: updated.rejectionNote ?? undefined,
        href: `/brand/products/${id}/edit`,
      });

      revalidatePublicProduct({ slug: product.slug, serialNumber: product.serialNumber });

      return NextResponse.json({ ok: true, product: updated });
    } catch (error) {
      console.error("[POST /api/admin/products/[id]/decision REJECT]", error);
      return NextResponse.json({ error: "Could not reject product. Please try again." }, { status: 500 });
    }
  }

  try {
    // Serial assignment (an atomic per-brand sequence increment) and the
    // QR render (a fast, local, no-I/O computation) both happen inside
    // the same transaction as the product/OriginCard writes, so the
    // "reserve a number" and "write the record that uses it" steps can
    // never be split by a concurrent request the way the old scheme's
    // separate read-then-write-elsewhere could be.
    const updated = await prisma.$transaction(async (tx) => {
      const serialNumber = product.serialNumber ?? (await nextSerialNumberForBrand(tx, product.brandId));
      const qrCodeUrl = await generateQrDataUrl(serialNumber);

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
      metadata: { serialNumber: updated.serialNumber },
      request,
    });

    await createNotification({
      brandId: product.brandId,
      type: "PRODUCT_APPROVED",
      message: `"${product.name}" was approved and is now live`,
      href: `/brand/products/${id}`,
    });

    revalidatePublicProduct({ slug: updated.slug, serialNumber: updated.serialNumber });

    return NextResponse.json({
      ok: true,
      product: updated,
      verificationUrl: productVerificationUrl(updated.serialNumber!),
      qrCodeDataUrl: updated.qrCodeUrl,
    });
  } catch (error) {
    console.error("[POST /api/admin/products/[id]/decision APPROVE]", error);
    return NextResponse.json({ error: "Could not approve product. Please try again." }, { status: 500 });
  }
}
