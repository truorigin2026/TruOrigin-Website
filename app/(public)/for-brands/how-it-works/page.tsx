import type { Metadata } from "next";
import { LayoutDashboard, Cpu, Users } from "lucide-react";
import { HowItWorksTimeline } from "@/components/brands/how-it-works-timeline";
import { FaqAccordion } from "@/components/brands/faq-accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssetImage } from "@/components/brands/asset-image";
import { FadeIn, HeroReveal } from "@/components/motion";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";
import { howItWorksSteps, trustStats } from "@/lib/data/brands-landing-data";
import { JsonLd } from "@/components/seo/json-ld";
import { faqPageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "How It Works",
  description:
    "From product registration to a live OriginCard: how TruOrigin reviews evidence, generates QR codes, and publishes a product information page in five steps.",
  path: "/for-brands/how-it-works",
});

const systemLayers = [
  {
    icon: LayoutDashboard,
    title: "Brand Portal",
    subtitle: "Add and manage product information",
    description:
      "Brands register products, upload product details, images, supporting documents, certifications, and claim evidence — all managed from one place.",
    points: ["Product details & image upload", "Document management", "Claim & evidence management"],
  },
  {
    icon: Cpu,
    title: "TruOrigin Engine",
    subtitle: "Structure, validate, and connect the information",
    description:
      "TruOrigin organises submitted product information, maps supporting evidence, and creates a unique digital identity for each product.",
    points: ["Evidence mapping", "Product information structuring", "Unique QR & product identity", "Review status"],
  },
  {
    icon: Users,
    title: "Consumer Experience",
    subtitle: "Explore product information with clarity",
    description:
      "Consumers access the product's information in one place, including origin, claims, certifications, supporting documents, and review status.",
    points: ["Product information access", "Origin & certification details", "Evidence-backed claims", "Supporting documents"],
  },
];

const reviewChecklist = [
  {
    title: "Product Details",
    description: "Product name, category, description, and other key product information.",
  },
  {
    title: "Product Photos",
    description: "Clear product images that represent the product being presented.",
  },
  {
    title: "Claims",
    description: "Product claims presented with their relevant supporting information.",
  },
  {
    title: "Certificates & Lab Reports",
    description: "Certificates and laboratory reports provided as supporting product documentation.",
  },
  {
    title: "Ingredient Lists",
    description: "Ingredient information and related product documentation where applicable.",
  },
  {
    title: "Sourcing Information",
    description: "Sourcing documents and invoices providing supporting information about the product's sourcing.",
  },
];

const processFaqs = [
  {
    question: "How long does it take for product information to appear?",
    answer:
      "Most submissions are processed within 2–3 business days. More detailed product information may take slightly longer.",
  },
  {
    question: "What happens if information is incomplete?",
    answer:
      "The submission may require additional information or supporting documents before the product information can be published.",
  },
  {
    question: "Can I update product information later?",
    answer:
      "Yes. Brands can update product details, images, claims, and supporting documents when information changes.",
  },
  {
    question: "Do I need supporting documents for every claim?",
    answer:
      "Supporting documents may be required where they are relevant to the specific claim being presented.",
  },
];

export default function ForBrandsHowItWorksPage() {
  return (
    <div className="saas-page hiw-page">
      <JsonLd data={faqPageJsonLd(processFaqs)} />
      <section className="hiw-hero">
        <div className="hiw-hero-glow" aria-hidden="true" />
        <div className="hiw-hero-grid-bg" aria-hidden="true" />
        <div className="container-shell hiw-hero-inner">
          <HeroReveal delay={0.05}>
            <p className="hiw-hero-eyebrow">How It Works</p>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <h1 className="hiw-hero-title">
              From product to <span className="brands-text-accent">clear information</span>, in five steps.
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.25}>
            <p className="hiw-hero-lead">
              A streamlined workflow from product registration to a customer-ready page — built for
              clarity at every step, and reviewed by a real person before it goes live.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.35}>
            <div className="hiw-hero-actions">
              <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
                Book a Demo
              </PillButton>
              <PillButton href="/for-brands/resources/faq" variant="outline">
                Read the FAQ
              </PillButton>
            </div>
          </HeroReveal>

          <HeroReveal delay={0.45}>
            <div className="hiw-hero-stats">
              {trustStats.slice(0, 3).map((stat) => (
                <div key={stat.value} className="hiw-hero-stat">
                  <p className="hiw-hero-stat-value">{stat.value}</p>
                  <p className="hiw-hero-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </HeroReveal>
        </div>
      </section>

      <section className="hiw-process-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="The Workflow"
            title="From product to information in five steps"
            description="A simple, repeatable process that connects every physical unit to a structured digital record."
            centered
          />
          <HowItWorksTimeline steps={howItWorksSteps} />
        </div>
      </section>

      <section className="hiw-system-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="The System"
            title="Three connected layers, one source of truth"
            centered
          />
          <div className="hiw-system-grid">
            {systemLayers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <FadeIn key={layer.title} delay={index * 0.1} className="hiw-system-cell">
                  <div className="hiw-system-card">
                    <div className="hiw-system-icon">
                      <Icon size={24} aria-hidden="true" />
                    </div>
                    <h3>{layer.title}</h3>
                    <p className="hiw-system-subtitle">{layer.subtitle}</p>
                    <p>{layer.description}</p>
                    <ul>
                      {layer.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  {index < systemLayers.length - 1 ? (
                    <span className="hiw-system-arrow" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  ) : null}
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="hiw-review-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Review Process"
            title="What We Check Before It Goes Live"
            description="Every submission is reviewed by a person before it goes live — here's what they're looking for."
            centered
          />

          <div className="hiw-review-layout">
            <FadeIn className="hiw-review-media">
              <AssetImage
                src="/images/for-brands/how-it-works/review-team.jpg"
                alt="TruOrigin review team checking a brand's submitted product evidence"
                className="h-full w-full object-cover"
              />
            </FadeIn>

            <div className="hiw-review-list">
              {reviewChecklist.map((item, index) => (
                <FadeIn key={item.title} delay={index * 0.06}>
                  <div className="hiw-review-item">
                    <span className="hiw-review-item-index">{index + 1}</span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hiw-faq-section">
        <div className="container-shell">
          <SectionHeading eyebrow="FAQ" title="Common questions about the process" centered />
          <div className="hiw-faq-wrap">
            <FaqAccordion items={processFaqs} />
          </div>

          <div className="section-cta-row">
            <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
              Talk to Our Team
            </PillButton>
          </div>
        </div>
      </section>
    </div>
  );
}
