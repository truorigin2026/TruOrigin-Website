"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { FadeIn } from "@/components/motion";

type AdvantageItem = {
  title: string;
  description: string;
};

// Local to this section: the pinned crossfade below forces ~4 screens of
// scroll just to see every card, which is a bad tradeoff on small screens.
// Below this breakpoint (matches this section's own mobile card styles)
// we swap to a plain swipeable row instead of scroll-jacking.
function useIsMobileAdvantage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

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
  const opacity = useTransform(
    scrollYProgress,
    [sliceStart + pad, sliceEnd - pad],
    [0, 1]
  );

  return (
    <motion.article
      className="brands-advantage-card"
      style={index === 0 ? { zIndex: 1 } : { x, opacity, zIndex: index + 1 }}
    >
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </motion.article>
  );
}

export function BrandsAdvantageSection({ items }: { items: readonly AdvantageItem[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const transitions = Math.max(items.length - 1, 1);
  const isMobile = useIsMobileAdvantage();

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  return (
    <section id="brand-advantage" className="brands-section brands-advantage-shell">
      <div
        className="brands-advantage-pin"
        ref={pinRef}
        style={isMobile ? undefined : { height: `${items.length * 100}vh` }}
      >
        <div className="brands-advantage-sticky">
          <div className="container-shell">
            <FadeIn>
              <div className="brands-section-intro centered brands-advantage-intro">
                <p className="brands-eyebrow brands-text-accent">The Brand Advantage</p>
                <h2 className="brands-display-title">Make Every Product Easier to Understand</h2>
                <p className="brands-section-lead brands-section-lead-centered">
                  OriginCard brings your product information together in one structured place — making it easier for brands to manage and easier for customers to explore.
                </p>
              </div>
            </FadeIn>
          </div>

          {isMobile ? (
            <div className="brands-advantage-carousel">
              {items.map((item) => (
                <article key={item.title} className="brands-advantage-card brands-advantage-card-carousel">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </section>
  );
}
