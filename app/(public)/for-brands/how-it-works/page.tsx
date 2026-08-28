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
    "From product registration to a live OriginCard: how TruOrigin reviews evidence, generates QR codes, and publishes a verified product page in five steps.",
  path: "/for-brands/how-it-works",
});

const systemLayers = [
  {
    icon: LayoutDashboard,
    title: "Brand Portal",
    description: "Register products, upload evidence, and manage your verification portfolio from a single dashboard.",
    points: ["Product intake & image upload", "Document management", "Review status tracking"],
  },
  {
    icon: Cpu,
    title: "TruOrigin Engine",
    description: "Our platform validates data, generates unique QR codes, and publishes verification pages.",
    points: ["Evidence mapping", "QR code generation", "Authenticity validation"],
  },
  {
    icon: Users,
    title: "Consumer Experience",
    description: "Shoppers can scan, verify, and access full product transparency in seconds.",
    points: ["QR & serial verification", "Origin & certification view", "Downloadable documents"],
  },
];

const reviewChecklist = [
  {
    title: "Product Details",
    description: "Name, category, and description are accurate and match the submitted images.",
  },
  {
    title: "Product Photos",
    description: "Clear, unaltered photos that represent the actual product being sold.",
  },
  {
    title: "Claims",
    description: 'Each claim is specific enough to evaluate — "USDA Organic Certified" rather than just "natural."',
  },
  {
    title: "Certificates & Lab Reports",
    description: "Uploaded documents are legible, current, and issued by a recognizable authority.",
  },
  {
    title: "Ingredient Lists",
    description: "Where applicable, ingredient documentation matches the claims being made.",
  },
  {
    title: "Sourcing Proof",
    description: "Invoices or sourcing documentation support origin and material claims.",
  },
];

const processFaqs = [
  {
    question: "How long does review take?",
    answer:
      "Most submissions are reviewed within 2-3 business days. Products with more claims or documents to verify may take slightly longer.",
  },
  {
    question: "What happens if a claim can't be verified?",
    answer:
      'It\'s labeled "No Evidence Submitted" rather than rejected outright — you can add supporting documents later and resubmit that claim for review.',
  },
  {
    question: "Can I update a product after it's approved?",
    answer:
      "Yes. Updates go through the same review flow before they replace the live version, so your OriginCard always reflects reviewed information.",
  },
  {
    question: "Do I need a certificate for every claim?",
    answer:
      'Not necessarily, but claims backed by documentation are shown as "Evidence Available," which customers trust more than unsupported claims.',
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
              From product to <span className="brands-text-accent">verified proof</span>, in five steps.
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.25}>
            <p className="hiw-hero-lead">
              A streamlined workflow from product registration to consumer verification — built for
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
            title="From product to proof in five steps"
            description="A simple, repeatable process that connects every physical unit to verified digital proof."
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
            title="What our review team checks"
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
