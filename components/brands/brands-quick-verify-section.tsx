"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { AssetImage } from "@/components/brands/asset-image";
import { FadeIn } from "@/components/motion";

type QuickStep = {
  title: string;
  description: string;
  icon: string;
  image: string;
};

// Local to this section: the pinned photo below drives a scroll-linked
// transform per step every scroll frame, which is too heavy to feel smooth
// on phones. Below this breakpoint (matches this section's own mobile CSS)
// we swap to a plain swipeable carousel instead of scroll-jacking — same
// technique BrandsAdvantageSection already uses for its own pinned
// crossfade.
function useIsMobileVerify() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 860px)");
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}

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
  // The first photo is already in place when the section loads. Every later
  // photo slides up from below to cover whatever's currently showing, over
  // the same scroll window during which the step before it is active — so
  // the cover finishes exactly as its own step's text becomes active.
  const range: [number, number] = index === 0 ? [0, 1] : [(index - 1) / transitions, index / transitions];
  const output = index === 0 ? ["0%", "0%"] : ["100%", "0%"];
  const y = useTransform(scrollYProgress, range, output);

  return (
    <motion.div className="brands-verify-photo" style={{ y, zIndex: index + 1 }}>
      <AssetImage src={step.image} alt={step.title} fill className="brands-verify-photo-img" priority={index === 0} />
    </motion.div>
  );
}

export function BrandsQuickVerifySection({ steps }: { steps: readonly QuickStep[] }) {
  const pinRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const transitions = Math.max(steps.length - 1, 1);
  const isMobile = useIsMobileVerify();

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  // Toggle the active step directly on the DOM via refs instead of React
  // state — this callback fires on every scroll frame, and routing it
  // through setState triggered a full re-render of this section (including
  // re-running every VerifyPhoto's useTransform chain) on each index
  // change, which is what caused the scroll jank. Skipped entirely on
  // mobile, where the steps/stack aren't rendered at all.
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (isMobile) return;
    const next = Math.min(steps.length - 1, Math.max(0, Math.floor(value * transitions)));
    if (activeIndexRef.current === next) return;
    stepRefs.current[activeIndexRef.current]?.classList.remove("is-active");
    stepRefs.current[next]?.classList.add("is-active");
    activeIndexRef.current = next;
  });

  useEffect(() => {
    const el = carouselRef.current;
    if (!isMobile || !el) return;

    const onScroll = () => {
      const cards = Array.from(el.children) as HTMLElement[];
      let closest = 0;
      let smallestDelta = Infinity;
      cards.forEach((card, index) => {
        const delta = Math.abs(card.offsetLeft - el.scrollLeft);
        if (delta < smallestDelta) {
          smallestDelta = delta;
          closest = index;
        }
      });
      setActiveCard(closest);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const scrollToCard = (index: number) => {
    const el = carouselRef.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (el && card) {
      el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    }
  };

  return (
    <section id="how-it-works" className="brands-section brands-verify-shell">
      <div
        className="brands-verify-pin"
        ref={pinRef}
        style={isMobile ? undefined : { height: `${steps.length * 100}vh` }}
      >
        <div className="brands-verify-sticky">
          <div className="container-shell">
            <FadeIn>
              <div className="brands-section-intro centered brands-verify-intro">
                <p className="brands-eyebrow">For Your Customers</p>
                <h2 className="brands-display-title">Product Information in Three Simple Steps</h2>
                <p className="brands-section-lead brands-section-lead-centered">
                  Scan, explore, and access the information behind the product.
                </p>
              </div>
            </FadeIn>
          </div>

          {isMobile ? (
            <>
              <div className="brands-verify-carousel" ref={carouselRef}>
                {steps.map((step, index) => (
                  <article key={step.title} className="brands-verify-card">
                    <div className="brands-verify-card-image">
                      <AssetImage
                        src={step.image}
                        alt={step.title}
                        fill
                        className="brands-verify-card-img"
                        priority={index === 0}
                      />
                    </div>
                    <div className="brands-verify-card-body">
                      <span className="brands-verify-step-tag">Step 0{index + 1}</span>
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="brands-verify-dots" role="tablist" aria-label="Product information steps">
                {steps.map((step, index) => (
                  <button
                    key={step.title}
                    type="button"
                    role="tab"
                    aria-selected={index === activeCard}
                    aria-label={`Show step ${index + 1} of ${steps.length}`}
                    className={`brands-verify-dot${index === activeCard ? " is-active" : ""}`}
                    onClick={() => scrollToCard(index)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="container-shell brands-verify-grid">
              <div className="brands-verify-stack">
                {steps.map((step, index) => (
                  <VerifyPhoto key={step.title} step={step} index={index} total={steps.length} scrollYProgress={scrollYProgress} />
                ))}
              </div>

              <div className="brands-verify-steps">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    ref={(el) => {
                      stepRefs.current[index] = el;
                    }}
                    className={`brands-verify-step${index === 0 ? " is-active" : ""}`}
                  >
                    <span className="brands-verify-step-index">.0{index + 1}</span>
                    <div className="brands-verify-step-content">
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
