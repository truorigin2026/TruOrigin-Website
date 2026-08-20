"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AssetImage } from "@/components/brands/asset-image";
import { brandAssets } from "@/lib/data/brands-landing-data";

type Audience = "brands" | "customers";

export function BenefitsSwitcher({
  brandBenefits,
  customerBenefits,
}: {
  brandBenefits: readonly string[];
  customerBenefits: readonly string[];
}) {
  const [audience, setAudience] = useState<Audience>("brands");
  const activeBenefits = audience === "brands" ? brandBenefits : customerBenefits;

  return (
    <div className="bnf-switcher">
      <div className="bnf-switcher-header">
        <p className="bnf-switcher-eyebrow">Benefits For</p>
        <div className="bnf-toggle" role="tablist" aria-label="Choose audience">
          {(["brands", "customers"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={audience === key}
              className={`bnf-toggle-btn ${audience === key ? "is-active" : ""}`}
              onClick={() => setAudience(key)}
            >
              {audience === key ? (
                <motion.span
                  layoutId="bnf-toggle-thumb"
                  className="bnf-toggle-thumb"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="bnf-toggle-label">{key === "brands" ? "Brands" : "Customers"}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bnf-switcher-body">
        <AnimatePresence mode="wait">
          <motion.ul
            key={audience}
            className="bnf-benefit-list"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeBenefits.map((benefit, index) => (
              <li key={benefit}>
                <span className="bnf-benefit-index">0{index + 1}</span>
                <div className="bnf-benefit-copy">
                  <AssetImage src={brandAssets.checkmark} alt="" width={16} height={16} className="brands-check-icon" />
                  <span>{benefit}</span>
                </div>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>

        <div className="bnf-switcher-chart">
          <AssetImage src={brandAssets.benefitsChart} alt="Growth chart showing verification impact" />
        </div>
      </div>
    </div>
  );
}
