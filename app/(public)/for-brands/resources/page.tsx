import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, HelpCircle } from "lucide-react";
import { PageIntro } from "@/components/sections/page-intro";
import { FadeIn } from "@/components/motion";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Resources",
  description:
    "Guides, blog posts, and answers to common questions about preparing evidence, choosing certifications, and getting the most out of your OriginCard program.",
  path: "/for-brands/resources",
});

const resourceHubs = [
  {
    href: "/for-brands/resources/blog",
    tag: "9 Articles",
    title: "Blog",
    description: "Use-case stories, product clarity notes, and rollout thinking from the TruOrigin team.",
    icon: BookOpen,
  },
  {
    href: "/for-brands/resources/faq",
    tag: "Support",
    title: "FAQ",
    description: "Answers to common questions about evidence, documents, and the review process.",
    icon: HelpCircle,
  },
];

export default function ForBrandsResourcesPage() {
  return (
    <div className="saas-page">
      <PageIntro
        eyebrow="For Brands"
        title="Resources"
        description="Everything you need to prepare a strong submission and get the most out of your OriginCard program."
      />

      <section className="saas-section">
        <div className="container-shell">
          <div className="grid gap-6 md:grid-cols-2 resource-hub-grid">
            {resourceHubs.map((hub, index) => (
              <FadeIn key={hub.href} delay={index * 0.08}>
                <Link href={hub.href} className="resource-hub-card">
                  <span className="resource-hub-icon">
                    <hub.icon size={22} strokeWidth={2} aria-hidden="true" />
                  </span>
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

      <section className="bnf-cta-band">
        <div className="bnf-cta-overlay" aria-hidden="true" />
        <div className="container-shell bnf-cta-inner">
          <FadeIn>
            <h2>Still have questions before you submit?</h2>
            <p>Our team can walk you through evidence requirements and get your first product live.</p>
            <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
              Talk to Our Team
            </PillButton>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
