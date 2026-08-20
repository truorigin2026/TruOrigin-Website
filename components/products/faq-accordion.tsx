"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { FadeIn } from "@/components/motion";

type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-accordion-list">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <FadeIn key={item.question} delay={index * 0.05}>
            <div className={`faq-accordion-item ${isOpen ? "is-open" : ""}`}>
              <button
                type="button"
                className="faq-accordion-trigger"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="faq-accordion-icon">
                  <Plus size={16} className={`faq-accordion-icon-glyph ${isOpen ? "is-open" : ""}`} />
                </span>
                <span>{item.question}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    className="faq-accordion-body-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="faq-accordion-body">{item.answer}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
