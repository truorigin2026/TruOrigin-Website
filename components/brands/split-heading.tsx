"use client";

import { motion, type Variants } from "framer-motion";

const revealEase = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const wordVariant: Variants = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.6, ease: revealEase },
  },
};

export function SplitHeading({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");

  return (
    <motion.h2
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`}>
          <span className="brands-split-word-mask">
            <motion.span className="brands-split-word" variants={wordVariant}>
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.h2>
  );
}
