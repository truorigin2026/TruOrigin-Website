import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { PageHero } from "@/components/sections/page-hero";
import { QrArtwork } from "@/components/qr-artwork";
import { sampleBrand, sampleProducts, statusConfig } from "@/lib/data/site-data";
import brandsHeroImage from "../../../public/images/for-brands/see-what-customers-see.png";

export default function BrandsPage() {
  return (
    <div className="section-spacing">
      <PageHero
        eyebrow="Brands"
        title="A connected brand view with multiple products under one clarity system."
        description="This page shows how a brand portfolio can present several approved products inside one consistent transparency experience."
        imageSrc={brandsHeroImage.src}
      />

      <section className="container-shell mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <FadeIn>
          <aside className="section-panel rounded-[34px] p-8 md:p-10">
            <p className="eyebrow">{sampleBrand.label}</p>
            <h2 className="display-font mt-7 text-4xl md:text-5xl">{sampleBrand.name}</h2>
            <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">{sampleBrand.summary}</p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/82 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Products
                </p>
                <p className="mt-2 text-2xl font-semibold">{sampleBrand.productCount}</p>
              </div>
              <div className="rounded-[24px] bg-white/82 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  Experience
                </p>
                <p className="mt-2 text-2xl font-semibold">QR-first</p>
              </div>
            </div>

            <div className="mt-7 rounded-[28px] bg-[linear-gradient(135deg,#173628,#274d3a)] p-6 text-white">
              <h3 className="text-2xl font-semibold">Portfolio clarity in one place</h3>
              <p className="mt-3 text-sm leading-7 text-white/76">
                Keep multiple products, review statuses, and QR-ready pages connected to one brand
                account so customers get a consistent experience.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[color:var(--brand-dark)]"
              >
                Brand Login
              </Link>
            </div>
          </aside>
        </FadeIn>

        <div className="grid gap-5">
          {sampleProducts.map((product, index) => (
            <FadeIn key={product.slug} delay={index * 0.08}>
              <article className="section-panel rounded-[32px] p-6 md:p-7">
                <div className="grid gap-5 md:grid-cols-[0.78fr_1.22fr]">
                  <div className="rounded-[26px] bg-[linear-gradient(180deg,#f2ede4,#e7dfd2)] p-4">
                    <div className="flex aspect-[4/5] items-center justify-center rounded-[22px] bg-white/60 text-center">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          Product
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">{product.productNote}</p>
                      </div>
                    </div>
                    <QrArtwork code={product.scanCode} className="mt-4" />
                  </div>

                  <div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                          {product.category}
                        </p>
                        <h3 className="mt-3 text-3xl font-semibold text-[color:var(--foreground)]">
                          {product.name}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                          {product.summary}
                        </p>
                      </div>
                      <Link
                        href={`/product/${product.slug}`}
                        className="inline-flex rounded-full bg-[color:var(--foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-dark)]"
                      >
                        View Product
                      </Link>
                    </div>

                    <div className="mt-5 space-y-3">
                      {product.claims.slice(0, 2).map((claim) => (
                        <div key={claim.text} className="rounded-[22px] border border-[color:var(--line)] bg-white/82 p-4">
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <h4 className="font-semibold">{claim.text}</h4>
                              <p className="mt-1 text-sm text-[color:var(--muted)]">
                                {claim.requiredEvidence}
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
