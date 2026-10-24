import { NextRequest, NextResponse } from "next/server";
import { requireBrandSession } from "@/lib/api-auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isTrustedBlobUrl } from "@/lib/blob";
import { createProductForBrand, type CertificateInput, type ClaimInput } from "@/lib/product-submission";

type SubmitBody = {
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

export async function POST(request: NextRequest) {
  const session = await requireBrandSession(request);
  if (!session || !session.brandId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  try {
    const product = await createProductForBrand(session.brandId, {
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
      action: AUDIT_ACTIONS.PRODUCT_SUBMIT,
      targetType: "Product",
      targetId: product.id,
      targetLabel: product.name,
      request,
    });

    return NextResponse.json({ ok: true, product: { id: product.id, slug: product.slug } });
  } catch (error) {
    console.error("[POST /api/brand/products]", error);
    return NextResponse.json({ error: "Could not save product. Please try again." }, { status: 500 });
  }
}
