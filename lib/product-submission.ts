/**
 * Shared write logic for brand product submission (create + edit).
 * ----------------------------------------------------------------------
 * Certificates and claims arrive from the wizard as two arrays that may
 * reference each other via wizard-local ids (claim.linkedDocumentIds
 * pointing at a certificate's localId) — neither side has a real
 * database id yet. Certificates are created first so their real ids can
 * be resolved, then claims are created with `connect` to those ids.
 */
import type { Prisma } from "../generated/prisma/client";
import { prisma } from "./prisma";
import { slugify } from "./auth";

export type CertificateInput = {
  localId?: string;
  title: string;
  fileUrl: string;
  docType: string;
  mimeType?: string;
  issuer?: string;
  testDate?: string;
  testType?: string;
  testScope?: string;
  reviewNote?: string;
  isPublic?: boolean;
};

export type ClaimInput = {
  label: string;
  evidence?: string;
  linkedDocumentIds?: string[];
};

function clamp(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export async function createCertificatesAndClaims(
  tx: Prisma.TransactionClient,
  productId: string,
  certificates: CertificateInput[],
  claims: ClaimInput[],
) {
  const createdCertificates = await Promise.all(
    certificates.map((cert) =>
      tx.certificate.create({
        data: {
          productId,
          title: clamp(cert.title, 300),
          fileUrl: cert.fileUrl,
          docType: cert.docType as never,
          mimeType: cert.mimeType || null,
          issuer: cert.issuer?.trim() ? clamp(cert.issuer, 200) : null,
          testDate: cert.testDate ? new Date(cert.testDate) : null,
          testType: cert.testType?.trim() ? clamp(cert.testType, 200) : null,
          testScope: cert.testScope?.trim() ? clamp(cert.testScope, 300) : null,
          reviewNote: cert.reviewNote?.trim() ? clamp(cert.reviewNote, 2000) : null,
          isPublic: cert.isPublic ?? true,
        },
      }),
    ),
  );

  const localIdToRealId = new Map<string, string>();
  certificates.forEach((cert, index) => {
    if (cert.localId) localIdToRealId.set(cert.localId, createdCertificates[index].id);
  });

  await Promise.all(
    claims.map((claim) => {
      const linkedIds = (claim.linkedDocumentIds ?? [])
        .map((localId) => localIdToRealId.get(localId))
        .filter((id): id is string => Boolean(id));

      return tx.claim.create({
        data: {
          productId,
          label: clamp(claim.label, 300),
          evidence: claim.evidence?.trim() ? clamp(claim.evidence, 2000) : null,
          ...(linkedIds.length > 0 ? { certificates: { connect: linkedIds.map((id) => ({ id })) } } : {}),
        },
      });
    }),
  );
}

export type ProductCreateInput = {
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  images: { url: string; altText?: string }[];
  ingredients: { name: string; note?: string }[];
  certificates: CertificateInput[];
  claims: ClaimInput[];
};

async function uniqueProductSlug(base: string) {
  let slug = base || "product";
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

/**
 * Creates a product (with images, ingredients, certificates, claims)
 * under an explicit brandId — used both by a brand's own submission
 * (brandId from their session) and by the admin "upload for this brand"
 * tool (brandId from the URL). Caller validates the request body first.
 */
export async function createProductForBrand(brandId: string, input: ProductCreateInput) {
  const slug = await uniqueProductSlug(slugify(input.name));
  const category = await prisma.category.upsert({
    where: { name: input.category.trim() },
    update: {},
    create: { name: input.category.trim() },
  });

  return prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        slug,
        name: clamp(input.name, 200),
        brand: { connect: { id: brandId } },
        category: { connect: { id: category.id } },
        subcategory: input.subcategory?.trim() ? clamp(input.subcategory, 200) : null,
        description: input.description?.trim() ? clamp(input.description, 5000) : null,
        status: "SUBMITTED",
        submittedAt: new Date(),
        images: {
          create: input.images.map((image, index) => ({
            url: image.url,
            altText: image.altText?.trim() ? clamp(image.altText, 300) : null,
            position: index,
          })),
        },
        ingredients: {
          create: input.ingredients.map((ingredient) => ({
            name: clamp(ingredient.name, 200),
            note: ingredient.note?.trim() ? clamp(ingredient.note, 1000) : null,
          })),
        },
      },
    });

    await createCertificatesAndClaims(tx, created.id, input.certificates, input.claims);

    return created;
  });
}
