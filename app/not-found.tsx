import { PillButton, ArrowIcon } from "@/components/ui/pill-button";

export default function NotFound() {
  return (
    <div className="container-shell legal-page-header not-found-page">
      <p className="eyebrow">404</p>
      <h1 className="legal-page-title">Page Not Found</h1>
      <p className="legal-page-meta">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="not-found-actions">
        <PillButton href="/" variant="primary" icon={<ArrowIcon />}>
          Go Home
        </PillButton>
        <PillButton href="/for-products/support" variant="outline">
          Contact Support
        </PillButton>
      </div>
    </div>
  );
}
