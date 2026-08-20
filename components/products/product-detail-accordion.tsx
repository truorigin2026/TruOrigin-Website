"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProductRecord, statusConfig, certificateDocTypeLabels } from "@/lib/data/site-data";
import { TrackInView, useCertificateViewTracker } from "@/components/analytics/scan-tracking";

type DetailAccordionProps = {
  product: ProductRecord;
};

const panelTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const };

export function ProductDetailAccordion({ product }: DetailAccordionProps) {
  const [openItem, setOpenItem] = useState<string>("claims");
  const trackCertificateView = useCertificateViewTracker();
  const ingredients = product.ingredients ?? [];
  const isIngredientsOpen = openItem === "ingredients";

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "ingredients-panel") setOpenItem("ingredients");
      else if (hash === "claims-panel") setOpenItem("claims");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  return (
    <div className="product-accordion-list">
      <section id="claims-panel" className={`product-accordion-item ${openItem === "claims" ? "is-open" : ""}`}>
        <button
          type="button"
          className="product-accordion-trigger"
          onClick={() => setOpenItem((current) => (current === "claims" ? "" : "claims"))}
          aria-expanded={openItem === "claims"}
        >
          <div>
            <p className="product-accordion-label">Claims</p>
            <span>Explore the claims made by the brand and the level of supporting evidence available.</span>
          </div>
          <span className={`product-accordion-chevron ${openItem === "claims" ? "is-open" : ""}`}>+</span>
        </button>

        <AnimatePresence initial={false}>
          {openItem === "claims" ? (
            <motion.div
              className="product-accordion-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={panelTransition}
              style={{ overflow: "hidden" }}
            >
            <TrackInView eventType="CLAIM_VIEW" targetId={product.claims[0]?.id}>
              <div className="claim-featured-card">
                <div className="claim-featured-summary">
                  <span className="claim-icon-wrap">✦</span>
                  <div>
                    <h3>{product.claims[0]?.text ?? "Claim available"}</h3>
                    <span
                      className="claim-status-pill"
                      style={{
                        background: statusConfig[product.claims[0]?.status ?? "Evidence Available"].background,
                        color: statusConfig[product.claims[0]?.status ?? "Evidence Available"].text,
                      }}
                    >
                      {product.claims[0]?.status ?? "Evidence Available"}
                    </span>
                    <p>{product.claims[0]?.evidence}</p>
                  </div>
                </div>

                {product.certificates && product.certificates.length > 0 ? (
                  <div className="claim-documents-grid">
                    {product.certificates.map((certificate) => (
                      <article key={certificate.id} className="claim-document-card">
                        <span className="claim-document-type">
                          {certificateDocTypeLabels[certificate.docType] ?? certificate.docType}
                        </span>
                        <h4>{certificate.title}</h4>
                        <p>{certificate.issuer ?? "Issuer not specified"}</p>
                        <a
                          href={certificate.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => trackCertificateView(certificate.id)}
                        >
                          View Document
                        </a>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="detail-muted">No supporting documents have been linked to this product yet.</p>
                )}
              </div>
            </TrackInView>

            <div className="claim-list-stack">
              {product.claims.slice(1).map((claim) => {
                const status = statusConfig[claim.status];
                return (
                  <TrackInView key={claim.id ?? claim.text} eventType="CLAIM_VIEW" targetId={claim.id}>
                    <article className="claim-collapsed-row">
                      <div className="claim-collapsed-copy">
                        <h4>{claim.text}</h4>
                        <p>{claim.evidence}</p>
                      </div>
                      <span
                        className="claim-status-pill"
                        style={{ background: status.background, color: status.text }}
                      >
                        {claim.status}
                      </span>
                    </article>
                  </TrackInView>
                );
              })}
            </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <section id="ingredients-panel" className={`product-accordion-item ${isIngredientsOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="product-accordion-trigger"
          onClick={() => setOpenItem(isIngredientsOpen ? "" : "ingredients")}
          aria-expanded={isIngredientsOpen}
        >
          <div>
            <p className="product-accordion-label">Ingredients</p>
            <span>View the core formulation signals used to understand the product composition.</span>
          </div>
          <span className={`product-accordion-chevron ${isIngredientsOpen ? "is-open" : ""}`}>+</span>
        </button>
        <AnimatePresence initial={false}>
          {isIngredientsOpen ? (
            <motion.div
              className="product-accordion-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={panelTransition}
              style={{ overflow: "hidden" }}
            >
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
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </div>
  );
}
