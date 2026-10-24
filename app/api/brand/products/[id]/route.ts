import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isTrustedBlobUrl } from "@/lib/blob";
import { createCertificatesAndClaims, clampNumber, type CertificateInput, type ClaimInput } from "@/lib/product-submission";
import { revalidatePublicProduct } from "@/lib/revalidate";

type PatchBody = {
  name?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  images?: { url: string; altText?: string; focalX?: number; focalY?: number; zoom?: number }[];
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

  try {
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
              focalX: clampNumber(image.focalX, 0.5, 0, 1),
              focalY: clampNumber(image.focalY, 0.5, 0, 1),
              zoom: clampNumber(image.zoom, 1, 1, 3),
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
    }, { timeout: 15000 });

    await logAudit({
      actor: session,
      action: needsReReview ? AUDIT_ACTIONS.PRODUCT_RESUBMIT : AUDIT_ACTIONS.PRODUCT_EDIT,
      targetType: "Product",
      targetId: id,
      targetLabel: updated.name,
      request,
    });

    // Covers both directions: an edit to a live product takes it offline
    // (needsReReview), and a re-approval later brings an edited product back —
    // either way the public pages were showing this product's old state.
    revalidatePublicProduct({ slug: updated.slug, serialNumber: updated.serialNumber });

    return NextResponse.json({ ok: true, product: { id: updated.id, slug: updated.slug } });
  } catch (error) {
    console.error("[PATCH /api/brand/products/[id]]", error);
    return NextResponse.json({ error: "Could not save product. Please try again." }, { status: 500 });
  }
}
