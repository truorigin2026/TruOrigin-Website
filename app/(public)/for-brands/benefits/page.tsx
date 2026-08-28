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
    "See what changes when product claims become verifiable — for the brand shipping the product and for the customer deciding whether to trust it.",
  path: "/for-brands/benefits",
});

const withoutTruOrigin = [
  "Claims live only in marketing copy, with no way for a customer to check them",
  "Counterfeit or knockoff products erode trust in your real inventory",
  "Support teams field the same authenticity questions over and over",
  "No visibility into how often customers actually check your claims",
];

const withTruOrigin = [
  "Every claim carries a status — Evidence Available, Limited Evidence, or reviewed by a real person",
  "Each unit has a unique serial number and QR code tied to one verified record",
  "Customers self serve the answer by scanning, instead of contacting support",
  "Scan analytics show exactly which products and claims customers check most",
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
              Why brands — and their <span className="brands-text-accent">customers</span> — choose TruOrigin.
            </h1>
          </HeroReveal>
          <HeroReveal delay={0.25}>
            <p className="bnf-hero-lead">
              Real value for the teams shipping the product, and real clarity for the people buying it.
              See how OriginCard changes the equation on both sides.
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
          <SectionHeading eyebrow="Why It Matters" title="The transparency gap is measurable" centered />
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
          <SectionHeading eyebrow="Before & After" title="What changes once claims are verifiable" centered />
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
            <h2>Ready to give every product verifiable proof?</h2>
            <p>Join the brands already turning transparency into a competitive advantage.</p>
            <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
              Get Started Today
            </PillButton>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
