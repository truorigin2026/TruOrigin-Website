import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssetImage } from "@/components/brands/asset-image";
import { BenefitsSwitcher } from "@/components/brands/benefits-switcher";
import { FadeIn, HeroReveal } from "@/components/motion";
import { ArrowIcon, PillButton } from "@/components/ui/pill-button";
import { brandBenefits, customerBenefits, trustStats } from "@/lib/data/brands-landing-data";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Benefits",
  description:
    "See what changes when product claims are backed by information — for the brand presenting the product and for the customer reviewing it before they buy.",
  path: "/for-brands/benefits",
});

const withoutTruOrigin = [
  "Product information is scattered across packaging, websites, and documents",
  "Claims can be difficult for customers to understand or explore",
  "Supporting documents are not always easy to find",
  "Brands have limited visibility into which product information customers access",
];

const withTruOrigin = [
  "Product information is brought together in one structured product page",
  "Claims are presented alongside their supporting information",
  "Product documents are easier for customers to access",
  "Brands gain visibility into which product information customers access",
];

export default function ForBrandsBenefitsPage() {
  return (
    <div className="saas-page bnf-page">
      <section className="bnf-hero">
        <div className="bnf-hero-glow" aria-hidden="true" />
        <div className="bnf-hero-grid-bg" aria-hidden="true" />
        <div className="container-shell bnf-hero-inner">
          <HeroReveal delay={0.05}>
            <p className="bnf-hero-eyebrow">Benefits</p>
          </HeroReveal>
          <HeroReveal delay={0.15}>
            <h1 className="bnf-hero-title">
              Why brands — and their <span className="brands-text-accent">customers</span> — use TruOrigin.
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.25}>
            <p className="bnf-hero-lead">
              Real value for the teams behind the product, and real clarity for the people buying it.
              See how OriginCard brings product information, claims, and supporting documents together.
            </p>
          </HeroReveal>
          <HeroReveal delay={0.35}>
            <div className="bnf-hero-actions">
              <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
                Get Started Today
              </PillButton>
              <PillButton href="/for-brands/how-it-works" variant="outline">
                See How It Works
              </PillButton>
            </div>
          </HeroReveal>
        </div>
      </section>

      <section className="bnf-stats-section">
        <div className="container-shell">
          <SectionHeading eyebrow="Why It Matters" title="Product information should be clear" centered />
          <div className="bnf-stats-grid">
            {trustStats.map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.06}>
                <div className="bnf-stat-card">
                  <div className="bnf-stat-icon">
                    <AssetImage src={stat.icon} alt="" width={24} height={24} />
                  </div>
                  <p className="bnf-stat-value">{stat.value}</p>
                  <p className="bnf-stat-label">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bnf-switcher-section">
        <div className="container-shell">
          <FadeIn>
            <BenefitsSwitcher brandBenefits={brandBenefits} customerBenefits={customerBenefits} />
          </FadeIn>
        </div>
      </section>

      <section className="bnf-comparison-section">
        <div className="container-shell">
          <SectionHeading eyebrow="Before & After" title="What Changes When Product Information Is Organized" centered />
          <div className="bnf-comparison-grid">
            <FadeIn className="bnf-comparison-column bnf-comparison-without">
              <p className="bnf-comparison-tag">Without TruOrigin</p>
              <ul className="bnf-comparison-list">
                {withoutTruOrigin.map((item) => (
                  <li key={item}>
                    <span className="bnf-comparison-icon is-without">
                      <X size={14} aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>

            <div className="bnf-comparison-divider" aria-hidden="true">
              <span>VS</span>
            </div>

            <FadeIn delay={0.1} className="bnf-comparison-column bnf-comparison-with">
              <p className="bnf-comparison-tag">With TruOrigin</p>
              <ul className="bnf-comparison-list">
                {withTruOrigin.map((item) => (
                  <li key={item}>
                    <span className="bnf-comparison-icon is-with">
                      <Check size={14} aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="bnf-cta-band">
        <div className="bnf-cta-overlay" aria-hidden="true" />
        <div className="container-shell bnf-cta-inner">
          <FadeIn>
            <h2>Ready to give every product a clearer story?</h2>
            <p>Give customers one clear place to explore your product information, claims, and supporting documents.</p>
            <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
              Get Started Today
            </PillButton>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
