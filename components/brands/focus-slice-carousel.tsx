"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { FadeIn } from "@/components/motion";

type SliceItem = {
  title: string;
  description: string;
};

const AUTO_ADVANCE_MS = 3000;

export function FocusSliceCarousel<T extends SliceItem>({
  items,
  renderIcon,
}: {
  items: readonly T[];
  renderIcon: (item: T, index: number) => ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      setActiveIndex((current) => (current + 1) % items.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [items.length]);

  const pauseOn = (index: number) => {
    isPausedRef.current = true;
    setActiveIndex(index);
  };

  const resume = () => {
    isPausedRef.current = false;
  };

  return (
    <FadeIn delay={0.1}>
      <div className="brands-slices" role="list" onMouseLeave={resume}>
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={item.title}
              role="listitem"
              tabIndex={0}
              className={`brands-slice${isActive ? " is-active" : ""}`}
              onMouseEnter={() => pauseOn(index)}
              onFocus={() => pauseOn(index)}
              onBlur={resume}
              onClick={() => pauseOn(index)}
            >
              <span className="brands-slice-glow" aria-hidden="true" />
              <span className="brands-slice-index">0{index + 1}</span>
              <span className="brands-slice-icon">{renderIcon(item, index)}</span>
              <h3 className="brands-slice-title">{item.title}</h3>
              <p className="brands-slice-desc">{item.description}</p>
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
