import type { Metadata } from "next";
import { FadeIn } from "@/components/motion";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "TruOrigin turns scattered claims, certificates, and sourcing documents into one structured OriginCard page — so customers can verify a product in seconds.",
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
              Every product carries a story — what it contains, how it&apos;s made, the claims it
              holds, and the certifications behind it. But that story is usually scattered across
              packaging, labels, PDFs, and websites. We built TruOrigin to bring it{" "}
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
              <span className="about-highlight">clear, accessible, and easy to explore</span> for
              everyone. We imagine a future where customers don&apos;t have to search across
              packaging, websites, and documents — where every product connects its story directly
              to the people who want to explore it.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="about-vm-divider" aria-hidden="true" />
          </FadeIn>

          <FadeIn className="about-vm-col is-mission" delay={0.16}>
            <h2 className="about-vm-heading">Our Mission</h2>
            <p className="about-vm-text">
              To help brands manage, organise, and present product information in a clearer,
              more meaningful way. Through{" "}
              <span className="about-highlight">OriginCards, QR codes, and customer interaction insights</span>,
              we give brands the tools to manage it, and customers a simpler way to explore it.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
