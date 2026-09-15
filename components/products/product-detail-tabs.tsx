"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Download, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { ProductRecord, ProductClaim, ProductCertificate, statusConfig, certificateDocTypeLabels } from "@/lib/data/site-data";
import { Badge } from "@/components/ui/badge";
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

function KeyInfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="key-info-tile">
      <p className="key-info-tile-label">{label}</p>
      <p className="key-info-tile-value">{value}</p>
    </div>
  );
}

function DocumentDetailPanel({
  certificate,
  onBack,
  backLabel,
}: {
  certificate: ProductCertificate;
  onBack: () => void;
  backLabel: string;
}) {
  const keyInfo = [
    certificate.issuer ? { label: "Testing Organization", value: certificate.issuer } : null,
    certificate.testType ? { label: "Test Type", value: certificate.testType } : null,
    certificate.testDate ? { label: "Test Date", value: certificate.testDate } : null,
    certificate.testScope ? { label: "Test Scope", value: certificate.testScope } : null,
  ].filter((tile): tile is { label: string; value: string } => tile !== null);

  return (
    <TrackInView eventType="CERTIFICATE_VIEW" targetId={certificate.id}>
      <div className="detail-section-card document-detail-panel">
        <button type="button" className="detail-back-link" onClick={onBack}>
          ← {backLabel}
        </button>

        <div className="document-detail-header">
          <span className="document-detail-icon">
            <FileText size={22} strokeWidth={2} aria-hidden="true" />
          </span>
          <div className="document-detail-heading">
            <h3>{certificate.title}</h3>
            <p>{certificateDocTypeLabels[certificate.docType] ?? certificate.docType}</p>
          </div>
          <Badge variant={certificate.isPublic ? "success" : "warning"}>
            {certificate.isPublic ? "Public" : "Private"}
          </Badge>
        </div>

        {certificate.isPublic && certificate.fileUrl ? (
          <div className="document-detail-actions">
            <a href={certificate.fileUrl} target="_blank" rel="noreferrer" className="saas-btn-primary document-detail-action">
              <ExternalLink size={15} strokeWidth={2.2} />
              View Document
            </a>
            <a href={certificate.fileUrl} download className="document-detail-action document-detail-action-outline">
              <Download size={15} strokeWidth={2.2} />
              Download
            </a>
          </div>
        ) : (
          <p className="document-private-notice">
            This document is kept private by the brand — only the information below is shown, never the original
            file.
          </p>
        )}

        {keyInfo.length > 0 ? (
          <div className="key-info-section">
            <p className="key-info-section-label">Key Information</p>
            <div className="key-info-grid">
              {keyInfo.map((tile) => (
                <KeyInfoTile key={tile.label} label={tile.label} value={tile.value} />
              ))}
            </div>
          </div>
        ) : null}

        {certificate.reviewNote ? (
          <div className="key-findings-box">
            <p className="key-findings-label">Key Findings</p>
            <p className="key-findings-text">{certificate.reviewNote}</p>
          </div>
        ) : null}
      </div>
    </TrackInView>
  );
}

