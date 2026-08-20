"use client";

import { ScrollRevealText } from "@/components/brands/scroll-reveal-text";
import { FadeIn } from "@/components/motion";

export function BrandsWhatIsSection() {
  return (
    <section id="what-is-truorigin" className="brands-section brands-whatis-shell">
      <div className="container-shell">
        <div className="brands-section-intro centered">
          <FadeIn>
            <p className="brands-eyebrow brands-text-accent">TruOrigin</p>
            <h2 className="brands-display-title">What Is TruOrigin?</h2>
          </FadeIn>

          <ScrollRevealText
            className="brands-whatis-lead"
            text="TruOrigin is a product information platform that gives every product a structured digital identity through an OriginCard. Brands can organize product information while customers can access and explore that information through a simple digital experience."
          />
        </div>
      </div>
    </section>
  );
}
