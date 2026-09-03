import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/brands/contact-form";
import { ContactMethod } from "@/components/ui/contact-method";
import { FadeIn } from "@/components/motion";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description:
    "Schedule a demo or reach out to learn how TruOrigin can help present your product information. Our team replies within one business day.",
  path: "/for-brands/contact",
});

export default function ForBrandsContactPage() {
  return (
    <div className="saas-page contact-page">
      <section className="saas-section contact-page-section">
        <div className="container-shell contact-page-grid">
          <div className="contact-page-col">
            <FadeIn className="contact-hero-block">
              <p className="contact-hero-eyebrow">Contact</p>
              <h1 className="contact-hero-title">Let&apos;s get in touch</h1>
              <p className="contact-hero-description">
                Schedule a demo or reach out to learn how TruOrigin can help present your product
                information.
              </p>
              <p className="contact-hero-description">
                Once we&apos;re in touch, we&apos;ll set up your brand&apos;s sign-in account so your
                team can log in, manage your product catalog, and publish OriginCards straight from
                your dashboard.
              </p>
            </FadeIn>

            <FadeIn delay={0.1} className="contact-info-block">
              <div className="contact-info-card">
                <ul className="contact-info-list">
                  <li>Reduce counterfeiting with unique product identities</li>
                  <li>Present clear, structured product information</li>
                  <li>Streamline evidence management and QR publishing</li>
                  <li>Premium product information experience at point of purchase</li>
                </ul>
                <p className="contact-info-description">
                  Questions about onboarding, pricing, or how the review workflow fits your
                  catalog? Our team replies within one business day.
                </p>
                <div className="contact-method-row">
                  <ContactMethod icon={Mail} label="Email" value="info@truorigin.in" href="mailto:info@truorigin.in" />
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="contact-page-col">
            <ContactForm
              className="contact-form-order"
              title="Book a Demo"
              description="Fill out the form below and our team will reach out to schedule a personalized walkthrough."
              submitLabel="Submit"
            />
            <p className="contact-form-tagline">Lets work together</p>
          </div>
        </div>
      </section>
    </div>
  );
}
