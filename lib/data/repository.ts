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

import { prisma } from "@/lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import {
  sampleProducts,
  sampleBrand,
  publicProductCollection,
  productCategories,
  type ProductRecord,
  type BrandRecord,
} from "./site-data";

type DbProduct = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    images: true;
    claims: true;
    certificates: true;
    ingredients: true;
    originCards: true;
  };
}>;

const productInclude = {
  brand: true,
  category: true,
  images: { orderBy: { position: "asc" as const } },
  claims: true,
  certificates: true,
  ingredients: { orderBy: { name: "asc" as const } },
  originCards: {
    where: { status: "PUBLISHED" as const },
    orderBy: { publishedAt: "desc" as const },
    take: 1,
  },
} satisfies Prisma.ProductInclude;

const claimStatusMap: Record<"VERIFIED" | "PARTIALLY_VERIFIED" | "UNVERIFIED" | "REJECTED", ProductRecord["claims"][number]["status"]> = {
  VERIFIED: "Evidence Available",
  PARTIALLY_VERIFIED: "Limited Evidence",
  UNVERIFIED: "No Evidence Submitted",
  REJECTED: "No Evidence Submitted",
};

function formatDate(value: Date | null | undefined): string {
  const date = value ?? new Date();
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function mapDbProduct(product: DbProduct): ProductRecord {
  const imageGallery = product.images
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((image) => image.url);

  const claims = product.claims.map((claim) => ({
    id: claim.id,
    text: claim.label,
    status: claimStatusMap[claim.status],
    requiredEvidence: claim.label,
    evidence: claim.evidence ?? "",
  }));

  const certificates = product.certificates.map((certificate) => ({
    id: certificate.id,
    title: certificate.title,
    issuer: certificate.issuer,
    fileUrl: certificate.fileUrl,
    docType: certificate.docType,
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
            },
          ],
    certificates,
    ingredients,
    originCard,
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
    include: productInclude,
    orderBy: { updatedAt: "desc" },
  })) as DbProduct[];

  if (dbProducts.length > 0) {
    return dbProducts.map(mapDbProduct);
  }

  return applyDemoFilters(allDemoProducts(), filters);
}

/** Returns a single product by its slug (used by /product/[slug] and /p/[slug]). */
export async function getProductBySlug(slug: string): Promise<ProductRecord | null> {
  const product = (await prisma.product.findFirst({
    where: { slug, status: "APPROVED", hidden: false, archived: false, deletedAt: null },
    include: productInclude,
  })) as DbProduct | null;

  if (product) {
    return mapDbProduct(product);
  }

  return allDemoProducts().find((p) => p.slug === slug) ?? null;
}

/** Returns a single product by its public-facing serial number. */
export async function getProductBySerial(serial: string): Promise<ProductRecord | null> {
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
export async function getRelatedProducts(slug: string, limit = 4): Promise<ProductRecord[]> {
  const current = await getProductBySlug(slug);
  if (!current) return [];

  const dbRelated = await getProducts({ category: current.category });
  const related = dbRelated.filter((product) => product.slug !== slug).slice(0, limit);

  if (related.length > 0) {
    return related;
  }

  return allDemoProducts()
    .filter((product) => product.slug !== slug && product.category === current.category)
    .slice(0, limit);
}
