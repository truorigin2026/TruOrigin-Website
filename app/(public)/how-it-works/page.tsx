import heroImage from "../../../public/images/hero.webp";
import { BrandHero } from "@/components/brands/brand-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { brandWorkflowSteps } from "@/lib/data/frontend-data";

export default function HowItWorksPage() {
  return (
    <div className="saas-page">
      <BrandHero
        image={heroImage}
        headline="How TruOrigin Works"
        subheadline="A streamlined workflow from product registration to consumer verification — built for clarity at every step."
        primaryCta={{ label: "Book Demo", href: "/contact" }}
      />

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="Workflow"
            title="Five steps to product transparency"
            description="From registration to verification, TruOrigin makes authenticity accessible."
            centered
          />

          <div className="workflow-timeline">
            {brandWorkflowSteps.map((step, index) => (
              <FadeIn key={step.step} delay={index * 0.08}>
                <article className="workflow-timeline-item">
                  <div className="workflow-timeline-marker">
                    <span>{step.step}</span>
                  </div>
                  <div className="workflow-timeline-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                  {index < brandWorkflowSteps.length - 1 ? (
                    <div className="workflow-timeline-connector" />
                  ) : null}
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section saas-section-alt">
        <div className="container-shell">
          <div className="how-diagram-grid">
            <FadeIn>
              <div className="how-diagram-card">
                <h3>Brand Portal</h3>
                <p>Register products, upload evidence, and manage your verification portfolio from a single dashboard.</p>
                <ul>
                  <li>Product intake &amp; image upload</li>
                  <li>Document management</li>
                  <li>Review status tracking</li>
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="how-diagram-card how-diagram-card-accent">
                <h3>TruOrigin Engine</h3>
                <p>Our platform validates data, generates unique QR codes, and publishes verification pages.</p>
                <ul>
                  <li>Evidence mapping</li>
                  <li>QR code generation</li>
                  <li>Authenticity validation</li>
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="how-diagram-card">
                <h3>Consumer Experience</h3>
                <p>Shoppers scan, verify, and access full product transparency in seconds.</p>
                <ul>
                  <li>QR &amp; serial verification</li>
                  <li>Origin &amp; certification view</li>
                  <li>Downloadable documents</li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
