"use client";

import ColorBends from "@/components/brands/color-bends";
import { HeroReveal } from "@/components/motion";
import { ButtonFillSweep } from "@/components/ui/button-fill-sweep";
import { ButtonHoverUnderline } from "@/components/ui/button-hover-underline";

export function BrandsHeroSection() {
  return (
    <section id="what-is-origincard" className="brands-hero-shell">
      <div className="container-shell">
        <div className="brands-hero-card">
          <ColorBends
            className="brands-hero-bg"
            colors={["#0d4a28", "#1a7a44", "#4caf50", "#7bd682"]}
            rotation={110}
            speed={0.16}
            scale={1.4}
            frequency={1.1}
            warpStrength={1.1}
            mouseInfluence={0.6}
            parallax={0.35}
            noise={0.1}
            iterations={2}
            intensity={1.15}
            bandWidth={5}
            transparent={false}
          />
          <div className="brands-hero-overlay" />

          <div className="brands-hero-card-inner">
            <div className="brands-hero-grid brands-hero-grid-centered">
              <div className="brands-hero-copy brands-hero-copy-centered">
                <HeroReveal delay={0.1}>
                  <p className="brands-eyebrow brands-eyebrow-hero">For Brands</p>
                </HeroReveal>

                <HeroReveal delay={0.2}>
                  <h1 className="brands-display-title brands-hero-title">
                    Your Product Claims. <span className="brands-text-accent">Clearly Structured.</span>
                  </h1>
                </HeroReveal>

                <HeroReveal delay={0.3}>
                  <p className="brands-section-lead brands-section-lead-hero">
                    Bring claims, supporting evidence, ingredients, certifications, and product
                    documentation together with OriginCard, all organized around the product they
                    belong to.
                  </p>
                </HeroReveal>

                <HeroReveal delay={0.38}>
                  <div className="landing-hero-actions">
                    <ButtonFillSweep href="/for-brands/contact">Get Started</ButtonFillSweep>
                    <ButtonHoverUnderline href="/for-brands/benefits" className="landing-hero-secondary-link">
                      Know More
                    </ButtonHoverUnderline>
                  </div>
                </HeroReveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
