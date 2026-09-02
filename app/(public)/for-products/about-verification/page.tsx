import type { Metadata } from "next";
import { Check, ShieldCheck } from "lucide-react";
import verificationStep1 from "../../../../public/images/for-brands/how-it-works/verification-step1.webp";
import verificationStep2 from "../../../../public/images/for-brands/how-it-works/verification-step2.webp";
import verificationStep3 from "../../../../public/images/for-brands/how-it-works/verification-step3.webp";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { verificationTopics } from "@/lib/data/frontend-data";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

const processSteps = [
  {
    step: 1,
    title: "Spot the OriginCard",
    text: "Every verified product carries a small OriginCard QR code on its packaging or label, easy to find before you buy.",
    image: verificationStep1,
  },
  {
    step: 2,
    title: "Scan With Any Phone",
    text: "No app to download. Point a camera at the code and the product's verification page opens instantly.",
    image: verificationStep2,
  },
  {
    step: 3,
    title: "Review Every Claim",
    text: "Origin, certifications, and test results appear clearly labeled, so you know exactly what's backed by evidence.",
    image: verificationStep3,
  },
] as const;

const consumerBenefits = [
  "Explore product details in one place",
  "Understand claims, ingredients, documents & specifications",
  "Discover information before making a choice",
];

const brandBenefits = [
  "Organize product information",
  "Manage information through OriginCard",
  "Present structured product information",
  "Simplify product information management",
];

export const metadata: Metadata = pageMetadata({
  title: "About Product Information",
  description:
    "Understand how TruOrigin organizes brand-supplied product details into a structured page — scan a QR code or enter a serial number to see origin, certifications, and evidence.",
  path: "/for-products/about-verification",
});

export default function AboutVerificationPage() {
  return (
    <div className="saas-page about-verification-page">
      <header className="container-shell legal-page-header">
        <p className="eyebrow">About</p>
        <h1 className="legal-page-title">About Product Information</h1>
        <p className="legal-page-meta">
          Understand how TruOrigin organizes brand-supplied product details into a structured page.
        </p>
      </header>

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Platform"
            title="What is TruOrigin?"
            description="A product information platform connecting brands with consumers through structured pages."
            centered
          />

          <div className="verification-topics-grid">
            {verificationTopics.map((topic, index) => (
              <FadeIn key={topic.title} delay={index * 0.06}>
                <article className="verification-topic-card">
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section verification-process-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Process"
            title="How the Product Page Works"
            description="Three simple steps from scan to full product information."
            centered
          />

          <div className="verification-process-grid">
            {processSteps.map((item, index) => (
              <FadeIn key={item.step} delay={index * 0.1}>
                <article className="verification-process-card">
                  {item.image ? (
                    <div className="verification-process-image">
                      <Image src={item.image} alt={item.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="verification-process-image verification-process-summary">
                      <span className="verification-process-summary-icon">
                        <ShieldCheck size={26} strokeWidth={2} aria-hidden="true" />
                      </span>
                      <div className="verification-process-summary-chips">
                        {["Origin", "Certifications", "Test Reports", "Evidence"].map((chip) => (
                          <span key={chip}>{chip}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <span className="verification-process-step">{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section">
        <div className="container-shell">
          <div className="verification-benefits-grid">
            <FadeIn>
              <div className="verification-benefit-card">
                <h3>Access product information instantly</h3>
                <ul className="verification-benefit-list">
                  {consumerBenefits.map((item) => (
                    <li key={item}>
                      <span className="verification-benefit-check">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/for-products/products" className="verification-benefit-link">
                  Browse Products →
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="verification-benefit-card verification-benefit-card-brand">
                <h3>For Brands</h3>
                <ul className="verification-benefit-list">
                  {brandBenefits.map((item) => (
                    <li key={item}>
                      <span className="verification-benefit-check verification-benefit-check-brand">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <PillButton href="/for-brands/contact" variant="primary" icon={<ArrowIcon />}>
                  Book Demo
                </PillButton>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
