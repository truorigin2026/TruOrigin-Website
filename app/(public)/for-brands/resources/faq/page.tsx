import type { Metadata } from "next";
import { PageIntro } from "@/components/sections/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";
import { JsonLd } from "@/components/seo/json-ld";
import { faqPageJsonLd, pageMetadata } from "@/lib/seo";

const resourceFaqs = [
  {
    question: "What file types can I upload as evidence?",
    answer: "PDF, JPG, PNG, and WEBP files, up to 10MB each.",
  },
  {
    question: "Can I attach more than one document to a claim?",
    answer: "Yes — upload as many supporting documents as you need from the Documents section of your brand dashboard.",
  },
  {
    question: "What's the difference between a claim and a document?",
    answer:
      "A claim is the statement you're making about your product. Documents — certificates, lab reports, ingredient lists — are the supporting documentation that backs it up.",
  },
  {
    question: "Where can I see which products need more evidence?",
    answer:
      'Your brand dashboard shows each product\'s review status. Claims without supporting documentation are shown as "Limited Evidence" until documentation is added.',
  },
];

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Questions about evidence, documents, and the review process, answered.",
  path: "/for-brands/resources/faq",
});

export default function ForBrandsFaqPage() {
  return (
    <div className="saas-page">
      <JsonLd data={faqPageJsonLd(resourceFaqs)} />
      <PageIntro
        eyebrow="Resources"
        title="FAQ"
        description="Questions about evidence and documents, answered."
      />

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading eyebrow="FAQ" title="Questions about evidence and documents" centered />
          <div className="faq-grid">
            {resourceFaqs.map((faq, index) => (
              <FadeIn key={faq.question} delay={index * 0.05}>
                <div className="faq-card">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
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
