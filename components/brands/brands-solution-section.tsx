"use client";

import { motion } from "framer-motion";
import { AssetImage } from "@/components/brands/asset-image";
import { SplitHeading } from "@/components/brands/split-heading";
import { FadeIn } from "@/components/motion";
import { ArrowIcon, PillButton } from "@/components/ui/pill-button";

const revealEase = [0.16, 1, 0.3, 1] as const;

export function BrandsSolutionSection() {
  return (
    <section id="solution" className="brands-section brands-solution-shell">
      <div className="container-shell">
        <div className="brands-solution-grid">
          <div className="brands-solution-copy">
            <SplitHeading className="brands-display-title" text="One OriginCard For Every Product Detail" />

            <FadeIn delay={0.4}>
              <p className="brands-section-lead brands-solution-lead">
                TruOrigin gives brands a structured way to organize, manage, and present product information
                through a dedicated OriginCard. It brings product details, claims, supporting documents,
                certifications, and test reports into one accessible layer, making product information easier
                for brands to manage and customers to explore.
              </p>
            </FadeIn>

            <FadeIn delay={0.55}>
              <PillButton href="/for-products" variant="primary" icon={<ArrowIcon />} className="brands-solution-cta">
                Check Products Section
              </PillButton>
            </FadeIn>
          </div>

          <motion.div
            className="brands-solution-visual"
            initial={{ opacity: 0, x: 120 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: revealEase }}
          >
            <div className="brands-solution-image">
              <AssetImage
                src="/images/truorigin%20hero%20image.jpg"
                alt="Customer viewing verified product details through OriginCard on their phone"
                fill
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
