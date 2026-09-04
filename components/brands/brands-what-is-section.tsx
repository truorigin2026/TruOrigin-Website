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
            text="TruOrigin is a structured product information platform that gives every product an OriginCard. Brands can organize product claims, ingredients, certifications, supporting evidence, and product documentation in one place, while customers can easily access and understand that information."
          />
        </div>
      </div>
    </section>
  );
}
