import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "TruOrigin turns scattered claims, certificates, and sourcing documents into one structured OriginCard page customers can explore in seconds.",
  path: "/for-brands/about",
});

export default function ForBrandsAboutPage() {
  return (
    <div className="about-us-page">
      <section className="about-hero-section">
        <div className="container-shell">
          <FadeIn>
            <span className="about-eyebrow">Who We Are</span>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="about-heading">About Us</h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="about-intro-text">
              Product information is often scattered across packaging, documents, labels, 
              and digital channels. TruOrigin brings it together through OriginCard, 
              helping brands organize, manage, and present structured product information 
              in one clear place.{" "}
              <span className="about-highlight">all together</span> — helping brands organise and
              present their product information through OriginCards, so customers have{" "}
              <span className="about-highlight">one clear place</span> to explore it.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="about-tagline-section">
        <div className="container-shell">
          <FadeIn>
            <span className="about-tagline-rule" aria-hidden="true" />
            <p className="about-tagline">
              Every Product Has a Story.
              <br />
              Now It Has an OriginCard.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="about-vm-section">
        <div className="container-shell about-vm-grid">
          <FadeIn className="about-vm-col">
            <h2 className="about-vm-heading">Our Vision</h2>
            <p className="about-vm-text">
              To make product information{" "}
              <span className="about-highlight">clear, accessible, and easy to explore</span> We 
              envision a future where product information is no longer scattered 
              across packaging, documents, websites, and other channels. TruOrigin 
              brings it together through OriginCard, giving customers one clear place 
              to explore it.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="about-vm-divider" aria-hidden="true" />
          </FadeIn>

          <FadeIn className="about-vm-col is-mission" delay={0.16}>
            <h2 className="about-vm-heading">Our Mission</h2>
            <p className="about-vm-text">
              To Help brands organize, manage, and present product information through OriginCard. We give brands the tools to{" "}
              <span className="about-highlight">structure product information and give customers a simpler way</span>,
              we to access and explore it.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
