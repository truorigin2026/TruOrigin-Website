"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { FadeIn } from "@/components/motion";

type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-accordion">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <FadeIn key={item.question} delay={index * 0.05}>
            <div className={`faq-accordion-item ${open ? "is-open" : ""}`}>
              <button
                type="button"
                className="faq-accordion-trigger"
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : index)}
              >
                <span>{item.question}</span>
                <span className="faq-accordion-icon">
                  <Plus size={18} aria-hidden="true" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open ? (
                  <motion.div
                    className="faq-accordion-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p>{item.answer}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
