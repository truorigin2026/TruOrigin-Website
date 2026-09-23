import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isTrustedBlobUrl } from "@/lib/blob";
import { createProductForBrand, type CertificateInput, type ClaimInput } from "@/lib/product-submission";

type SubmitBody = {
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

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: brandId } = await params;
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  if (!brand || brand.deletedAt) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as SubmitBody | null;

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

  const product = await createProductForBrand(brandId, {
    name: body.name,
    category: body.category,
    subcategory: body.subcategory,
    description: body.description,
    images,
    ingredients,
    certificates,
    claims,
  });

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PRODUCT_ADMIN_CREATE,
    targetType: "Product",
    targetId: product.id,
    targetLabel: product.name,
    metadata: { brandId, brandName: brand.name },
    request,
  });

  return NextResponse.json({ ok: true, product: { id: product.id, slug: product.slug } });
}
