/**
 * Data Repository Layer
 * ----------------------------------------------------------------------
 * Public product pages call the functions below instead of reaching into
 * static arrays directly.
 *
 * This file now prefers live Prisma data. If the database has no approved
 * products yet, it falls back to the existing demo content so the site
 * remains usable while the product-upload flow is still being built.
 */

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import {
  sampleProducts,
  sampleBrand,
  publicProductCollection,
  productCategories,
  claimStatusMap,
  type ProductRecord,
  type BrandRecord,
} from "./site-data";

type DbProduct = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    images: true;
    claims: { include: { certificates: true } };
    certificates: true;
    ingredients: true;
    originCards: true;
  };
}>;

const productInclude = {
  brand: true,
  category: true,
  images: { orderBy: { position: "asc" as const } },
  claims: { include: { certificates: true } },
  certificates: true,
  ingredients: { orderBy: { name: "asc" as const } },
  originCards: {
    where: { status: "PUBLISHED" as const },
    orderBy: { publishedAt: "desc" as const },
    take: 1,
  },
} satisfies Prisma.ProductInclude;

// Lighter include for list views (catalog grid, related products): the
// card only renders name/brand/category/image, and the only other thing
// read client-side is claim.status (for the certification filter) — no
// need to fetch every claim's linked certificates, the product's own
// certificates, ingredients, or origin cards for every row in a listing.
const productSummaryInclude = {
  brand: true,
  category: true,
  images: { orderBy: { position: "asc" as const } },
  claims: { select: { id: true, status: true } },
} satisfies Prisma.ProductInclude;

type DbProductSummary = Prisma.ProductGetPayload<{ include: typeof productSummaryInclude }>;

function formatDate(value: Date | null | undefined): string {
  const date = value ?? new Date();
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function mapDbProduct(product: DbProduct): ProductRecord {
  const sortedImages = product.images.slice().sort((a, b) => a.position - b.position);
  const imageGallery = sortedImages.map((image) => image.url);
  const heroImage = sortedImages[0];
  const heroFocalPoint = heroImage ? { x: heroImage.focalX, y: heroImage.focalY, zoom: heroImage.zoom } : undefined;

  const claims = product.claims.map((claim) => ({
    id: claim.id,
    text: claim.label,
    status: claimStatusMap[claim.status],
    requiredEvidence: claim.label,
    evidence: claim.evidence ?? "",
    certificateIds: claim.certificates.map((certificate) => certificate.id),
  }));

  // fileUrl is only ever included for a Public certificate — a Private
  // one's file location must never reach the client, not just be hidden
  // in the UI, so this omission happens here at the data layer.
  const certificates = product.certificates.map((certificate) => ({
    id: certificate.id,
    title: certificate.title,
    issuer: certificate.issuer,
    fileUrl: certificate.isPublic ? certificate.fileUrl : null,
    docType: certificate.docType,
    verified: certificate.verified,
    reviewNote: certificate.reviewNote,
    isPublic: certificate.isPublic,
    testDate: certificate.testDate ? formatDate(certificate.testDate) : null,
    testType: certificate.testType,
    testScope: certificate.testScope,
  }));

  const ingredients = (product.ingredients ?? []).map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    note: ingredient.note,
  }));

  const publishedCard = product.originCards?.[0];
  const originCard = publishedCard
    ? {
        id: publishedCard.id,
        template: publishedCard.template,
        title: publishedCard.title,
        status: publishedCard.status,
        pdfUrl: publishedCard.pdfUrl,
        pngUrl: publishedCard.pngUrl,
        publishedAt: publishedCard.publishedAt ? formatDate(publishedCard.publishedAt) : null,
      }
    : null;

  return {
    id: product.id,
    slug: product.slug,
    scanCode: product.serialNumber ?? product.slug.toUpperCase(),
    imageGallery: imageGallery.length > 0 ? imageGallery : ["/images/hero.webp"],
    heroFocalPoint,
    name: product.name,
    brand: product.brand.name,
    brandSlug: product.brand.slug,
    brandLogoUrl: product.brand.logoUrl,
    category: product.category.name,
    subcategory: product.subcategory ?? product.category.name,
    summary: product.description ?? "",
    productNote: product.description ?? "",
    lastUpdated: formatDate(product.approvedAt ?? product.updatedAt),
    claims:
      claims.length > 0
        ? claims
        : [
            {
              text: "Product details uploaded",
              status: "No Evidence Submitted",
              requiredEvidence: "Supporting documents",
              evidence: "No claim evidence has been linked yet.",
              certificateIds: [],
            },
          ],
    certificates,
    ingredients,
    originCard,
  };
}

