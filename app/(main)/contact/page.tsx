import { Mail } from "lucide-react";
import heroImage from "../../../public/images/hero.webp";
import { BrandHero } from "@/components/brands/brand-hero";
import { ContactForm } from "@/components/brands/contact-form";
import { ContactMethod } from "@/components/ui/contact-method";
import { FadeIn } from "@/components/motion";

export default function ContactPage() {
  return (
    <div className="saas-page">
      <BrandHero
        image={heroImage}
        headline="Let's Build Transparency Together"
        subheadline="Schedule a demo or reach out to learn how TruOrigin can transform your product verification experience."
      />

      <section className="saas-section">
        <div className="container-shell contact-page-grid">
          <FadeIn>
            <div className="contact-info-card">
              <h2>Contact Us</h2>
              <p className="contact-info-description">
                Whether you have questions about our services, need support, or want to share
                feedback, our dedicated team is here to assist you every step of the way.
              </p>
              <ul className="contact-info-list">
                <li>Reduce counterfeiting with unique product identities</li>
                <li>Build consumer trust through verified transparency</li>
                <li>Streamline evidence management and QR publishing</li>
                <li>Premium verification experience at point of purchase</li>
              </ul>
              <div className="contact-method-row">
                <ContactMethod icon={Mail} label="Email" value="hello@truorigin.in" href="mailto:hello@truorigin.in" />
              </div>
            </div>
          </FadeIn>

          <ContactForm
            title="Book a Demo"
            description="Fill out the form below and our team will reach out to schedule a personalized walkthrough."
            submitLabel="Submit"
          />
        </div>
      </section>
    </div>
  );
}
