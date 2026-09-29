import Image from "next/image";
import Link from "next/link";
import { FadeIn, HeroReveal } from "@/components/motion";
import { ProductDetailTabs } from "@/components/products/product-detail-tabs";
import { RelatedProductsStrip } from "@/components/products/related-products-strip";
import { ScanSessionProvider, ScanTracker } from "@/components/analytics/scan-tracking";
import { ProductRecord } from "@/lib/data/site-data";

export function ProductDetailPage({
  product,
  relatedProducts,
}: {
  product: ProductRecord;
  relatedProducts: ProductRecord[];
}) {
  const highlightCards = [
    { title: "Category", value: product.category },
    { title: "Product Information", value: "Submitted" },
    { title: "Information Sources", value: "Brand-provided information" },
    { title: "Last Updated", value: product.lastUpdated },
  ];

  return (
    <ScanSessionProvider productId={product.id}>
      <div className="product-detail-page">
        <ScanTracker />
        <section className="container-shell product-detail-hero" id="hero">
          <div className="product-detail-hero-grid">
            <HeroReveal className="product-detail-hero-media">
              <div className="product-detail-image-wrap">
                <Image
                  src={product.imageGallery[0]}
                  alt={product.name}
                  fill
                  className="product-detail-image"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </HeroReveal>

            <div className="product-detail-intro">
              <HeroReveal delay={0.18} className="product-detail-name-wrap">
                <h1 className="product-detail-name">{product.name}</h1>
              </HeroReveal>
              <HeroReveal delay={0.13} className="product-detail-brand-wrap">
                <p className="product-detail-brand">{product.brand}</p>
              </HeroReveal>
              <HeroReveal delay={0.23} className="product-detail-status-wrap">
                <p className="product-detail-status">
                  <span className="product-detail-status-dot" />
                  Product Information Submitted
                </p>
              </HeroReveal>
              <HeroReveal delay={0.28} className="product-detail-summary-wrap">
                <p className="product-detail-summary">{product.summary}</p>
              </HeroReveal>
              <HeroReveal delay={0.33} className="product-detail-meta-wrap">
                <div className="product-detail-meta">
                  <span>{product.category}</span>
                  <span>Updated {product.lastUpdated}</span>
                  <span>Code: {product.scanCode}</span>
                </div>
              </HeroReveal>
            </div>
          </div>
        </section>

        <section className="container-shell product-detail-sections">
          <FadeIn>
            <div className="product-stat-card">
              {highlightCards.map((item) => (
                <div key={item.title} className="product-stat-cell">
                  <p>{item.title}</p>
                  <h3>{item.value}</h3>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <ProductDetailTabs product={product} />
          </FadeIn>

          {relatedProducts.length > 0 ? (
            <FadeIn delay={0.2}>
              <RelatedProductsStrip products={relatedProducts} />
            </FadeIn>
          ) : null}

          <div className="product-detail-footer-actions">
            <Link href="/for-products/products" className="saas-btn-outline">
              &larr; Back to Products
            </Link>
            <Link href="/for-products/support" className="saas-btn-primary">
              Need Help?
            </Link>
          </div>
        </section>
      </div>
    </ScanSessionProvider>
  );
}
