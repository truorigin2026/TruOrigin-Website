import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssetImage } from "@/components/brands/asset-image";
import { FadeIn } from "@/components/motion";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";
import { coreValues } from "@/lib/data/brands-landing-data";
import truoriginMockup from "../../../../public/images/truorgin mockup.png";

const methodology = [
  {
    variant: "methodology-card-available",
    title: "Evidence Available",
    description:
      "The claim has supporting documentation on file — a certificate, lab report, ingredient list, or sourcing proof reviewed by our team.",
  },
  {
    variant: "methodology-card-limited",
    title: "Limited Evidence",
    description:
      "The claim is on record, but the supporting documentation is partial or still being reviewed. Customers see this distinction clearly.",
  },
  {
    variant: "methodology-card-none",
    title: "No Evidence Submitted",
    description:
      "The claim has been made but no supporting document has been attached yet. Nothing is hidden — the status is shown as-is.",
  },
];

export default function ForBrandsAboutPage() {
  return (
    <div className="saas-page">
      <PageHero
        eyebrow="About TruOrigin"
        title="Clarity Behind Every Product Claim"
        description="TruOrigin is a product-layer platform designed to make product claims easier to understand at the point of purchase."
        imageSrc={truoriginMockup.src}
        centered
      />

      <section className="saas-section">
        <div className="container-shell grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[32px] p-8 md:p-10">
            <h2 className="display-font text-4xl">What TruOrigin Does</h2>
            <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
              TruOrigin helps brands organize claims and supporting documents into a clear,
              structured interface that customers can interpret quickly and confidently. Modern
              products often contain technical language, complex claims, and unclear supporting
              information. TruOrigin was created to simplify that experience.
            </p>
            <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
              Every product gets a unique serial number and QR code once approved. Scanning it — or
              typing the serial number in manually — opens a public page showing exactly what the
              brand submitted and what our review team confirmed, with nothing added and nothing
              hidden.
            </p>
            <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
              Instead of adding more marketing, TruOrigin focuses on better information clarity.
            </p>
          </div>

          <div className="glass-panel rounded-[32px] p-6 md:p-8">
            <Image src={truoriginMockup} alt="TruOrigin platform mockup" className="w-full h-auto rounded-[24px]" />
          </div>
        </div>
      </section>

      <section className="saas-section saas-section-alt">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Methodology"
            title="How we label evidence"
            description="Every claim on TruOrigin carries one of three statuses. It's a completeness label, not a verdict on whether a claim is true."
            centered
          />
          <div className="methodology-grid">
            {methodology.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.08}>
                <div className={`methodology-card ${item.variant}`}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading eyebrow="What We Value" title="The principles behind the platform" centered />
          <div className="value-grid">
            {coreValues.map((value, index) => (
              <FadeIn key={value.title} delay={index * 0.06}>
                <div className="value-card">
                  <div className="value-card-icon">
                    <AssetImage src={value.icon} alt="" width={24} height={24} />
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="section-cta-row">
            <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
              Talk to Our Team
            </PillButton>
          </div>
        </div>
      </section>
    </div>
  );
}
