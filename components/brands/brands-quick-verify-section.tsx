"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { AssetImage } from "@/components/brands/asset-image";
import { FadeIn } from "@/components/motion";

type QuickStep = {
  title: string;
  description: string;
  icon: string;
  image: string;
};

type StackPoint = [scrollX: number, scale: number, y: number, opacity: number, x: number, rotate: number];

function VerifyPhoto({
  step,
  index,
  total,
  scrollYProgress,
}: {
  step: QuickStep;
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
}) {
  const transitions = Math.max(total - 1, 1);
  const segFrac = 1 / transitions;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  const settleStart = isFirst ? 0 : (index - 1) * segFrac;
  const settleEnd = isFirst ? 0 : index * segFrac;
  const flyEnd = !isLast ? (index + 1) * segFrac : 1;

  const peekScale = 1 - index * 0.045;
  const peekY = index * 26;
  const peekX = index * 26;
  const peekRotate = index * 4;
  const peekOpacity = isFirst ? 1 : 0.92;

  const points: StackPoint[] = [];
  if (isFirst) {
    points.push([0, 1, 0, 1, 0, 0]);
  } else {
    points.push([0, peekScale, peekY, peekOpacity, peekX, peekRotate]);
    if (settleStart > 0) points.push([settleStart, peekScale, peekY, peekOpacity, peekX, peekRotate]);
    points.push([settleEnd, 1, 0, 1, 0, 0]);
  }
  if (!isLast) points.push([flyEnd, 0.95, -40, 0, -14, -3]);

  const deduped: StackPoint[] = [];
  for (const point of points) {
    if (deduped.length && deduped[deduped.length - 1][0] === point[0]) {
      deduped[deduped.length - 1] = point;
    } else {
      deduped.push(point);
    }
  }

  const xs = deduped.map((point) => point[0]);
  const scale = useTransform(scrollYProgress, xs, deduped.map((point) => point[1]));
  const y = useTransform(scrollYProgress, xs, deduped.map((point) => point[2]));
  const opacity = useTransform(scrollYProgress, xs, deduped.map((point) => point[3]));
  const x = useTransform(scrollYProgress, xs, deduped.map((point) => point[4]));
  const rotate = useTransform(scrollYProgress, xs, deduped.map((point) => point[5]));

  return (
    <motion.div className="brands-verify-photo" style={{ scale, y, x, rotate, opacity, zIndex: total - index }}>
      <AssetImage src={step.image} alt="" fill className="brands-verify-photo-img" priority />
    </motion.div>
  );
}

export function BrandsQuickVerifySection({ steps }: { steps: readonly QuickStep[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const transitions = Math.max(steps.length - 1, 1);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  // Toggle the active step directly on the DOM via refs instead of React
  // state — this callback fires on every scroll frame, and routing it
  // through setState triggered a full re-render of this section (including
  // re-running every VerifyPhoto's useTransform chain) on each index
  // change, which is what caused the scroll jank.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(steps.length - 1, Math.max(0, Math.floor(value * transitions)));
    if (activeIndexRef.current === next) return;
    stepRefs.current[activeIndexRef.current]?.classList.remove("is-active");
    stepRefs.current[next]?.classList.add("is-active");
    activeIndexRef.current = next;
  });

  return (
    <section id="how-it-works" className="brands-section brands-verify-shell">
      <div className="brands-verify-pin" ref={pinRef} style={{ height: `${steps.length * 100}vh` }}>
        <div className="brands-verify-sticky">
          <div className="container-shell">
            <FadeIn>
              <div className="brands-section-intro centered brands-verify-intro">
                <p className="brands-eyebrow">For Your Customers</p>
                <h2 className="brands-display-title">Verification Takes Three Taps</h2>
                <p className="brands-section-lead brands-section-lead-centered">
                  No accounts, no apps. Just a quick scan between a curious customer and the truth about your product.
                </p>
              </div>
            </FadeIn>
          </div>

          <div className="container-shell brands-verify-grid">
            <div className="brands-verify-steps">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  ref={(el) => {
                    stepRefs.current[index] = el;
                  }}
                  className={`brands-verify-step${index === 0 ? " is-active" : ""}`}
                >
                  <span className="brands-verify-step-tag">Step 0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>

            <div className="brands-verify-stack">
              {steps.map((step, index) => (
                <VerifyPhoto key={step.title} step={step} index={index} total={steps.length} scrollYProgress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
