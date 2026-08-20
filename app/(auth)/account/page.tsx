import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "BRAND" || !user.brandId) {
    redirect("/login");
  }

  const [brand, totalProducts, liveProducts, pendingProducts, recentProducts] = await Promise.all([
    prisma.brand.findUnique({
      where: { id: user.brandId },
      include: {
        products: {
          orderBy: { updatedAt: "desc" },
          take: 5,
          include: { category: true },
        },
      },
    }),
    prisma.product.count({ where: { brandId: user.brandId } }),
    prisma.product.count({ where: { brandId: user.brandId, status: "APPROVED" } }),
    prisma.product.count({
      where: { brandId: user.brandId, status: { in: ["DRAFT", "SUBMITTED", "IN_REVIEW"] } },
    }),
    prisma.product.findMany({
      where: { brandId: user.brandId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: { category: true },
    }),
  ]);

  if (!brand) {
    redirect("/login");
  }

  return (
    <div className="page-shell">
      <section className="container-shell page-section">
        <div className="grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
          <div className="glass-panel rounded-[34px] p-8 md:p-10">
            <p className="eyebrow">Brand Account</p>
            <h1 className="display-font mt-6 text-4xl md:text-5xl">{brand.name}</h1>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              Logged in as <span className="font-semibold text-[color:var(--foreground)]">{user.email}</span>.
              This workspace keeps your product information organized and ready for admin review.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                ["Brand name", brand.name],
                ["Brand slug", brand.slug],
                [
                  "Workspace status",
                  brand.status === "ACTIVE"
                    ? "Approved"
                    : brand.status === "SUSPENDED"
                      ? "Suspended"
                      : "Pending brand review",
                ],
                ["Live products", String(liveProducts)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-[color:var(--line)] bg-white/80 px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    {label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/brand/products/new" className="btn-primary">
                Add Product
              </Link>
              <Link href="/brand/dashboard" className="btn-outline">
                Open Dashboard
              </Link>
            </div>

            <form action="/api/auth/logout" method="post" className="mt-6">
              <button type="submit" className="rounded-full border border-[color:var(--line)] px-5 py-3 text-sm font-semibold transition hover:bg-white">
                Log out
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <section className="grid gap-5 sm:grid-cols-3">
              <article className="glass-panel rounded-[28px] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">Total Products</p>
                <h2 className="mt-4 display-font text-4xl text-[color:var(--brand-dark)]">{totalProducts}</h2>
                <p className="mt-3 text-sm text-[color:var(--muted)]">All product records in your workspace.</p>
              </article>
              <article className="glass-panel rounded-[28px] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">Ready Live</p>
                <h2 className="mt-4 display-font text-4xl text-[color:var(--brand-dark)]">{liveProducts}</h2>
                <p className="mt-3 text-sm text-[color:var(--muted)]">Approved and visible to the public.</p>
              </article>
              <article className="glass-panel rounded-[28px] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">Needs Review</p>
                <h2 className="mt-4 display-font text-4xl text-[color:var(--brand-dark)]">{pendingProducts}</h2>
                <p className="mt-3 text-sm text-[color:var(--muted)]">Draft, submitted, or in review.</p>
              </article>
            </section>

            <section className="glass-panel rounded-[34px] p-7 md:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Recent Products</p>
                  <h2 className="mt-3 display-font text-3xl">Your latest workspace activity</h2>
                </div>
                <p className="text-sm text-[color:var(--muted)]">Updated from the live database</p>
              </div>

              <div className="mt-6 grid gap-4">
                {recentProducts.length > 0 ? (
                  recentProducts.map((product) => (
                    <article
                      key={product.id}
                      className="rounded-[24px] border border-[color:var(--line)] bg-white/80 px-5 py-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                            {product.category.name}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">{product.name}</h3>
                          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                            Status: {product.status.replaceAll("_", " ").toLowerCase()}.
                            {product.serialNumber ? ` Serial ${product.serialNumber}.` : " Serial will be created after approval."}
                          </p>
                        </div>
                        <span className="rounded-full bg-[color:var(--brand-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-dark)]">
                          {product.updatedAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[color:var(--line)] bg-white/70 px-5 py-6 text-sm leading-7 text-[color:var(--muted)]">
                    No products yet. Add your first product to start building QR-ready tags and public pages.
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
