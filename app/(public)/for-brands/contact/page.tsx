import { Mail } from "lucide-react";
import heroImage from "../../../../public/images/hero.webp";
import { BrandHero } from "@/components/brands/brand-hero";
import { ContactForm } from "@/components/brands/contact-form";
import { ContactMethod } from "@/components/ui/contact-method";
import { SectionHeading } from "@/components/ui/section-heading";
import { FadeIn } from "@/components/motion";

const nextSteps = [
  {
    title: "We reply within 1 business day",
    description: "Our team reviews your message and responds with next steps or answers to your questions.",
  },
  {
    title: "Book a walkthrough call",
    description: "See the brand dashboard, product submission flow, and admin review process live.",
  },
  {
    title: "Start onboarding your first products",
    description: "Get your account set up and submit your first product for review.",
  },
];

const contactFaqs = [
  {
    question: "Do I need to sign up before contacting you?",
    answer: "No — reach out first if you have questions, or sign up directly and explore the brand dashboard yourself.",
  },
  {
    question: "Is there a cost to submit a product for review?",
    answer: "Pricing depends on your catalog size and workflow needs — our team will walk you through options during your call.",
  },
  {
    question: "How many products can I submit at once?",
    answer: "There's no limit — submit one product to start, or upload your full catalog at once.",
  },
];

export default function ForBrandsContactPage() {
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
                Questions about onboarding, pricing, or how the verification workflow fits your
                catalog? Our team replies within one business day.
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

      <section className="saas-section saas-section-alt">
        <div className="container-shell">
          <SectionHeading eyebrow="What Happens Next" title="From message to your first product live" centered />
          <div className="mini-timeline">
            {nextSteps.map((step, index) => (
              <FadeIn key={step.title} delay={index * 0.08}>
                <div className="mini-timeline-item">
                  <span className="mini-timeline-index">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="saas-section">
        <div className="container-shell">
          <SectionHeading eyebrow="FAQ" title="Quick questions before you reach out" centered />
          <div className="faq-grid">
            {contactFaqs.map((faq, index) => (
              <FadeIn key={faq.question} delay={index * 0.05}>
                <div className="faq-card">
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