function ClaimDetailPanel({
  claim,
  certificates,
  onBack,
  onOpenDocument,
}: {
  claim: ProductClaim;
  certificates: ProductCertificate[];
  onBack: () => void;
  onOpenDocument: (certificateId: string) => void;
}) {
  return (
    <div className="detail-section-card claim-detail-panel">
      <button type="button" className="detail-back-link" onClick={onBack}>
        ← Back to Claims
      </button>

      <div className="claim-detail-header">
        <span className="claim-detail-icon">
          <ShieldCheck size={20} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h3>{claim.text}</h3>
      </div>

      {certificates.length > 0 ? (
        <>
          <p className="claim-detail-provided-badge">Supporting information provided by the brand.</p>
          <div className="claim-detail-document-list">
            {certificates.map((certificate) => (
              <button
                key={certificate.id}
                type="button"
                className="claim-detail-document-row"
                onClick={() => onOpenDocument(certificate.id)}
              >
                <span className="claim-detail-document-icon">
                  <FileText size={16} strokeWidth={2} aria-hidden="true" />
                </span>
                <span className="claim-detail-document-copy">
                  <span className="claim-detail-document-type">
                    {certificateDocTypeLabels[certificate.docType] ?? certificate.docType}
                  </span>
                  <span className="claim-detail-document-title">{certificate.title}</span>
                </span>
                <Badge variant={certificate.isPublic ? "success" : "warning"}>
                  {certificate.isPublic ? "Public" : "Private"}
                </Badge>
                <ChevronRight size={16} strokeWidth={2.2} className="claim-detail-document-chevron" aria-hidden="true" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="detail-muted">
          {claim.evidence || "No supporting evidence has been linked for this claim yet."}
        </p>
      )}
    </div>
  );
}

function ClaimRow({ claim, onOpen }: { claim: ProductClaim; onOpen: () => void }) {
  const supportCount = claim.certificateIds.length;

  return (
    <TrackInView eventType="CLAIM_VIEW" targetId={claim.id}>
      <article className="claim-row">
        <button type="button" className="claim-row-trigger" onClick={onOpen}>
          <span className="claim-row-icon">
            <ShieldCheck size={18} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="claim-row-copy">
            <span className="claim-row-title">{claim.text}</span>
            {supportCount > 0 ? (
              <span className="claim-row-support">
                Supported by {supportCount} document{supportCount === 1 ? "" : "s"}
              </span>
            ) : null}
          </span>
          <span className="claim-row-chevron" aria-hidden="true">
            <ChevronRight size={18} strokeWidth={2.2} />
          </span>
        </button>
      </article>
    </TrackInView>
  );
}

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const ingredients = product.ingredients ?? [];
  const certificates = product.certificates ?? [];
  const showOverviewNote = Boolean(product.productNote) && product.productNote !== product.summary;

  const selectedClaim = product.claims.find((claim) => claim.id === selectedClaimId) ?? null;
  const selectedCertificate = certificates.find((cert) => cert.id === selectedCertificateId) ?? null;
  const claimCertificates = selectedClaim
    ? certificates.filter((cert) => selectedClaim.certificateIds.includes(cert.id))
    : [];

  function switchTab(tab: TabKey) {
    setActiveTab(tab);
    setSelectedClaimId(null);
    setSelectedCertificateId(null);
  }

  const paneKey = `${activeTab}:${selectedCertificateId ?? selectedClaimId ?? ""}`;

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
              onClick={() => switchTab(tab.key)}
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
          key={paneKey}
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

          {activeTab === "claims" && selectedCertificate ? (
            <DocumentDetailPanel
              certificate={selectedCertificate}
              backLabel={selectedClaim ? "Back to Claim" : "Back to Claims"}
              onBack={() => setSelectedCertificateId(null)}
            />
          ) : null}

          {activeTab === "claims" && !selectedCertificate && selectedClaim ? (
            <ClaimDetailPanel
              claim={selectedClaim}
              certificates={claimCertificates}
              onBack={() => setSelectedClaimId(null)}
              onOpenDocument={(certificateId) => setSelectedCertificateId(certificateId)}
            />
          ) : null}

          {activeTab === "claims" && !selectedCertificate && !selectedClaim ? (
            <div className="detail-section-card">
              <h2>Claims</h2>
              <div className="claim-list">
                {product.claims.map((claim) => (
                  <ClaimRow key={claim.id ?? claim.text} claim={claim} onOpen={() => claim.id && setSelectedClaimId(claim.id)} />
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

          {activeTab === "documents" && selectedCertificate ? (
            <DocumentDetailPanel
              certificate={selectedCertificate}
              backLabel="Back to Documents"
              onBack={() => setSelectedCertificateId(null)}
            />
          ) : null}

          {activeTab === "documents" && !selectedCertificate ? (
            <div className="detail-section-card">
              <h2>Documents</h2>
              {certificates.length > 0 ? (
                <ul className="detail-cert-summary-list">
                  {certificates.map((certificate) => (
                    <li key={certificate.id}>
                      <button
                        type="button"
                        className="detail-cert-summary-row"
                        onClick={() => setSelectedCertificateId(certificate.id)}
                      >
                        <span className="detail-cert-summary-copy">
                          <span className="detail-cert-summary-type">
                            {certificateDocTypeLabels[certificate.docType] ?? certificate.docType}
                          </span>
                          <span className="detail-cert-summary-title">{certificate.title}</span>
                        </span>
                        <Badge variant={certificate.isPublic ? "success" : "warning"}>
                          {certificate.isPublic ? "Public" : "Private"}
                        </Badge>
                        <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
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
