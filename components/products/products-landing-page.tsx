import Link from "next/link";
import { BadgeCheck, Check, PackageSearch, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { FaqAccordion } from "@/components/products/faq-accordion";
import { ProductsHeroSection } from "@/components/products/products-hero-section";
import { ProductCard } from "@/components/ui/product-card";
import { getProducts } from "@/lib/data/repository";
import { mapCategoryToFilter } from "@/lib/data/frontend-data";

const faqItems = [
  {
    question: "How do I open a product on TruOrigin?",
    answer:
      "Enter the serial number from the product or scan the code on pack. TruOrigin opens the matching product page so you can review claims, supporting documents, and product basics in one place.",
  },
  {
    question: "What if a claim has limited evidence?",
    answer:
      "That means some support was provided, but it still leaves gaps in specificity, freshness, or direct product-level relevance. The page helps you see that difference clearly.",
  },
  {
    question: "Do I need an app to use it?",
    answer:
      "No. The experience is designed to open directly in the browser from a QR scan or serial-number check.",
  },
  {
    question: "Can I compare different products?",
    answer:
      "Yes. The catalog and detail pages are structured consistently, which makes it easier to compare claim language, support status, and key product information.",
  },
] as const;

const aboutFeatures = [
  { icon: ShieldCheck, title: "Product Information", description: "Information supplied by brands you trust." },
  { icon: BadgeCheck, title: "Structured Presentation", description: "Everything about your product, in one place." },
  { icon: PackageSearch, title: "Clearer Reading", description: "Helping you avoid confusion and mixed messages." },
] as const;

const informationSteps = [
  { number: "1", title: "Find QR Code", description: "Locate the QR code on the product packaging." },
  { number: "2", title: "Scan or Enter", description: "Scan the QR code or enter the serial number." },
  { number: "3", title: "Open Product Page", description: "Get instant access to product information and details." },
  { number: "4", title: "View Supporting Files", description: "See certifications, documents, origin notes, and more." },
] as const;

const whyUseItPoints = [
  "Review organized product information",
  "Access certifications and supporting documents",
  "Know the origin and manufacturer",
  "Shop with confidence",
  "Reduce confusion before you buy",
];

export async function ProductsLandingPage() {
  const publicProductCollection = await getProducts();

  return (
    <div className="products-landing-page">
      <ProductsHeroSection />

      <section className="products-section-shell">
        <div className="container-shell">
          <div className="products-explore-header">
            <div>
              <h2>Explore Product Information</h2>
              <p>Products presented with supporting evidence, origin notes, and product details.</p>
            </div>
          </div>

          <div className="products-grid products-grid-featured">
            {publicProductCollection.slice(0, 6).map((product, index) => (
              <ProductCard
                key={product.slug}
                code={product.scanCode}
                name={product.name}
                brand={product.brand}
                brandLogoUrl={product.brandLogoUrl}
                category={mapCategoryToFilter(product.category, product.subcategory)}
                image={product.imageGallery[0]}
                delay={index * 0.05}
              />
            ))}
          </div>

          <div className="products-view-more">
            <Link href="/for-products/products" className="btn-primary">
              View More Products →
            </Link>
          </div>
        </div>
      </section>

      <section className="products-section-shell">
        <div className="container-shell">
          <div className="products-how-intro">
            <h2>How Product Information Works</h2>
          </div>

          <div className="products-how-steps">
            {informationSteps.map((step, index) => (
              <FadeIn key={step.number} delay={index * 0.06}>
                <div className="products-how-step">
                  <div className="products-how-step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="products-section-shell products-section-soft">
        <div className="container-shell">
          <div className="products-about-grid">
            <div className="products-about-left">
              <FadeIn>
                <div className="products-about-content">
                  <h2>About Product Information</h2>
                  <p>
                    TruOrigin helps you make informed choices by giving you instant access to
                    organized information about the products you love. Clarity you can use, anytime,
                    anywhere.
                  </p>
                  <Link href="/for-products/products" className="brand-inline-link">
                    Learn More
                  </Link>
                </div>
              </FadeIn>

              <div className="products-about-features">
                {aboutFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <FadeIn key={feature.title} delay={index * 0.06}>
                      <div className="products-about-feature">
                        <span className="products-about-feature-icon">
                          <Icon size={20} aria-hidden="true" />
                        </span>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>

            <FadeIn delay={0.15}>
              <div className="products-why-use-it">
                <h3>Why Use It?</h3>
                <ul className="products-benefits-list">
                  {whyUseItPoints.map((point) => (
                    <li key={point}>
                      <span className="products-benefit-check">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="products-section-shell">
        <div className="container-shell">
          <div className="section-intro centered">
            <h2>Have Questions? We&apos;re Here to Help.</h2>
            <p>Visit our Support Center for FAQs or contact us for more assistance.</p>
          </div>

          <div className="support-faq-wrap mt-12">
            <FaqAccordion items={faqItems} />
          </div>

          <div className="products-support-cta">
            <Link href="/for-products/support" className="btn-primary">
              Visit Support Center →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
