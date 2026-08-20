import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { QrArtwork } from "@/components/qr-artwork";
import { ProductRecord, statusConfig } from "@/lib/data/site-data";

export function ProductClaimsPage({ product }: { product: ProductRecord }) {
  return (
    <div className="section-spacing">
      <section className="container-shell pt-8">
        <FadeIn>
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <aside className="section-panel rounded-[34px] p-8 md:p-10">
              <p className="eyebrow">Product Information Page</p>
              <h1 className="display-font mt-7 text-4xl leading-tight md:text-6xl">{product.name}</h1>
              <p className="mt-3 text-base text-[color:var(--muted)]">
                {product.brand} · {product.category}
              </p>

              <div className="mt-7 overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#f4efe6,#ede5d8)] p-5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/55">
                  <Image
                    src={product.imageGallery[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <QrArtwork code={product.scanCode} className="mt-6" />

              <div className="mt-6 rounded-[28px] bg-[color:var(--soft-contrast)] p-5 text-sm leading-7 text-[color:var(--brand-dark)]">
                {product.summary}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white/82 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Last Updated
                  </p>
                  <p className="mt-2 text-lg font-semibold">{product.lastUpdated}</p>
                </div>
                <div className="rounded-[24px] bg-white/82 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    Product Code
                  </p>
                  <p className="mt-2 text-lg font-semibold">{product.scanCode}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/for-products/products"
                  className="inline-flex rounded-full bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-dark)]"
                >
                  Browse Products
                </Link>
                <Link
                  href="/brands"
                  className="inline-flex rounded-full border border-[color:var(--line)] bg-white/82 px-5 py-3 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-white"
                >
                  Back to Brands
                </Link>
              </div>

              <p className="mt-8 text-xs leading-6 text-[color:var(--muted)]">
                Disclaimer: TruOrigin organizes claims and supporting evidence supplied for the
                product page. It does not certify truth or replace independent customer judgment.
              </p>
            </aside>

            <div className="space-y-5">
              {product.claims.map((claim, index) => (
                <FadeIn key={claim.text} delay={index * 0.08}>
                  <article className="section-panel rounded-[30px] p-7">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          Claim {String(index + 1).padStart(2, "0")}
                        </p>
                        <h2 className="mt-3 text-2xl font-semibold">{claim.text}</h2>
                        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                          Required evidence: {claim.requiredEvidence}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">
                          {claim.evidence}
                        </p>
                      </div>

                      <div
                        className="status-pill"
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
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
