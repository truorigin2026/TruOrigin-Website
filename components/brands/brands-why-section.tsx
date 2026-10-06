"use client";

import { useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

type WhyPoint = {
  title: string;
  description: string;
};

export function BrandsWhySection({ points }: { points: readonly WhyPoint[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const transitions = Math.max(points.length - 1, 1);

  // Each card is `position: sticky` and visually stacks on top of the
  // previous one — IntersectionObserver can't tell which is topmost
  // (covered siblings stay geometrically "intersecting" even once hidden
  // behind the next card), which made the active index track correctly
  // scrolling down but get stuck on the last card scrolling back up.
  // Mapping continuous scroll progress to an index instead — the same
  // technique BrandsQuickVerifySection already uses for its own sticky
  // stack — works identically in both directions since it's just "where
  // am I right now," not an enter/exit event.
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(points.length - 1, Math.max(0, Math.round(value * transitions)));
    setActiveIndex(next);
  });

  const scrollToCard = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="why-truorigin" className="brands-section brands-section-cream brands-why-shell">
      <div className="container-shell">
        <div className="brands-why-layout">
          <div className="brands-why-nav">
            <p className="brands-eyebrow brands-text-accent">Why TruOrigin</p>
            <h2 className="brands-display-title brands-why-title">
              Product information, presented with intent.
            </h2>

            <ul className="brands-why-nav-list">
              {points.map((point, index) => (
                <li key={point.title}>
                  <button
                    type="button"
                    className={`brands-why-nav-item${index === activeIndex ? " is-active" : ""}`}
                    onClick={() => scrollToCard(index)}
                  >
                    <span className="brands-why-nav-index">0{index + 1}</span>
                    <span>{point.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="brands-why-stack">
            {points.map((point, index) => (
              <article
                key={point.title}
                data-index={index}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`brands-why-card${index === activeIndex ? " is-active" : ""}`}
                style={{ zIndex: index + 1, "--why-index": index } as React.CSSProperties}
              >
                <span className="brands-why-card-index">0{index + 1}</span>
                <h3>{point.title}</h3>
                <p>{point.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
