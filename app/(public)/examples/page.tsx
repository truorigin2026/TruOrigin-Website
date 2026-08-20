import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { PageHero } from "@/components/sections/page-hero";
import { sampleProducts, statusConfig } from "@/lib/data/site-data";

export default function ExamplesPage() {
  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Clarity Library"
        title="See the kind of product pages customers actually open."
        description="These product snapshots show how TruOrigin turns claims into a cleaner and more readable product experience."
      />

      <section className="container-shell page-section">
        <div className="grid gap-5">
          {sampleProducts.map((product, index) => (
            <FadeIn key={product.slug} delay={index * 0.08}>
              <article className="preview-card">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                      {product.category}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                      {product.name}
                    </h2>
                    <p className="mt-3 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                      {product.summary}
                    </p>
                  </div>
                  <Link href={`/product/${product.slug}`} className="btn-outline">
                    Open Product
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {product.claims.map((claim) => (
                    <div
                      key={claim.text}
                      className="rounded-[22px] border border-[color:var(--line)] bg-[#fbfcfb] px-4 py-4"
                    >
                      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">
                        {claim.text}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                        {claim.requiredEvidence}
                      </p>
                      <div
                        className="status-pill mt-4"
                        style={{
                          background: statusConfig[claim.status].background,
                          color: statusConfig[claim.status].text,
                        }}
                      >
                        <span
                          className="status-dot"
                          style={{ background: statusConfig[claim.status].dot }}
                        />
                        {claim.status}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
