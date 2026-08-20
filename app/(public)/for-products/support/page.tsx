import { Mail } from "lucide-react";
import productsHero from "../../../../public/images/for-products/support.webp";
import { BrandHero } from "@/components/brands/brand-hero";
import { ContactForm } from "@/components/brands/contact-form";
import { ContactMethod } from "@/components/ui/contact-method";
import { FaqAccordion } from "@/components/products/faq-accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";
import { supportFaqs } from "@/lib/data/frontend-data";

export default function ForProductsSupportPage() {
  return (
    <div className="saas-page">
      <BrandHero
        image={productsHero}
        headline="How Can We Help?"
        subheadline="Find answers to common verification questions or reach out to our support team."
      />

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

      <section className="saas-section saas-section-alt">
        <div className="container-shell support-contact-grid">
          <FadeIn>
            <div className="support-contact-info">
              <h2>Still need help?</h2>
              <p>
                Our support team is here to assist with verification issues, product inquiries,
                and general questions about TruOrigin.
              </p>
              <ul>
                <li>Verification troubleshooting</li>
                <li>Counterfeit reporting</li>
                <li>Brand contact routing</li>
                <li>Platform guidance</li>
              </ul>
              <div className="contact-method-row">
                <ContactMethod icon={Mail} label="Email" value="hello@truorigin.in" href="mailto:hello@truorigin.in" />
              </div>
            </div>
          </FadeIn>
          <ContactForm
            title="Support Contact"
            description="Describe your issue and we'll get back to you as soon as possible."
            submitLabel="Send Message"
          />
        </div>
      </section>
    </div>
  );
}
