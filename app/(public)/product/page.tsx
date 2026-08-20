import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";

const points = [
  "Standardized claim presentation",
  "Visible evidence status labels",
  "QR-linked product pages",
  "Cleaner customer understanding",
];

export default function ProductPage() {
  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Product"
        title="A clearer way to present product claims."
        description="TruOrigin helps brands show claims, documents, and evidence statuses in a clean format that customers can understand in seconds."
      />

      <section className="container-shell page-section">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="info-card">
            <h2 className="display-font text-4xl text-[color:var(--foreground)] md:text-5xl">
              What TruOrigin does
            </h2>
            <div className="mt-8 space-y-4">
              {points.map((point) => (
                <div key={point} className="rounded-[22px] border border-[color:var(--line)] bg-white px-5 py-4">
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="brand-metric-card">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
              Product Promise
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">
              Clarity without judgment
            </h2>
            <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
              TruOrigin does not certify or declare truth. It gives customers a better way to see
              what claims are shown and what evidence is attached to them.
            </p>
            <Link href="/for-products/products" className="btn-primary mt-8">
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
