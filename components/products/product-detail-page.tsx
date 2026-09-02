import Image from "next/image";
import Link from "next/link";
import { FadeIn, HeroReveal } from "@/components/motion";
import { AssetImage } from "@/components/brands/asset-image";
import { ProductDetailTabs } from "@/components/products/product-detail-tabs";
import { RelatedProductsStrip } from "@/components/products/related-products-strip";
import { ScanSessionProvider, ScanTracker } from "@/components/analytics/scan-tracking";
import { ProductRecord } from "@/lib/data/site-data";
import docElement from "../../public/images/claim-elements/doc.webp";

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

  const originCard = product.originCard;

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
          {originCard && originCard.status === "PUBLISHED" ? (
            <FadeIn delay={0.05}>
              <article className="origincard-banner">
                <div className="origincard-banner-media">
                  {originCard.pngUrl ? (
                    <AssetImage src={originCard.pngUrl} alt={originCard.title ?? "OriginCard"} className="origincard-banner-image" />
                  ) : (
                    <div className="origincard-banner-fallback">
                      <Image src={docElement} alt="" width={32} height={32} />
                    </div>
                  )}
                </div>
                <div className="origincard-banner-copy">
                  <p className="origincard-banner-eyebrow">OriginCard</p>
                  <h2>{originCard.title ?? "Product OriginCard"}</h2>
                  <p>
                    TruOrigin has published this product&apos;s information.
                    {originCard.publishedAt ? ` Published ${originCard.publishedAt}.` : ""}
                  </p>
                  {originCard.pngUrl || originCard.pdfUrl ? (
                    <div className="origincard-banner-actions">
                      {originCard.pngUrl ? (
                        <a href={originCard.pngUrl} target="_blank" rel="noreferrer" className="saas-btn-primary">
                          <span>View Card</span>
                        </a>
                      ) : null}
                      {originCard.pdfUrl ? (
                        <a href={originCard.pdfUrl} target="_blank" rel="noreferrer" className="saas-btn-outline">
                          <span>Download PDF</span>
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            </FadeIn>
          ) : null}

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
