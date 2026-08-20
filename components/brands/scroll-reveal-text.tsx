"use client";

import { useRef } from "react";
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
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.9", "start 0.35"],
  });

  const words = text.split(" ");

  return (
    <p ref={containerRef} className={className}>
      {words.map((word, index) => {
        const start = index / words.length;
        const end = start + 1 / words.length;
        return (
          <span key={`${word}-${index}`}>
            <RevealWord progress={scrollYProgress} range={[start, end]}>
              {word}
            </RevealWord>
            {index < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </p>
  );
}
