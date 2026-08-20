import Link from "next/link";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";

const quickGuides = [
  {
    eyebrow: "Getting Started",
    title: "Evidence checklist for your first submission",
    description:
      "Before you submit a product, gather your product photos, the specific claims you're making, and any certificates, lab reports, or ingredient lists that back them up. Submissions with documentation attached move through review faster.",
  },
  {
    eyebrow: "Best Practice",
    title: "Choosing certifications worth highlighting",
    description:
      "Not every certification carries equal weight with shoppers. Prioritize certifications issued by recognizable, third-party authorities — reviewers and customers trust named certifying bodies over generic seals.",
  },
  {
    eyebrow: "Writing Claims",
    title: "Writing claims reviewers can verify quickly",
    description:
      'Specific claims move through review faster than vague ones. "USDA Organic Certified" is easier to verify than "natural" — the more precisely a claim is worded, the easier it is to map to real evidence.',
  },
  {
    eyebrow: "Understanding Status",
    title: "What Evidence Available actually means",
    description:
      "Every claim on a live product page carries a status: Evidence Available, Limited Evidence, or No Evidence Submitted. These reflect completeness of documentation, not a judgment of whether the claim is true.",
  },
];

const resourceHubs = [
  {
    href: "/for-brands/resources/blog",
    tag: "9 Articles",
    title: "Blog",
    description: "Use-case stories, product clarity notes, and rollout thinking from the TruOrigin team.",
  },
  {
    href: "/for-brands/resources/case-studies",
    tag: "Use-Case Guides",
    title: "Case Studies",
    description: "How different categories present claims clearly, with real examples from brands on TruOrigin.",
  },
  {
    href: "/for-brands/resources/faq",
    tag: "Support",
    title: "FAQ",
    description: "Answers to common questions about evidence, documents, and the review process.",
  },
];

export default function ForBrandsResourcesPage() {
  return (
    <div className="saas-page">
      <PageHero
        eyebrow="Resources"
        title="Use-case stories, guides, and rollout thinking."
        description="Everything you need to prepare a strong submission and get the most out of your OriginCard program."
        centered
      />

      <section className="saas-section">
        <div className="container-shell">
          <div className="grid gap-6 md:grid-cols-3">
            {resourceHubs.map((hub, index) => (
              <FadeIn key={hub.href} delay={index * 0.08}>
                <Link href={hub.href} className="resource-hub-card">
                  <span className="resource-hub-tag">{hub.tag}</span>
                  <h3>{hub.title}</h3>
                  <p>{hub.description}</p>
                  <span className="resource-hub-link">
                    Explore
                    <ArrowIcon />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section saas-section-alt">
        <div className="container-shell">
          <SectionHeading eyebrow="Quick Guides" title="Short reads for a stronger submission" centered />
          <div className="guide-card-grid">
            {quickGuides.map((guide, index) => (
              <FadeIn key={guide.title} delay={index * 0.05}>
                <div className="guide-card">
                  <p className="guide-card-eyebrow">{guide.eyebrow}</p>
                  <h3>{guide.title}</h3>
                  <p>{guide.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-2 mb-16">
        <FadeIn>
          <div className="flex justify-center">
            <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
              Talk to Our Team
            </PillButton>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