function mapDbProductSummary(product: DbProductSummary): ProductRecord {
  const sortedImages = product.images.slice().sort((a, b) => a.position - b.position);
  const imageGallery = sortedImages.map((image) => image.url);
  const heroImage = sortedImages[0];
  const heroFocalPoint = heroImage ? { x: heroImage.focalX, y: heroImage.focalY, zoom: heroImage.zoom } : undefined;

  const claims = product.claims.map((claim) => ({
    id: claim.id,
    text: "",
    status: claimStatusMap[claim.status],
    requiredEvidence: "",
    evidence: "",
    certificateIds: [] as string[],
  }));

  return {
    id: product.id,
    slug: product.slug,
    scanCode: product.serialNumber ?? product.slug.toUpperCase(),
    imageGallery: imageGallery.length > 0 ? imageGallery : ["/images/hero.webp"],
    heroFocalPoint,
    name: product.name,
    brand: product.brand.name,
    brandSlug: product.brand.slug,
    brandLogoUrl: product.brand.logoUrl,
    category: product.category.name,
    subcategory: product.subcategory ?? product.category.name,
    summary: product.description ?? "",
    productNote: product.description ?? "",
    lastUpdated: formatDate(product.approvedAt ?? product.updatedAt),
    claims,
    certificates: [],
    ingredients: [],
    originCard: null,
  };
}

function allDemoProducts(): ProductRecord[] {
  const bySlug = new Map<string, ProductRecord>();
  for (const product of [...sampleProducts, ...publicProductCollection]) {
    bySlug.set(product.slug, product);
  }
  return Array.from(bySlug.values());
}

