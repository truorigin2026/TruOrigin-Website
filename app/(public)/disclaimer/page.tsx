import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Disclaimer",
  description: "Important information about how TruOrigin content, claims, and evidence statuses should be interpreted.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <div>
      <header className="container-shell legal-page-header">
        <p className="eyebrow">Legal</p>
        <h1 className="legal-page-title">Disclaimer</h1>
        <p className="legal-page-meta">Important information about how TruOrigin content should be interpreted.</p>
      </header>

      <section className="container-shell legal-prose">
        <p className="legal-prose-lead">
          TruOrigin is an informational and evidence-organization platform designed to improve the
          clarity, accessibility, and presentation of product-related information.
        </p>
        <p>
          Information displayed on TruOrigin may include product claims, supporting details,
          ingredient information, testing summaries, certifications, documents, and related
          materials submitted by brands, manufacturers, product owners, or associated parties.
        </p>
        <p>
          Unless explicitly stated otherwise, TruOrigin does not independently certify, guarantee,
          endorse, approve, or scientifically validate product claims, testing outcomes, ingredient
          performance, safety standards, regulatory compliance, or product effectiveness.
        </p>
        <p>
          The presence of supporting information, documents, evidence summaries, or claim-related
          materials on the platform should not be interpreted as medical, scientific, legal,
          regulatory, or professional advice.
        </p>
        <p>
          TruOrigin does not manufacture, distribute, or directly sell the products presented on
          the platform unless specifically stated.
        </p>
        <p>
          Responsibility for all submitted claims, product descriptions, evidence, certifications,
          supporting materials, and their accuracy remains solely with the respective product owner,
          manufacturer, or submitting party.
        </p>
        <p>
          Users are encouraged to independently evaluate products and consult relevant professionals
          where appropriate before making purchasing, medical, nutritional, legal, or regulatory
          decisions.
        </p>
        <p>
          While TruOrigin aims to improve product-information accessibility and organization, we do
          not guarantee completeness, accuracy, reliability, availability, or suitability of any
          information displayed on the platform.
        </p>
        <p>
          By using TruOrigin, users acknowledge and agree that they access and interpret
          information at their own discretion and responsibility.
        </p>

        <h2>Contact Us</h2>
        <p>If you have any questions about this Disclaimer, please contact us:</p>
        <p>TruOrigin</p>
        <p>Email: info@truorigin.in</p>
        <p>Website: www.truorigin.in</p>
      </section>
    </div>
  );
}
