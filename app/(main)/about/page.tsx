import { Mail } from "lucide-react";
import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { AssetImage } from "@/components/brands/asset-image";
import { ContactMethod } from "@/components/ui/contact-method";
import { PillButton, ArrowIcon } from "@/components/ui/pill-button";
import { FadeIn } from "@/components/motion";
import { trustStats } from "@/lib/data/brands-landing-data";
import truoriginMockup from "../../../public/images/truorgin mockup.png";
import truoriginOneLine from "../../../public/images/Truorigin-in-one-line.png";
import logoPrint from "../../../public/images/print.png";
import logoOrigin from "../../../public/images/origin.png";
import logoTru from "../../../public/images/tru.png";
import skincareImage from "../../../public/images/for-brands/industries/skincare.jpg";
import foodImage from "../../../public/images/for-brands/industries/food.jpg";
import supplementsImage from "../../../public/images/for-brands/industries/supplements.jpg";
import cosmeticsImage from "../../../public/images/for-brands/brands.png";
import wellnessImage from "../../../public/images/for-brands/industries/food.jpg";

export default function AboutPage() {
  return (
    <div className="section-spacing">
      <PageHero
        eyebrow="About TruOrigin"
        title="Product Information, Organized Clearly"
        description="TruOrigin is a product-information platform designed to make brand-supplied product details easier to read at the point of purchase."
        imageSrc={truoriginMockup.src}
        centered
      />

      <section className="container-shell mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[32px] p-8 md:p-10">
          <h2 className="display-font text-4xl">What TruOrigin Does</h2>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            TruOrigin helps brands organize product claims and supporting documents into a clear,
            structured interface that customers can interpret quickly and confidently. Modern
            products often contain technical language, complex claims, and unclear supporting
            information. TruOrigin was created to simplify that experience.
          </p>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            Each product follows a consistent structure where customers can view claims alongside
            support statuses such as Supporting Evidence Provided, Structured Product Information,
            and Unverified Information. This makes it easier to compare products and understand
            what information has been provided.
          </p>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            Instead of adding more marketing, TruOrigin focuses on better information clarity.
          </p>
        </div>

        <div className="glass-panel rounded-[32px] p-6 md:p-8">
          <Image
            src={truoriginMockup}
            alt="TruOrigin platform mockup"
            className="w-full h-auto rounded-[24px]"
          />
        </div>
      </section>

      <section className="container-shell mt-12">
        <SectionHeading
          eyebrow="The Bigger Picture"
          title="The transparency gap, by the numbers"
          description="Product information confusion isn't a niche problem — it shapes how people shop and how much they trust what they buy."
          centered
        />
        <div className="bnf-stats-grid">
          {trustStats.map((stat, index) => (
            <FadeIn key={stat.label} delay={index * 0.06}>
              <div className="bnf-stat-card">
                <div className="bnf-stat-icon">
                  <AssetImage src={stat.icon} alt="" width={24} height={24} />
                </div>
                <p className="bnf-stat-value">{stat.value}</p>
                <p className="bnf-stat-label">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container-shell mt-8 grid gap-6 md:grid-cols-3">
        <article className="glass-panel rounded-[28px] p-7">
          <h2 className="display-font text-2xl">What TruOrigin Is Not</h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            TruOrigin is not a certification authority, testing laboratory, or verification
            agency. We do not independently verify truth, certify claims, or guarantee product
            effectiveness, safety, legality, or scientific accuracy.
          </p>
        </article>
        <article className="glass-panel rounded-[28px] p-7">
          <h2 className="display-font text-2xl">Why It Matters</h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            Customers face increasing confusion while making purchasing decisions. TruOrigin helps
            reduce hesitation by making product information more visible, organized, and easier to
            interpret.
          </p>
        </article>
        <article className="glass-panel rounded-[28px] p-7">
          <h2 className="display-font text-2xl">The Goal</h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            Faster understanding, reduced doubt, better decision confidence, and more transparent
            product communication.
          </p>
        </article>
      </section>

      <section className="container-shell mt-12">
        <div className="section-intro centered">
          <p className="eyebrow">Why It Matters</p>
          <h2 className="display-font mt-5 text-4xl md:text-5xl">
            Built for categories with high information complexity
          </h2>
        </div>
        <div className="about-portrait-grid mt-10">
          {[skincareImage, foodImage, supplementsImage, cosmeticsImage, wellnessImage].map(
            (image, index) => (
              <div key={index} className="about-portrait-card">
                <Image src={image} alt="TruOrigin category example" className="w-full h-auto" />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="container-shell mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[32px] p-8 md:p-10">
          <h2 className="display-font text-4xl">TruOrigin Logo</h2>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            TruOrigin represents clear product information, structured claims, and connected
            product identity. The "Tru" element symbolizes clarity, structure, and straightforward
            information presentation.
          </p>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            The fingerprint icon represents product identity, uniqueness, traceability, and the
            connection between claims and supporting information. The "Origin" element represents
            source, background, and product-related information including ingredients, claims,
            testing details, and supporting documentation.
          </p>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            The green palette symbolizes clarity, growth, reliability, and modern product
            ecosystems.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Tru", image: logoTru },
            { title: "Print", image: logoPrint },
            { title: "Origin", image: logoOrigin },
          ].map((item) => (
            <div key={item.title} className="glass-panel rounded-[28px] p-6 text-center">
              <Image
                src={item.image}
                alt={`${item.title} logo element`}
                className="mx-auto h-16 w-auto"
              />
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell mt-12">
        <div className="glass-panel rounded-[32px] p-8 md:p-10">
          <h2 className="display-font text-4xl">Our Vision</h2>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            We believe clarity should become a standard part of modern products. As product claims
            continue to increase across industries, customers need interfaces that help them
            understand information quickly and consistently.
          </p>
          <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
            TruOrigin aims to become the structured clarity layer between brands and customers,
            helping information become easier to access, compare, and interpret.
          </p>
        </div>
      </section>

      <section className="container-shell mt-12">
        <Image src={truoriginOneLine} alt="TruOrigin in one line" className="about-strip-image" />
      </section>

      <section className="container-shell mt-12 pb-16">
        <div className="glass-panel rounded-[32px] p-8 md:p-10 text-center">
          <p className="eyebrow">Get in Touch</p>
          <h2 className="display-font mt-5 text-3xl md:text-4xl">
            Questions about TruOrigin? We're glad to help.
          </h2>
          <p className="mt-4 text-base leading-8 text-[color:var(--muted)] max-w-2xl mx-auto">
            Whether you're a customer trying to understand a product page or a brand exploring the
            platform, reach out and our team will get back to you.
          </p>
          <div className="mt-6 flex justify-center">
            <ContactMethod icon={Mail} label="Email" value="hello@truorigin.in" href="mailto:hello@truorigin.in" />
          </div>
          <div className="section-cta-row">
            <PillButton href="/contact" variant="primary" icon={<ArrowIcon />}>
              Contact Us
            </PillButton>
          </div>
        </div>
      </section>
    </div>
  );
}
