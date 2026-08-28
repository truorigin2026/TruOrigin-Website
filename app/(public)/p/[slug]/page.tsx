import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/products/product-detail-page";
import { getProductBySerial, getProductBySlug, getProducts, getRelatedProducts } from "@/lib/data/repository";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbJsonLd, productJsonLd } from "@/lib/seo";

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
    return { title: "Product Not Found" };
  }

  const title = `${product.name} by ${product.brand}`;
  const description =
    product.summary || `Verified origin, claims, and supporting evidence for ${product.name} by ${product.brand} on TruOrigin.`;
  const image = product.imageGallery?.[0];

  return {
    title,
    description,
    alternates: { canonical: `/p/${product.scanCode}` },
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
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.slug, 6);

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
