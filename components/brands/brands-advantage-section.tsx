"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { FadeIn } from "@/components/motion";

type AdvantageItem = {
  title: string;
  description: string;
};

function AdvantageCard({
  item,
  index,
  transitions,
  scrollYProgress,
}: {
  item: AdvantageItem;
  index: number;
  transitions: number;
  scrollYProgress: MotionValue<number>;
}) {
  const sliceStart = (index - 1) / transitions;
  const sliceEnd = index / transitions;
  const pad = (sliceEnd - sliceStart) * 0.25;

  const x = useTransform(
    scrollYProgress,
    [sliceStart + pad, sliceEnd - pad],
    ["100%", "0%"]
  );

  return (
    <motion.article
      className="brands-advantage-card"
      style={index === 0 ? { zIndex: 1 } : { x, zIndex: index + 1 }}
    >
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </motion.article>
  );
}

export function BrandsAdvantageSection({ items }: { items: readonly AdvantageItem[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const transitions = Math.max(items.length - 1, 1);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="brand-advantage" className="brands-section brands-advantage-shell">
      <div
        className="brands-advantage-pin"
        ref={pinRef}
        style={{ height: `${items.length * 100}vh` }}
      >
        <div className="brands-advantage-sticky">
          <div className="container-shell">
            <FadeIn>
              <div className="brands-section-intro centered brands-advantage-intro">
                <p className="brands-eyebrow brands-text-accent">The Brand Advantage</p>
                <h2 className="brands-display-title">Turn Every Scan Into Business Intelligence</h2>
                <p className="brands-section-lead brands-section-lead-centered">
                  OriginCard does more than prove authenticity. It becomes a growing source of insight, trust, and speed for your brand.
                </p>
              </div>
            </FadeIn>
          </div>

          <div className="brands-advantage-track">
            {items.map((item, index) => (
              <AdvantageCard
                key={item.title}
                item={item}
                index={index}
                transitions={transitions}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
