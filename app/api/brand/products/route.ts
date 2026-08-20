import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBrandSession } from "@/lib/api-auth";
import { slugify } from "@/lib/auth";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

type SubmitBody = {
  name?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  images?: { url: string; altText?: string }[];
  claims?: { label: string; evidence?: string }[];
  certificates?: { title: string; docType: string; fileUrl: string; mimeType?: string }[];
};

const DOC_TYPES = new Set(["CERTIFICATE", "LAB_REPORT", "INGREDIENT_LIST", "SOURCING_PROOF", "OTHER"]);

async function uniqueProductSlug(base: string) {
  let slug = base || "product";
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

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
  const certificates = (body.certificates ?? []).filter(
    (cert) => cert.title?.trim() && cert.fileUrl?.trim() && DOC_TYPES.has(cert.docType),
  );

  const slug = await uniqueProductSlug(slugify(body.name));
  const category = await prisma.category.upsert({
    where: { name: body.category.trim() },
    update: {},
    create: { name: body.category.trim() },
  });

  const product = await prisma.product.create({
    data: {
      slug,
      name: body.name.trim(),
      brand: { connect: { id: session.brandId } },
      category: { connect: { id: category.id } },
      subcategory: body.subcategory?.trim() || null,
      description: body.description?.trim() || null,
      status: "SUBMITTED",
      submittedAt: new Date(),
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

  await logAudit({
    actor: session,
    action: AUDIT_ACTIONS.PRODUCT_SUBMIT,
    targetType: "Product",
    targetId: product.id,
    targetLabel: product.name,
    request,
  });

  return NextResponse.json({ ok: true, product: { id: product.id, slug: product.slug } });
}