async function getApprovedDbProducts(where: Prisma.ProductWhereInput = {}) {
  return prisma.product.findMany({
    where: {
      status: "APPROVED",
      ...where,
    },
    include: productInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export type ProductFilters = {
  category?: string;
  brandSlug?: string;
  search?: string;
};

function applyDemoFilters(products: ProductRecord[], filters: ProductFilters = {}) {
  let filtered = products;

  if (filters.category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === filters.category!.toLowerCase(),
    );
  }
  if (filters.brandSlug) {
    filtered = filtered.filter((p) => p.brandSlug === filters.brandSlug);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }

  return filtered;
}

/** Returns every published, approved product. */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductRecord[]> {
  const dbProducts = (await prisma.product.findMany({
    where: {
      status: "APPROVED",
      hidden: false,
      archived: false,
      deletedAt: null,
      ...(filters.category ? { category: { name: filters.category } } : {}),
      ...(filters.brandSlug ? { brand: { slug: filters.brandSlug } } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { slug: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
              { brand: { name: { contains: filters.search, mode: "insensitive" } } },
              { category: { name: { contains: filters.search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: productSummaryInclude,
    orderBy: { updatedAt: "desc" },
  })) as DbProductSummary[];

  if (dbProducts.length > 0) {
    return dbProducts.map(mapDbProductSummary);
  }

  return applyDemoFilters(allDemoProducts(), filters);
}

/** Returns a single product by its slug (used by /product/[slug] and /p/[slug]). */
async function getProductBySlugUncached(slug: string): Promise<ProductRecord | null> {
  const product = (await prisma.product.findFirst({
    where: { slug, status: "APPROVED", hidden: false, archived: false, deletedAt: null },
    include: productInclude,
  })) as DbProduct | null;

  if (product) {
    return mapDbProduct(product);
  }

  return allDemoProducts().find((p) => p.slug === slug) ?? null;
}

// Wrapped in React's cache() so generateMetadata and the page component
// (which both resolve the same product) share one Prisma query per
// request instead of issuing it twice.
export const getProductBySlug = cache(getProductBySlugUncached);

async function getProductBySerialUncached(serial: string): Promise<ProductRecord | null> {
  const normalized = serial.trim().toUpperCase();

  const product = (await prisma.product.findFirst({
    where: {
      status: "APPROVED",
      hidden: false,
      archived: false,
      deletedAt: null,
      serialNumber: { equals: normalized, mode: "insensitive" },
    },
    include: productInclude,
  })) as DbProduct | null;

  if (product) {
    return mapDbProduct(product);
  }

  return (
    allDemoProducts().find(
      (p) => p.scanCode.trim().toUpperCase() === normalized || p.slug.trim().toUpperCase() === normalized,
    ) ?? null
  );
}

/** Returns a single product by its public-facing serial number. */
export const getProductBySerial = cache(getProductBySerialUncached);

export type BrandProductPreview = {
  product: ProductRecord;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectionNote: string | null;
};

/**
 * Returns a single product for its OWNING BRAND to preview, regardless of
 * approval status (DRAFT/SUBMITTED/IN_REVIEW/REJECTED/APPROVED) — unlike
 * getProductBySlug/getProductBySerial above, which only ever resolve
 * APPROVED, non-hidden products (the public contract). Ownership is
 * enforced by brandId, not just existence, so one brand can never preview
 * another's unapproved product. Returns null if the product doesn't exist
 * or doesn't belong to this brand — never throws, callers should 404.
 *
 * Returns the public-shaped ProductRecord (for reuse with ProductDetailTabs)
 * alongside the operational fields (status, review dates, rejection note)
 * that aren't part of the public product shape but a brand needs to see on
 * their own product — rather than polluting ProductRecord itself, which is
 * used across the public site, with brand-only fields.
 */
export async function getProductForBrandPreview(id: string, brandId: string): Promise<BrandProductPreview | null> {
  const product = (await prisma.product.findUnique({
    where: { id },
    include: productInclude,
  })) as DbProduct | null;

  if (!product || product.brandId !== brandId) {
    return null;
  }

  return {
    product: mapDbProduct(product),
    status: product.status,
    submittedAt: product.submittedAt ? formatDate(product.submittedAt) : null,
    reviewedAt: product.reviewedAt ? formatDate(product.reviewedAt) : null,
    approvedAt: product.approvedAt ? formatDate(product.approvedAt) : null,
    rejectionNote: product.rejectionNote,
  };
}

/** Returns every distinct product category. */
export async function getCategories(): Promise<string[]> {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  const merged = new Set<string>(["All Categories", ...categories.map((category) => category.name)]);
  productCategories.forEach((category) => merged.add(category));

  if (merged.size > 1) {
    return Array.from(merged);
  }

  return Array.from(new Set([...productCategories]));
}

/** Returns a brand by slug. */
export async function getBrandBySlug(slug: string): Promise<BrandRecord | null> {
  const brand = await prisma.brand.findFirst({
    where: { slug, deletedAt: null, status: { not: "SUSPENDED" } },
    include: {
      products: {
        where: { status: "APPROVED", hidden: false, archived: false, deletedAt: null },
        select: { slug: true },
      },
    },
  });

  if (brand) {
    return {
      slug: brand.slug,
      name: brand.name,
      label: brand.status === "ACTIVE" ? "Featured Brand" : "Brand",
      summary: brand.summary ?? "",
      productCount: brand.products.length,
      products: brand.products.map((product) => product.slug),
    };
  }

  return sampleBrand.slug === slug ? sampleBrand : null;
}

/** Returns every brand known to the platform. */
export async function getBrands(): Promise<BrandRecord[]> {
  const brands = await prisma.brand.findMany({
    where: { deletedAt: null, status: { not: "SUSPENDED" } },
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { status: "APPROVED", hidden: false, archived: false, deletedAt: null },
        select: { slug: true },
      },
    },
  });

  if (brands.length > 0) {
    return brands.map((brand) => ({
      slug: brand.slug,
      name: brand.name,
      label: brand.status === "ACTIVE" ? "Featured Brand" : "Brand",
      summary: brand.summary ?? "",
      productCount: brand.products.length,
      products: brand.products.map((product) => product.slug),
    }));
  }

  return [sampleBrand];
}

/** Related products: same category, excluding the product itself, capped to `limit`. */
export async function getRelatedProducts(category: string, excludeSlug: string, limit = 4): Promise<ProductRecord[]> {
  const dbRelated = await getProducts({ category });
  const related = dbRelated.filter((product) => product.slug !== excludeSlug).slice(0, limit);

  if (related.length > 0) {
    return related;
  }

  return allDemoProducts()
    .filter((product) => product.slug !== excludeSlug && product.category === category)
    .slice(0, limit);
}
