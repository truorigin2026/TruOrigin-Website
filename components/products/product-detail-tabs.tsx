"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { ProductRecord, ProductClaim, statusConfig, certificateDocTypeLabels } from "@/lib/data/site-data";
import { TrackInView } from "@/components/analytics/scan-tracking";

type ProductDetailTabsProps = {
  product: ProductRecord;
};

type TabKey = "overview" | "claims" | "ingredients" | "documents";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "claims", label: "Claims" },
  { key: "ingredients", label: "Ingredients" },
  { key: "documents", label: "Documents" },
];

const paneTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

function ClaimRow({ claim }: { claim: ProductClaim }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TrackInView eventType="CLAIM_VIEW" targetId={claim.id}>
      <article className={`claim-row ${isOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="claim-row-trigger"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          <span className="claim-row-icon">
            <ShieldCheck size={18} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="claim-row-copy">
            <span className="claim-row-title">{claim.text}</span>
          </span>
          <span className="claim-row-chevron" aria-hidden="true">
            <ChevronRight size={18} strokeWidth={2.2} />
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              className="claim-row-evidence-wrap"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={paneTransition}
              style={{ overflow: "hidden" }}
            >
              <p className="claim-row-evidence">{claim.evidence}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </article>
    </TrackInView>
  );
}

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const ingredients = product.ingredients ?? [];
  const certificates = product.certificates ?? [];
  const showOverviewNote = Boolean(product.productNote) && product.productNote !== product.summary;

  return (
    <div className="product-tabs">
      <div className="product-tabs-bar">
        <nav className="product-tabs-list" role="tablist" aria-label="Product information sections">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`product-tabs-trigger ${activeTab === tab.key ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {activeTab === tab.key ? (
                <motion.span
                  layoutId="product-tabs-thumb"
                  className="product-tabs-thumb"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="product-tabs-trigger-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <motion.div layout transition={paneTransition} className="product-tabs-panel-wrap">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeTab}
          layout
          className="product-tabs-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={paneTransition}
        >
          {activeTab === "overview" ? (
            <div className="detail-section-card detail-section-overview">
              <h2>Overview</h2>
              <p>{product.summary}</p>
              {showOverviewNote ? <p className="detail-muted">{product.productNote}</p> : null}
              <dl className="detail-dl">
                <div>
                  <dt>Brand</dt>
                  <dd>{product.brand}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{product.category}</dd>
                </div>
                <div>
                  <dt>Subcategory</dt>
                  <dd>{product.subcategory}</dd>
                </div>
                <div>
                  <dt>Scan Code</dt>
                  <dd>{product.scanCode}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          {activeTab === "claims" ? (
            <div className="detail-section-card">
              <h2>Claims</h2>
              <div className="claim-list">
                {product.claims.map((claim) => (
                  <ClaimRow key={claim.id ?? claim.text} claim={claim} />
                ))}
              </div>
            </div>
          ) : null}

          {activeTab === "ingredients" ? (
            <div className="detail-section-card">
              <h2>Ingredients</h2>
              {ingredients.length > 0 ? (
                <div className="ingredient-chip-grid">
                  {ingredients.map((ingredient) => (
                    <article key={ingredient.id} className="ingredient-chip">
                      <span className="ingredient-chip-name">{ingredient.name}</span>
                      {ingredient.note ? <span className="ingredient-chip-note">{ingredient.note}</span> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="detail-muted">No ingredient list has been added for this product yet.</p>
              )}
            </div>
          ) : null}

          {activeTab === "documents" ? (
            <div className="detail-section-card">
              <h2>Documents</h2>
              {certificates.length > 0 ? (
                <ul className="detail-cert-summary-list">
                  {certificates.map((certificate) => {
                    const status = statusConfig[certificate.verified ? "Evidence Available" : "Limited Evidence"];
                    return (
                      <li key={certificate.id} className="detail-cert-summary-row">
                        <span className="detail-cert-summary-type">
                          {certificateDocTypeLabels[certificate.docType] ?? certificate.docType}
                        </span>
                        <span className="detail-cert-summary-title">{certificate.title}</span>
                        <span className="claim-status-pill" style={{ background: status.background, color: status.text }}>
                          {certificate.verified ? "Verified" : "Submitted"}
                        </span>
                        {certificate.reviewNote ? (
                          <p className="detail-muted detail-cert-summary-note">{certificate.reviewNote}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="detail-muted">No certificates have been linked to this product yet.</p>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
