import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";

const plans = [
  {
    name: "Starter",
    price: "Custom",
    text: "For early pilots and first product launches that need a clean TruOrigin experience.",
  },
  {
    name: "Growth",
    price: "Custom",
    text: "For brands expanding across multiple SKUs and categories with repeatable workflows.",
  },
  {
    name: "Scale",
    price: "Custom",
    text: "For larger programs that need stronger dashboard operations, QR rollout, and reporting.",
  },
];

export default function PricingPage() {
  return (
    <div className="page-shell">
      <PageHero
        eyebrow="Pricing"
        title="Flexible pricing for pilots, launches, and full rollout."
        description="Pricing depends on how many products, pages, and workflows you need. The structure stays simple even as your catalog grows."
      />

      <section className="container-shell page-section">
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="info-card h-full">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                {plan.name}
              </p>
              <h2 className="mt-5 text-4xl font-semibold text-[color:var(--foreground)]">
                {plan.price}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{plan.text}</p>
              <Link href="/for-brands/contact" className="btn-outline mt-8">
                Talk to Sales
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
