"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

type WhyPoint = {
  title: string;
  description: string;
};

// Walks the offsetParent chain to get an element's normal-flow resting
// position — unaffected by `position: sticky`'s current stuck state or any
// in-flight CSS transform, unlike getBoundingClientRect().
function getStaticTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export function BrandsWhySection({ points }: { points: readonly WhyPoint[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const thresholdsRef = useRef<number[]>([]);
  const { scrollY } = useScroll();

  // Each card is `position: sticky` and visually stacks on top of the
  // previous one. A card becomes the topmost card exactly when the page
  // has scrolled far enough for its own sticky `top` offset to engage —
  // i.e. when scrollY reaches (card's static top - its sticky top offset).
  // Computing that threshold directly per card (rather than estimating a
  // proportional share of total scroll progress) keeps the active index
  // pixel-accurate to which card is actually on top, in both directions.
  useEffect(() => {
    function measure() {
      thresholdsRef.current = cardRefs.current.map((el) => {
        if (!el) return 0;
        const topOffset = parseFloat(getComputedStyle(el).top) || 0;
        return getStaticTop(el) - topOffset;
      });
    }

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      resizeObserver.disconnect();
    };
  }, [points]);

  useMotionValueEvent(scrollY, "change", (value) => {
    const thresholds = thresholdsRef.current;
    let next = 0;
    for (let i = 0; i < thresholds.length; i += 1) {
      if (value >= thresholds[i]) next = i;
    }
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
