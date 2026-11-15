"use client";

import { useState } from "react";
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
              {/* CSS grid-template-rows 0fr/1fr instead of framer-motion's
                  height:"auto" animation -- that measured content height via
                  JS every frame (a real layout-thrashing cost on weak
                  devices); this hands the same collapse/expand to the
                  browser's own layout engine with no per-frame JS at all. */}
              <div className="faq-accordion-panel-wrapper" aria-hidden={!open} inert={!open || undefined}>
                <div className="faq-accordion-panel">
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
