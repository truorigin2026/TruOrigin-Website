import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How TruOrigin collects, uses, stores, and safeguards information when you access our website, platform, and services.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div>
      <header className="container-shell legal-page-header">
        <p className="eyebrow">Legal</p>
        <h1 className="legal-page-title">Privacy Policy</h1>
        <p className="legal-page-meta">Effective Date: 11/05/2026</p>
      </header>

      <section className="container-shell legal-prose">
        <p className="legal-prose-lead">
          Welcome to TruOrigin. We value your privacy and are committed to protecting the
          information you share with us. This Privacy Policy explains how TruOrigin collects, uses,
          stores, processes, and safeguards information when you access or use our website,
          platform, services, and related digital experiences.
        </p>
        <p>
          By using TruOrigin, you acknowledge and agree to the practices described in this Privacy
          Policy.
        </p>

        <h2>1. Introduction</h2>
        <p>
          TruOrigin is a product-information and evidence-organization platform designed to improve
          the accessibility, structure, and presentation of product-related information. This
          Privacy Policy applies to all visitors, users, businesses, partners, and individuals
          interacting with TruOrigin services, websites, product pages, and related systems.
        </p>
        <p>
          We are committed to handling information responsibly and transparently while maintaining
          reasonable safeguards to protect user and business data.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>2.1 Information You Provide Directly</h3>
        <p>We may collect information that you voluntarily provide when interacting with TruOrigin, including but not limited to:</p>
        <ul>
          <li>Full name</li>
          <li>Email address</li>
          <li>Company or business name</li>
          <li>Contact details</li>
          <li>Product-related documents</li>
          <li>Claim-related information</li>
          <li>Supporting evidence or uploaded files</li>
          <li>Messages, feedback, or support inquiries</li>
          <li>Form submissions</li>
          <li>Demo requests</li>
          <li>Partnership inquiries</li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <p>When you access or use TruOrigin services, certain information may be collected automatically, including:</p>
        <ul>
          <li>Device information</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>IP address</li>
          <li>Geographic region</li>
          <li>Website interaction data</li>
          <li>Session duration</li>
          <li>Referral sources</li>
          <li>Click activity</li>
          <li>Cookies and analytics data</li>
        </ul>

        <h3>2.3 Information From Third Parties</h3>
        <p>We may receive information from:</p>
        <ul>
          <li>Brand partners</li>
          <li>Service providers</li>
          <li>Analytics providers</li>
          <li>Ecommerce integrations</li>
          <li>Publicly available sources</li>
          <li>Existing product-information systems</li>
        </ul>

        <h2>3. How We Use Information</h2>
        <p>TruOrigin may use collected information to:</p>
        <ul>
          <li>Provide and maintain platform functionality</li>
          <li>Improve website performance and user experience</li>
          <li>Structure and present product-related information</li>
          <li>Organize submitted claims and supporting details</li>
          <li>Support evidence review workflows</li>
          <li>Generate customer-facing product-information experiences</li>
          <li>Respond to inquiries and support requests</li>
          <li>Analyze platform usage and engagement</li>
          <li>Improve security, reliability, and fraud prevention</li>
          <li>Communicate updates, announcements, and service-related notices</li>
          <li>Develop future features and integrations</li>
        </ul>

        <h2>4. Product Information &amp; Evidence Handling</h2>
        <p>Documents, claims, supporting materials, and evidence uploaded or submitted to TruOrigin may be processed to:</p>
        <ul>
          <li>Structure product information clearly</li>
          <li>Connect claims with supporting materials</li>
          <li>Improve accessibility of product-related information</li>
          <li>Generate customer-facing product-information views</li>
          <li>Support internal review workflows</li>
          <li>Improve consistency and presentation of submitted information</li>
        </ul>
        <p>
          TruOrigin does not claim ownership of customer-submitted materials, documents, product
          claims, or supporting evidence.
        </p>
        <p>
          Responsibility for submitted claims, documents, and their accuracy remains solely with
          the respective product owner, brand, manufacturer, or submitting party.
        </p>

        <h2>5. Disclaimer of Certification or Validation</h2>
        <p>
          TruOrigin provides informational and evidence-organization services designed to improve
          clarity and accessibility of product-related information.
        </p>
        <p>Unless explicitly stated otherwise, TruOrigin does not independently:</p>
        <ul>
          <li>certify products</li>
          <li>guarantee accuracy</li>
          <li>scientifically validate claims</li>
          <li>provide regulatory approval</li>
          <li>provide legal or medical certification</li>
          <li>endorse products or manufacturers</li>
        </ul>
        <p>
          Information presented through TruOrigin should not be interpreted as medical,
          scientific, legal, regulatory, or professional advice.
        </p>
        <p>Users are encouraged to independently evaluate products and consult relevant professionals where appropriate.</p>

        <h2>6. Cookies &amp; Analytics</h2>
        <p>TruOrigin may use cookies, analytics tools, and similar technologies to:</p>
        <ul>
          <li>Improve user experience</li>
          <li>Understand website performance</li>
          <li>Monitor traffic and engagement</li>
          <li>Analyze feature usage</li>
          <li>Improve platform functionality</li>
        </ul>
        <p>
          Users may manage or disable cookies through browser settings, although certain platform
          features may not function properly if cookies are disabled.
        </p>

        <h2>7. Data Sharing</h2>
        <p>We do not sell personal information.</p>
        <p>We may share information only in limited circumstances, including:</p>
        <ul>
          <li>Trusted infrastructure or service providers</li>
          <li>Hosting and analytics providers</li>
          <li>Legal authorities where required by law</li>
          <li>Business partners when authorized</li>
          <li>Security, fraud-prevention, or compliance purposes</li>
        </ul>
        <p>Any shared access is limited to operational necessity.</p>

        <h2>8. Data Storage &amp; Security</h2>
        <p>
          TruOrigin implements reasonable administrative, organizational, and technical safeguards
          intended to protect information from unauthorized access, misuse, disclosure, alteration,
          or destruction.
        </p>
        <p>
          However, no digital platform, transmission system, or storage method can guarantee
          absolute security. Users acknowledge and accept these inherent risks when using online
          services.
        </p>

        <h2>9. Data Retention</h2>
        <p>We retain information only for as long as reasonably necessary to:</p>
        <ul>
          <li>operate the platform</li>
          <li>fulfill legitimate business purposes</li>
          <li>comply with legal obligations</li>
          <li>resolve disputes</li>
          <li>maintain security and integrity</li>
        </ul>
        <p>
          Retention periods may vary depending on the nature of the information and applicable
          legal requirements.
        </p>

        <h2>10. User Rights</h2>
        <p>Depending on applicable laws and user location, individuals may have rights to:</p>
        <ul>
          <li>Access personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of eligible data</li>
          <li>Withdraw consent where applicable</li>
          <li>Request data portability</li>
          <li>Object to certain processing activities</li>
        </ul>
        <p>Requests may be submitted through the contact information provided below.</p>

        <h2>11. Third-Party Links &amp; Services</h2>
        <p>
          TruOrigin may contain links to external websites, integrations, platforms, or third-party
          services.
        </p>
        <p>
          We are not responsible for the privacy practices, policies, security, or content of
          external services. Users should review the privacy policies of third-party platforms
          independently.
        </p>

        <h2>12. Children's Privacy</h2>
        <p>
          TruOrigin services are not directed toward children under the age of 13. We do not
          knowingly collect personal information from children.
        </p>
        <p>
          If we become aware that personal information from a child has been submitted without
          appropriate consent, we may take steps to remove such information.
        </p>

        <h2>13. International Access</h2>
        <p>
          Users accessing TruOrigin from different regions acknowledge that information may be
          processed, transferred, or stored in jurisdictions where data protection laws may differ
          from those of their location.
        </p>

        <h2>14. Policy Changes</h2>
        <p>
          We may update or modify this Privacy Policy periodically to reflect operational, legal,
          or platform changes.
        </p>
        <p>
          Updated versions will be published on this page with a revised Effective Date. Continued
          use of TruOrigin after updates constitutes acceptance of the revised policy.
        </p>

        <h2>15. Contact Us</h2>
        <p>If you have any questions, concerns, or requests related to this Privacy Policy or your information, please contact us:</p>
        <p>TruOrigin</p>
        <p>Email: info@truorigin.in</p>
        <p>Website: www.truorigin.in</p>
      </section>
    </div>
  );
}
