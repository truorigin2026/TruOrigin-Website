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
  const opacity = useTransform(progress, range, [0.18, 1]);
  const y = useTransform(progress, range, [10, 0]);

  return (
    <span className="brands-reveal-word-wrap">
      <motion.span style={{ opacity, y }} className="brands-reveal-word">
        {children}
      </motion.span>
    </span>
  );
}

export function ScrollRevealText({ text, className }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLParagraphElement | null>(null);
  const { scrollY } = useScroll();
  const [inputRange, setInputRange] = useState<[number, number]>([0, 1]);

  useEffect(() => {
    // Measured against absolute document position (not the live rect) because this
    // text lives inside a `position: sticky` ancestor: once it locks in place, its
    // getBoundingClientRect() freezes, which would stall scrollYProgress mid-reveal.
    function measure() {
      const el = containerRef.current;
      if (!el) return;
      const viewportHeight = window.innerHeight;
      const staticTop = el.getBoundingClientRect().top + window.scrollY;
      setInputRange([staticTop - viewportHeight * 0.9, staticTop - viewportHeight * 0.3]);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
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
