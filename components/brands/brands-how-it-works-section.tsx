"use client";

import { AssetImage } from "@/components/brands/asset-image";
import { FocusSliceCarousel } from "@/components/brands/focus-slice-carousel";
import { FadeIn } from "@/components/motion";

type Step = {
  step: number;
  title: string;
  description: string;
  icon: string;
};

export function BrandsHowItWorksSection({ steps }: { steps: readonly Step[] }) {
  return (
    <section id="how-it-works" className="brands-section">
      <div className="container-shell">
        <FadeIn>
          <div className="brands-section-intro centered">
            <p className="brands-eyebrow">How OriginCard Works</p>
            <h2 className="brands-display-title">From product to proof in five steps</h2>
            <p className="brands-section-lead brands-section-lead-centered">
              A simple workflow that connects every physical unit to verified digital proof.
            </p>
          </div>
        </FadeIn>

        <FocusSliceCarousel
          items={steps}
          renderIcon={(step) => (
            <AssetImage src={step.icon} alt="" width={22} height={22} className="brands-slice-icon-img" />
          )}
        />
      </div>
    </section>
  );
}
