"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { AssetImage } from "@/components/brands/asset-image";
import { BrandsAdvantageSection } from "@/components/brands/brands-advantage-section";
import { BrandsFeaturesPhoneSection } from "@/components/brands/brands-features-phone-section";
import { BrandsHeroSection } from "@/components/brands/brands-hero-section";
import { BrandsIndustriesMarquee } from "@/components/brands/brands-industries-marquee";
import { BrandsQuickVerifySection } from "@/components/brands/brands-quick-verify-section";
import { BrandsSolutionSection } from "@/components/brands/brands-solution-section";
import { BrandsWhatIsSection } from "@/components/brands/brands-what-is-section";
import { BrandsWhySection } from "@/components/brands/brands-why-section";
import { FadeIn } from "@/components/motion";
import { ArrowIcon, PillButton } from "@/components/ui/pill-button";
import {
  brandAdvantages,
  brandAssets,
  originCardFeatures,
  quickVerifySteps,
  trustStats,
  whyTruOriginPoints,
} from "@/lib/data/brands-landing-data";

export function BrandsLandingPage() {
  return (
    <div className="brands-landing-page">
      <BrandsHeroSection />

      <div className="brands-stack-wrap">
        <BrandsWhatIsSection />
        <BrandsWhySection points={whyTruOriginPoints} />
      </div>

      <BrandsSolutionSection />

      <BrandsQuickVerifySection steps={quickVerifySteps} />

      <BrandsAdvantageSection items={brandAdvantages} />

      <section id="why-choose-us" className="brands-section brand-proof-shell">
        <div className="container-shell">
          <div className="brand-proof-card">
            <span className="brand-proof-glow" aria-hidden="true" />
            <span className="brand-proof-grid" aria-hidden="true" />

            <FadeIn>
              <div className="brand-proof-copy">
                <span className="brand-proof-tag">
                  <span className="brand-proof-dot" aria-hidden="true" />
                  Why Brands Need OriginCard
                </span>
                <h2 className="brand-proof-title">
                  The <span className="brand-proof-accent">information</span> your customers want.
                </h2>
                <p className="brand-proof-lead">
                  QR codes are becoming a familiar way for consumers to access information. For brands, they create a simple path from a physical product to detailed digital product information.
                </p>
                <PillButton href="/for-brands/contact" variant="white" icon={<ArrowIcon inverted />}>
                  Book a Demo
                </PillButton>
              </div>
            </FadeIn>

            <div className="brand-proof-stats">
              {trustStats.map((stat, index) => (
                <FadeIn key={stat.value} delay={0.08 + index * 0.07}>
                  <article className="brand-proof-stat">
                    <span className="brand-proof-stat-icon">
                      <AssetImage src={stat.icon} alt="" width={26} height={26} className="brand-proof-stat-icon-img" />
                    </span>
                    <span className="brand-proof-stat-copy">
                      <strong>{stat.value}</strong>
                      <p>{stat.label}</p>
                    </span>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BrandsFeaturesPhoneSection features={originCardFeatures} />

      <BrandsIndustriesMarquee />

      <section className="brands-footer-cta">
        <AssetImage src={brandAssets.footerBannerBg} alt="" fill className="brands-footer-cta-bg" />
        <div className="brands-footer-cta-overlay" />
        <div className="container-shell brands-footer-cta-content">
          <FadeIn>
            <BookOpen size={22} aria-hidden="true" className="brands-footer-cta-icon" />
            <h2>Every Product Has Information. Give It One Place.</h2>
            <div className="brands-footer-cta-actions">
              <Link href="/login" className="brands-hero-btn-primary">
                Get Started Today
                <ArrowIcon />
              </Link>
              <Link href="/for-brands/contact" className="brands-hero-btn-secondary">
                Book a Demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
