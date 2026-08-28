import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isTrustedBlobUrl } from "@/lib/blob";

type PatchBody = {
  name?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  images?: { url: string; altText?: string }[];
  claims?: { label: string; evidence?: string }[];
  ingredients?: { name: string; note?: string }[];
  certificates?: { title: string; docType: string; fileUrl: string; mimeType?: string }[];
};

const DOC_TYPES = new Set(["CERTIFICATE", "LAB_REPORT", "INGREDIENT_LIST", "SOURCING_PROOF", "OTHER"]);

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

  if (product.status !== "DRAFT" && product.status !== "REJECTED") {
    return NextResponse.json(
      { error: "This product can only be edited while it's a draft or has been rejected." },
      { status: 400 },
    );
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

  const wasRejected = product.status === "REJECTED";

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

    return tx.product.update({
      where: { id },
      data: {
        name: body.name!.trim(),
        category: { connect: { id: category.id } },
        subcategory: body.subcategory?.trim() || null,
        description: body.description?.trim() || null,
        ...(wasRejected
          ? { status: "SUBMITTED", submittedAt: new Date(), reviewedAt: null, rejectionNote: null }
          : {}),
        images: {
          create: images.map((image, index) => ({
            url: image.url,
            altText: image.altText?.trim() || null,
            position: index,
          })),
        },
        claims: {
          create: claims.map((claim) => ({
            label: claim.label.trim(),
            evidence: claim.evidence?.trim() || null,
          })),
        },
        ingredients: {
          create: ingredients.map((ingredient) => ({
            name: ingredient.name.trim(),
            note: ingredient.note?.trim() || null,
          })),
        },
        certificates: {
          create: certificates.map((cert) => ({
            title: cert.title.trim(),
            fileUrl: cert.fileUrl,
            docType: cert.docType as never,
            mimeType: cert.mimeType,
          })),
        },
      },
    });
  });

  await logAudit({
    actor: session,
    action: wasRejected ? AUDIT_ACTIONS.PRODUCT_RESUBMIT : AUDIT_ACTIONS.PRODUCT_EDIT,
    targetType: "Product",
    targetId: id,
    targetLabel: updated.name,
    request,
  });

  return NextResponse.json({ ok: true, product: { id: updated.id, slug: updated.slug } });
}
