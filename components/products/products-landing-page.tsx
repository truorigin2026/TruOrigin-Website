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
    question: "How do I access a product’s OriginCard?",
    answer:
      "Scan the product’s QR code or use the available product link to open its OriginCard and explore the information provided by the brand.",
  },
  {
    question: "What information can I find on an OriginCard?",
    answer:
      "An OriginCard can bring together product details, ingredients, specifications, claims, documents, and other relevant product information in one structured experience.",
  },
  {
    question: "How does TruOrigin help brands manage product information?",
    answer:
      "TruOrigin gives brands a structured way to organize, manage, and present product information through OriginCard.",
  },
  {
    question: "Can product information be updated?",
    answer:
      "Yes. Brands can manage the information associated with their products and update the relevant content through the platform.",
  },
] as const;

const aboutFeatures = [
  { icon: ShieldCheck, title: "Product Information", description: "Product details and supporting information organized for each product" },
  { icon: BadgeCheck, title: "Structured Presentation", description: "Product information arranged into a clear, consistent OriginCard experience." },
  { icon: PackageSearch, title: "Clearer Reading", description: "Customers can easily find and explore the product information they need." },
] as const;

const informationSteps = [
  { number: "1", title: "Find QR Code", description: "Locate the QR code on the product packaging." },
  { number: "2", title: "Scan or Enter", description: "Scan the QR code or enter the serial number." },
  { number: "3", title: "Open Product Page", description: "Get instant access to product information and details." },
  { number: "4", title: "View Supporting Information", description: "Access product documents, ingredients, specifications, and other information" },
] as const;

const whyUseItPoints = [
  "Explore structured product information",
  "Access product details in one place",
  "Understand ingredients, specifications & documents",
  "Explore information before you buy",
  "Find what matters, without the clutter",
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
                  <h2>Product Information, Made Clear</h2>
                  <p>
                    TruOrigin helps consumers access and explore structured product information through 
                    an OriginCard, bringing relevant product details together in one clear experience.
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
