import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isTrustedBlobUrl } from "@/lib/blob";
import { createCertificatesAndClaims, type CertificateInput, type ClaimInput } from "@/lib/product-submission";

type PatchBody = {
  name?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  images?: { url: string; altText?: string }[];
  claims?: ClaimInput[];
  ingredients?: { name: string; note?: string }[];
  certificates?: CertificateInput[];
};

const DOC_TYPES = new Set(["CERTIFICATE", "LAB_REPORT", "INGREDIENT_LIST", "SOURCING_PROOF", "OTHER"]);

function clamp(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || product.brandId !== session.brandId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as PatchBody | null;

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }
  if (!body.category?.trim()) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }
  const images = (body.images ?? []).filter((image) => image.url?.trim());
  if (images.length === 0) {
    return NextResponse.json({ error: "At least one product photo is required" }, { status: 400 });
  }
  const claims = (body.claims ?? []).filter((claim) => claim.label?.trim());
  const ingredients = (body.ingredients ?? []).filter((ingredient) => ingredient.name?.trim());
  const certificates = (body.certificates ?? []).filter(
    (cert) => cert.title?.trim() && cert.fileUrl?.trim() && DOC_TYPES.has(cert.docType),
  );
  const untrustedCertificate = certificates.find((cert) => !isTrustedBlobUrl(cert.fileUrl));
  if (untrustedCertificate) {
    return NextResponse.json({ error: "fileUrl must point to an uploaded file" }, { status: 400 });
  }

  // Editing anything past DRAFT (SUBMITTED, IN_REVIEW, APPROVED, REJECTED)
  // sends it back through review — for an already-live product this takes
  // it offline until an admin re-approves the change, which is also how
  // admin finds out an edit happened: it reappears in the pending queue.
  const needsReReview = product.status !== "DRAFT";

  const category = await prisma.category.upsert({
    where: { name: body.category.trim() },
    update: {},
    create: { name: body.category.trim() },
  });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.claim.deleteMany({ where: { productId: id } });
    await tx.ingredient.deleteMany({ where: { productId: id } });
    await tx.certificate.deleteMany({ where: { productId: id } });

    const updated = await tx.product.update({
      where: { id },
      data: {
        name: clamp(body.name!, 200),
        category: { connect: { id: category.id } },
        subcategory: body.subcategory?.trim() ? clamp(body.subcategory, 200) : null,
        description: body.description?.trim() ? clamp(body.description, 5000) : null,
        ...(needsReReview
          ? { status: "SUBMITTED", submittedAt: new Date(), reviewedAt: null, rejectionNote: null }
          : {}),
        images: {
          create: images.map((image, index) => ({
            url: image.url,
            altText: image.altText?.trim() ? clamp(image.altText, 300) : null,
            position: index,
          })),
        },
        ingredients: {
          create: ingredients.map((ingredient) => ({
            name: clamp(ingredient.name, 200),
            note: ingredient.note?.trim() ? clamp(ingredient.note, 1000) : null,
          })),
        },
      },
    });

    await createCertificatesAndClaims(tx, id, certificates, claims);

    return updated;
  });

  await logAudit({
    actor: session,
    action: needsReReview ? AUDIT_ACTIONS.PRODUCT_RESUBMIT : AUDIT_ACTIONS.PRODUCT_EDIT,
    targetType: "Product",
    targetId: id,
    targetLabel: updated.name,
    request,
  });

  return NextResponse.json({ ok: true, product: { id: updated.id, slug: updated.slug } });
}
