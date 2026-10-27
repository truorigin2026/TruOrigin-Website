"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

type WhyPoint = {
  title: string;
  description: string;
};

// Mirrors .brands-why-card's `top: calc(220px + var(--why-index, 0) * 18px)`
// in app/globals.css — a pure index-based pixel formula with no viewport
// units, so it's always known ahead of time and never needs a style
// recalculation to read back.
const WHY_CARD_TOP_BASE = 220;
const WHY_CARD_TOP_STEP = 18;

export function BrandsWhySection({ points }: { points: readonly WhyPoint[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const inViewRef = useRef(false);
  const { scrollY } = useScroll();

  // The expensive part of this (a getBoundingClientRect() read per card)
  // used to run unconditionally on every scroll tick of the entire page —
  // including while the user was still scrolling through the hero above
  // this section. Gate it to only do that work while the section is
  // actually anywhere near the viewport.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = entry.isIntersecting;
    }, { rootMargin: "200px 0px 200px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Each card is `position: sticky`, higher-indexed cards stacking on top
  // of earlier ones via z-index. A sticky element's rendered top can never
  // go above its own CSS `top` offset — it sits below that offset before
  // engaging, then locks exactly at it once stuck (and stays there even
  // after being visually covered by a later card, or after scrolling past
  // it off-screen). So "rect.top has reached the card's own offset" is a
  // direct, always-current signal of "this card's threshold is behind us,"
  // checked fresh on every scroll tick — nothing is cached, so nothing can
  // go stale regardless of when layout settles, and it's symmetric in
  // both scroll directions since it's just reading where things are right now.
  function resolveActiveIndex() {
    let next = 0;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const rectTop = el.getBoundingClientRect().top;
      const cssTop = WHY_CARD_TOP_BASE + i * WHY_CARD_TOP_STEP;
      if (rectTop <= cssTop + 1) next = i;
    });
    return next;
  }

  useMotionValueEvent(scrollY, "change", () => {
    if (!inViewRef.current) return;
    setActiveIndex(resolveActiveIndex());
  });

  // Covers loading the page already scrolled mid-section (anchor link,
  // scroll restoration) — otherwise the index wouldn't update until the
  // next scroll event.
  useEffect(() => {
    setActiveIndex(resolveActiveIndex());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const scrollToCard = (index: number) => {
    cardRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section ref={sectionRef} id="why-truorigin" className="brands-section brands-section-cream brands-why-shell">
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
