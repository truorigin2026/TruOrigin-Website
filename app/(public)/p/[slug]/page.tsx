import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/products/product-detail-page";
import {
  getProductBySerial,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  productExistsByIdentifier,
} from "@/lib/data/repository";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";

// Statically generated per product (see generateStaticParams below).
// revalidatePublicProduct() gives an immediate on-demand refresh after a
// mutation — confirmed reliable (via a 3-way diagnostic test) for ordinary
// content changes: editing an approved product's content, and a new
// approval becoming visible both revalidate correctly, on-demand, with no
// delay. A short time-based ceiling is kept here too, as defense-in-depth
// against any future mutation path that forgets to call
// revalidatePublicProduct().
//
// What on-demand and time-based ISR revalidation do NOT reliably do,
// confirmed by the same diagnostic: turn an already-cached 200 into a 404.
// Both mechanisms repeatedly left a hidden/deleted product's page serving
// its stale full content — one probed for 90+ seconds past this revalidate
// window with no change — a known class of Next.js behavior where the
// incremental cache doesn't reliably replace a cached success with a
// freshly computed not-found() result. That's why this page never calls
// notFound() for a product that exists-but-isn't-visible (see below) —
// only for an identifier that never resolved to anything, which was never
// a cached success to begin with, so there's nothing for that bug to get
// stuck on.
export const revalidate = 60;

async function resolveProduct(param: string) {
  return (await getProductBySerial(param)) ?? (await getProductBySlug(param));
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.scanCode }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveProduct(slug);

  if (!product) {
    return { title: "Product Not Found", robots: { index: false, follow: true } };
  }

  const title = `${product.name} by ${product.brand}`;
  const description =
    product.summary || `Product information, claims, and supporting evidence for ${product.name} by ${product.brand} on TruOrigin.`;
  const image = product.imageGallery?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/p/${product.scanCode}` },
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(`/p/${product.scanCode}`),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await resolveProduct(slug);

  if (!product) {
    // Only truly-unknown identifiers reach notFound() — those were never a
    // cached success, so there's nothing for the stale-cache bug (see the
    // comment above) to get stuck on. An identifier that exists but isn't
    // currently visible (hidden/deleted/unapproved) instead renders a
    // normal, cacheable "no longer available" response: a 200-to-200
    // content swap on this same route, which the diagnostic test confirmed
    // revalidates correctly.
    if (await productExistsByIdentifier(slug)) {
      return (
        <div className="container-shell legal-page-header not-found-page">
          <p className="eyebrow">Unavailable</p>
          <h1 className="legal-page-title">Product No Longer Available</h1>
          <p className="legal-page-meta">
            This product&apos;s information is no longer publicly available.
          </p>
          <div className="not-found-actions">
            <PillButton href="/for-products/products" variant="primary" icon={<ArrowIcon />}>
              Browse Products
            </PillButton>
            <PillButton href="/for-products/support" variant="outline">
              Contact Support
            </PillButton>
          </div>
        </div>
      );
    }

    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.category, product.slug, 6);

  return (
    <>
      <JsonLd
        data={productJsonLd({
          name: product.name,
          code: product.scanCode,
          brand: product.brand,
          summary: product.summary,
          image: product.imageGallery?.[0],
          serialNumber: product.scanCode,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Products", path: "/for-products/products" },
          { name: product.name, path: `/p/${product.scanCode}` },
        ])}
      />
      <ProductDetailPage product={product} relatedProducts={relatedProducts} />
    </>
  );
}
