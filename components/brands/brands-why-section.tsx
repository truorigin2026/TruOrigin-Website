"use client";

import { useEffect, useRef, useState } from "react";

type WhyPoint = {
  title: string;
  description: string;
};

export function BrandsWhySection({ points }: { points: readonly WhyPoint[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [points]);

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
