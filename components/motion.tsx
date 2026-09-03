"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const revealEase = [0.16, 1, 0.3, 1] as const;

export function HeroReveal({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  // Renders immediately, no entrance animation — hero content used to be
  // opacity:0 until client JS hydrated and this animation finished, which
  // could take over a second across staggered delays. That left hero
  // sections looking blank/missing while the rest of the page (e.g. the
  // footer, which has no such animation) was already fully visible.
  return <div className={className}>{children}</div>;
}

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.5, delay, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}
