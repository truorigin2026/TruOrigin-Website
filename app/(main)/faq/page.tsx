import { PageHero } from "@/components/sections/page-hero";
import { FaqAccordion } from "@/components/products/faq-accordion";

const faqGroups = [
  {
    question: "What is TruOrigin?",
    answer:
      "TruOrigin is a product information platform that helps brands publish cleaner product pages showing claims, supporting documents, and review updates in one place.",
  },
  {
    question: "Does TruOrigin certify that a claim is true?",
    answer:
      "No. TruOrigin does not certify truth. It structures what the brand submitted and what the review workflow has approved for public display.",
  },
  {
    question: "Who can use the platform?",
    answer:
      "Customers can use public product pages, while brands and admin teams use separate internal workflows for product submission, review, and approval.",
  },
  {
    question: "How do I open a connected product?",
    answer:
      "You can scan a QR code on pack or search for the product through the public product listing once it has been approved and published.",
  },
  {
    question: "What kind of products work best with TruOrigin?",
    answer:
      "It is especially useful for products with dense claim language such as skincare, supplements, food, packaged goods, wellness products, and clothing or material-based products.",
  },
  {
    question: "Why would a brand use TruOrigin?",
    answer:
      "Brands use TruOrigin to centralize product records, upload documents, send products for review, and publish clearer customer-facing pages after approval.",
  },
  {
    question: "Can brands update their product pages later?",
    answer:
      "Yes. The intended workflow supports updates to claims, files, summaries, and statuses, with changes passing back through the review process where needed.",
  },
  {
    question: "What happens if evidence is incomplete?",
    answer:
      "The public page can show that support is limited or missing, depending on the status assigned during the review process.",
  },
  {
    question: "Will products be searchable on the website?",
    answer:
      "Yes. The product listing page is designed to show approved products with search and filter options for categories and product types.",
  },
  {
    question: "How should password recovery work for brands?",
    answer:
      "The live version should use verified recovery email addresses, time-limited OTP or secure reset links, and extra checks before sensitive account changes are allowed.",
  },
  {
    question: "Can TruOrigin generate QR codes?",
    answer:
      "Yes. QR generation is part of the intended admin workflow after a product has been reviewed and approved for publishing.",
  },
  {
    question: "What documents can brands upload?",
    answer:
      "Typical uploads include ingredient lists, lab reports, certifications, sourcing proof, and other product-specific supporting files.",
  },
];

export default function FaqPage() {
  return (
    <div className="page-shell">
      <PageHero
        eyebrow="FAQ"
        title="Answers to the questions customers and brands ask most."
        description="This page collects the broader set of questions around public product pages, brand accounts, review status, and the publishing workflow."
      />

      <section className="container-shell page-section">
        <div className="mx-auto max-w-5xl">
          <FaqAccordion items={faqGroups} />
        </div>
      </section>
    </div>
  );
}
