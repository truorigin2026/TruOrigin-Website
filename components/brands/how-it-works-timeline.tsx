"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { AssetImage } from "@/components/brands/asset-image";

type Step = {
  step: number;
  title: string;
  description: string;
  icon: string;
};

export function HowItWorksTimeline({ steps }: { steps: readonly Step[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.4"],
  });

  return (
    <div className="hiw-timeline" ref={containerRef}>
      <div className="hiw-timeline-track" aria-hidden="true">
        {/* scaleY instead of height: a compositor-only transform, so this
            scroll-linked fill doesn't force layout on every scroll frame
            the way animating height did. scrollYProgress is already a 0-1
            motion value, so it maps directly with no extra useTransform. */}
        <motion.div className="hiw-timeline-progress" style={{ scaleY: scrollYProgress }} />
      </div>

      <div className="hiw-timeline-steps">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            className={`hiw-timeline-step ${index % 2 === 0 ? "is-left" : "is-right"}`}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hiw-timeline-node">
              <span>{String(step.step).padStart(2, "0")}</span>
            </div>
            <div className="hiw-timeline-card">
              <div className="hiw-timeline-icon">
                <AssetImage src={step.icon} alt="" width={26} height={26} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
