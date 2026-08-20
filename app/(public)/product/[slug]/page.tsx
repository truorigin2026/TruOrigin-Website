import { notFound } from "next/navigation";
import { ProductDetailPage } from "@/components/products/product-detail-page";
import { getProductBySlug, getProducts, getRelatedProducts } from "@/lib/data/repository";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(slug, 6);

  return <ProductDetailPage product={product} relatedProducts={relatedProducts} />;
}
