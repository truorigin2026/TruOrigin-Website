import type { Metadata } from "next";
import { Check, Mail } from "lucide-react";
import { ContactForm } from "@/components/brands/contact-form";
import { ContactMethod } from "@/components/ui/contact-method";
import { FaqAccordion } from "@/components/products/faq-accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { supportFaqs } from "@/lib/data/frontend-data";
import { JsonLd } from "@/components/seo/json-ld";
import { faqPageJsonLd, pageMetadata } from "@/lib/seo";

const supportHelpPoints = [
  "Verification troubleshooting",
  "Counterfeit reporting",
  "Brand contact routing",
  "Platform guidance",
] as const;

export const metadata: Metadata = pageMetadata({
  title: "Support",
  description:
    "Find answers to common verification questions or reach out to the TruOrigin support team for help with a scanned product, a serial number, or a brand inquiry.",
  path: "/for-products/support",
});

export default function ForProductsSupportPage() {
  return (
    <div className="saas-page support-page">
      <JsonLd data={faqPageJsonLd(supportFaqs)} />
      <header className="container-shell legal-page-header">
        <p className="eyebrow">Support</p>
        <h1 className="legal-page-title">How Can We Help?</h1>
        <p className="legal-page-meta">
          Find answers to common verification questions or reach out to our support team.
        </p>
      </header>

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading
            eyebrow="FAQ"
            title="Common Questions"
            description="Quick answers to help you verify products and understand the TruOrigin platform."
            centered
          />
          <div className="support-faq-wrap">
            <FaqAccordion items={supportFaqs} />
          </div>
        </div>
      </section>

      <section className="saas-section support-contact-section">
        <div className="container-shell">
          <div className="support-contact-panel">
            <span className="support-contact-glow" aria-hidden="true" />
            <div className="support-contact-grid">
              <FadeIn>
                <div className="support-contact-info">
                  <p className="support-contact-eyebrow">Support</p>
                  <h2>Still Need Help?</h2>
                  <p className="support-contact-lead">
                    Our support team is here to assist with verification issues, product
                    inquiries, and general questions about TruOrigin.
                  </p>
                  <ul className="support-contact-checklist">
                    {supportHelpPoints.map((point) => (
                      <li key={point}>
                        <span className="support-contact-check">
                          <Check size={13} strokeWidth={3} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="contact-method-row">
                    <ContactMethod
                      icon={Mail}
                      label="Email"
                      value="info@truorigin.in"
                      href="mailto:info@truorigin.in"
                    />
                  </div>
                </div>
              </FadeIn>
              <ContactForm
                className="support-contact-form"
                title="Support Contact"
                description="Describe your issue and we'll get back to you as soon as possible."
                submitLabel="Send Message"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
