"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { AssetImage } from "@/components/brands/asset-image";
import { FadeIn } from "@/components/motion";
import { brandAssets } from "@/lib/data/brands-landing-data";

type Feature = {
  title: string;
  description: string;
  icon: string;
};

function ringDots(radius: number, count: number, size: number, opacity: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return {
      cx: Math.round(Math.cos(angle) * radius * 100) / 100,
      cy: Math.round(Math.sin(angle) * radius * 100) / 100,
      r: size,
      opacity,
    };
  });
}

const phoneGlowDots = [
  ...ringDots(110, 10, 2.5, 0.55),
  ...ringDots(170, 14, 3, 0.4),
  ...ringDots(230, 18, 2.5, 0.26),
  ...ringDots(290, 22, 2, 0.14),
];

function PhoneCenterGlow() {
  return (
    <svg className="brands-phone-glow-dots" viewBox="-320 -320 640 640" aria-hidden="true">
      {phoneGlowDots.map((dot, index) => (
        <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.r} fill="#4caf50" opacity={dot.opacity} />
      ))}
    </svg>
  );
}

function FeatureRowSet({
  features,
  style,
}: {
  features: readonly Feature[];
  style: { opacity: MotionValue<number>; y?: MotionValue<number> };
}) {
  return (
    <motion.div className="brands-phone-cardset" style={style}>
      {features.map((feature) => (
        <article key={feature.title} className="brands-phone-card">
          <span className="brands-phone-card-icon">
            <AssetImage src={feature.icon} alt="" width={18} height={18} />
          </span>
          <span className="brands-phone-card-body">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </span>
        </article>
      ))}
    </motion.div>
  );
}

export function BrandsFeaturesPhoneSection({ features }: { features: readonly Feature[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const setA = features.slice(0, 4);
  const setB = features.slice(4, 8);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  const opacityA = useTransform(scrollYProgress, [0, 0.28, 0.56], [1, 1, 0]);
  const opacityB = useTransform(scrollYProgress, [0.34, 0.56, 0.88], [0, 1, 1]);
  const setBMoveY = useTransform(scrollYProgress, [0.34, 0.56, 0.88], [44, 12, -4]);
  const phoneLift = useTransform(scrollYProgress, [0, 0.55], [0, -16]);

  return (
    <section id="benefits" className="brands-section brands-section-cream brands-phone-section">
      <div className="container-shell">
        <FadeIn>
          <div className="brands-section-intro centered brands-features-intro">
            <p className="brands-eyebrow brands-text-accent">Everything Inside OriginCard</p>
            <h2 className="brands-display-title">All Your Product Information, In One Place</h2>
            <p className="brands-section-lead brands-section-lead-centered">
              OriginCard brings together the information behind every product, including claims, ingredients, certifications, supporting documents, test reports, and product details, in one structured place.
            </p>
          </div>
        </FadeIn>
      </div>

      <div className="brands-phone-pin" ref={pinRef}>
        <div className="brands-phone-sticky">
          <PhoneCenterGlow />
          <motion.div className="brands-phone-frame" style={{ y: phoneLift }}>
            <span className="brands-phone-island" aria-hidden="true" />
            <span className="brands-phone-button brands-phone-button-power" aria-hidden="true" />
            <span className="brands-phone-button brands-phone-button-vol-up" aria-hidden="true" />
            <span className="brands-phone-button brands-phone-button-vol-down" aria-hidden="true" />

            <div className="brands-phone-screen">
              <div className="brands-phone-screen-header">
                <span className="brands-phone-screen-logo">OriginCard</span>
              </div>

              <div className="brands-phone-product" aria-hidden="true">
                  <AssetImage src={brandAssets.logo} alt="" width={100} height={30} className="brands-phone-product-logo-img" />
              </div>

              <FeatureRowSet features={setA} style={{ opacity: opacityA }} />
              <FeatureRowSet features={setB} style={{ opacity: opacityB, y: setBMoveY }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
