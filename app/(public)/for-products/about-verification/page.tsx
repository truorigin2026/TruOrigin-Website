import productsHero from "../../../../public/images/for-products/about-verification.webp";
import howToFindImage from "../../../../public/images/for-brands/problem.png";
import howToCheckImage from "../../../../public/images/for-brands/how-it-works.png";
import howToReviewImage from "../../../../public/images/for-brands/why-it-works.png";
import Image from "next/image";
import { BrandHero } from "@/components/brands/brand-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { verificationTopics } from "@/lib/data/frontend-data";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";
import Link from "next/link";

const processImages = [howToFindImage, howToCheckImage, howToReviewImage];

export default function AboutVerificationPage() {
  return (
    <div className="saas-page">
      <BrandHero
        image={productsHero}
        headline="About Product Information"
        subheadline="Understand how TruOrigin organizes brand-supplied product details into a structured page."
      />

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
                  <span className="verification-topic-icon">
                    {topic.icon === "qr" ? "⬡" : topic.icon === "serial" ? "#" : "◈"}
                  </span>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section saas-section-alt">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Process"
            title="How the product page works"
            description="Three simple steps from scan to full product information."
            centered
          />

          <div className="verification-process-grid">
            {[
              {
                step: 1,
                title: "Scan the QR Code",
                text: "Use your phone camera to scan the QR on the product packaging.",
              },
              {
                step: 2,
                title: "Open Product Page",
                text: "Access product information, origin, certifications, and supporting documents.",
              },
              {
                step: 3,
                title: "Review Details",
                text: "Compare claims, documents, and product notes in one clean layout.",
              },
            ].map((item, index) => (
              <FadeIn key={item.step} delay={index * 0.1}>
                <article className="verification-process-card">
                  <div className="verification-process-image">
                    <Image
                      src={processImages[index]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
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
                <h3>For Consumers</h3>
                <ul>
                  <li>Instant product information access</li>
                  <li>Full origin and certification visibility</li>
                  <li>Evidence-backed claim review</li>
                  <li>Clearer product comparison</li>
                </ul>
                <Link href="/for-products/products" className="verification-benefit-link">
                  Browse Products →
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="verification-benefit-card verification-benefit-card-brand">
                <h3>For Brands</h3>
                <ul>
                  <li>Organize product records</li>
                  <li>Present customer-facing product information</li>
                  <li>Premium structured page experience</li>
                  <li>Centralized supporting document management</li>
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
