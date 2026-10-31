"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

function RevealWord({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  // Floor was 0.18: axe-core measured the pre-reveal state (every word,
  // on initial load, before the user scrolls into this section's trigger
  // range) at ~1.35:1 against the section's background -- nowhere close
  // to the 3:1 minimum for this large text on desktop. On mobile this text
  // renders smaller (confirmed: ~22.4px regular weight, under the "large
  // text" threshold), which raises the bar to the full 4.5:1 -- 0.65
  // measured 3.67:1 there, still short. 0.75 passes at ~4.7:1 even at that
  // smaller mobile size, while still reading as visibly "faded" relative
  // to the fully-revealed 1.0 end state (the animation itself is
  // unchanged).
  const opacity = useTransform(progress, range, [0.75, 1]);
  const y = useTransform(progress, range, [10, 0]);

  return (
    <span className="brands-reveal-word-wrap">
      <motion.span style={{ opacity, y }} className="brands-reveal-word">
        {children}
      </motion.span>
    </span>
  );
}

// Walks the offsetParent chain instead of using getBoundingClientRect(),
// which reports the element's current *painted* position — wrong while an
// ancestor is mid-transform (e.g. the page-transition's framer-motion
// `layout` animation) or while a `position: sticky` ancestor is currently
// stuck. offsetTop always reflects the normal-flow resting position, so
// it's immune to both.
function getStaticTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

export function ScrollRevealText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLParagraphElement | null>(null);
  const { scrollY } = useScroll();
  const [inputRange, setInputRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const viewportHeight = window.innerHeight;
      const staticTop = getStaticTop(el);
      setInputRange([staticTop - viewportHeight * 0.9, staticTop - viewportHeight * 0.3]);
    }

    // A single measurement on mount can still be wrong if content above
    // this section (fonts, images) resizes afterward — keep remeasuring
    // whenever the page's layout actually changes, not just on viewport
    // resize.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      resizeObserver.disconnect();
    };
  }, []);

  const progress = useTransform(scrollY, inputRange, [0, 1]);

  const words = text.split(" ");

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, index) => {
        const start = index / words.length;
        const end = start + 1 / words.length;
        return (
          <span key={`${word}-${index}`}>
            <RevealWord progress={progress} range={[start, end]}>
              {word}
            </RevealWord>
            {index < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
