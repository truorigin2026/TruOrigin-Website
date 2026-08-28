import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms & Conditions",
  description: "The terms and conditions that govern access to and use of the TruOrigin platform, website, and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div>
      <header className="container-shell legal-page-header">
        <p className="eyebrow">Legal</p>
        <h1 className="legal-page-title">Terms &amp; Conditions</h1>
        <p className="legal-page-meta">Effective Date: 11/05/2026</p>
      </header>

      <section className="container-shell legal-prose">
        <p className="legal-prose-lead">
          Welcome to TruOrigin. These Terms and Conditions (“Terms”) govern your access to and use
          of the TruOrigin platform, website, services, dashboards, QR systems, product pages,
          analytics features, submissions, and related tools (collectively referred to as the
          “Platform”). By accessing or using TruOrigin, you agree to comply with and be bound by
          these Terms.
        </p>
        <p>If you do not agree to these Terms, you must not use the Platform.</p>

        <h2>1. Introduction</h2>
        <p>
          TruOrigin is a structured product information platform designed to help brands organize,
          present, and display product claims and supporting materials in a clear and standardized
          format. TruOrigin does not certify, guarantee, approve, or independently verify the
          truthfulness, safety, legality, effectiveness, or scientific accuracy of any product,
          claim, document, or statement submitted by brands or third parties.
        </p>
        <p>
          The Platform is intended to improve clarity and accessibility of information at the point
          of purchase. Responsibility for all submitted content remains solely with the respective
          brand, manufacturer, distributor, or submitting entity.
        </p>

        <h2>2. Definitions</h2>
        <p>For the purpose of these Terms:</p>
        <p>
          “Platform” refers to the TruOrigin website, systems, services, dashboards, QR
          integrations, product pages, analytics, APIs, and associated tools.
        </p>
        <p>
          “Brand” refers to any business, manufacturer, distributor, seller, or organization
          submitting products or claims.
        </p>
        <p>
          “User” refers to any visitor, customer, consumer, brand representative, or individual
          accessing the Platform.
        </p>
        <p>
          “Product Claim” refers to any statement, description, feature, promise,
          ingredient-related statement, sourcing statement, sustainability statement, or marketing
          communication related to a product.
        </p>
        <p>
          “Evidence” refers to any document, file, certificate, report, invoice, ingredient list,
          or supporting material submitted by a brand.
        </p>
        <p>
          “Status” refers to informational labels such as “Evidence Available,” “Limited
          Evidence,” or “No Evidence Submitted.”
        </p>

        <h2>3. Nature of the Platform</h2>
        <p>TruOrigin functions as a structured information and presentation layer.</p>
        <p>The Platform:</p>
        <ul>
          <li>Organizes product claims into a standardized format.</li>
          <li>Displays submitted supporting materials.</li>
          <li>Assigns informational evidence visibility statuses.</li>
          <li>Provides QR-linked access to product claim pages.</li>
          <li>Helps users understand available information more efficiently.</li>
        </ul>
        <p>The Platform does NOT:</p>
        <ul>
          <li>Certify products.</li>
          <li>Verify truthfulness.</li>
          <li>Conduct laboratory testing.</li>
          <li>Provide medical, legal, scientific, nutritional, or regulatory advice.</li>
          <li>Guarantee safety or effectiveness.</li>
          <li>Confirm compliance with local or international regulations.</li>
          <li>Endorse any product or brand.</li>
        </ul>
        <p>
          Users acknowledge that TruOrigin’s role is limited to structuring and presenting
          submitted information.
        </p>

        <h2>4. Acceptance of Terms</h2>
        <p>By using the Platform, you confirm that:</p>
        <ul>
          <li>You are legally capable of entering into binding agreements.</li>
          <li>You are authorized to act on behalf of your organization, where applicable.</li>
          <li>You will comply with all applicable laws and regulations.</li>
          <li>You understand the informational nature of the Platform.</li>
        </ul>
        <p>Continued use of the Platform constitutes ongoing acceptance of these Terms.</p>

        <h2>5. Brand Responsibilities</h2>
        <p>Brands using the Platform are fully responsible for:</p>
        <ul>
          <li>Accuracy of submitted claims.</li>
          <li>Authenticity of documents.</li>
          <li>Legality of product marketing.</li>
          <li>Regulatory compliance.</li>
          <li>Ownership or authorization of submitted materials.</li>
          <li>Product safety and customer communications.</li>
        </ul>
        <p>Brands must ensure that all submissions:</p>
        <ul>
          <li>Are truthful to the best of their knowledge.</li>
          <li>Do not mislead consumers.</li>
          <li>Do not infringe intellectual property rights.</li>
          <li>Do not contain false, manipulated, deceptive, or unlawful content.</li>
        </ul>
        <p>
          TruOrigin reserves the right to reject, suspend, remove, or modify submissions that
          violate these Terms.
        </p>

        <h2>6. Evidence Statuses</h2>
        <p>Statuses displayed on the Platform are informational indicators only.</p>
        <p>Examples include:</p>
        <ul>
          <li>Evidence Available</li>
          <li>Limited Evidence</li>
          <li>No Evidence Submitted</li>
        </ul>
        <p>These statuses:</p>
        <ul>
          <li>Do not represent certification.</li>
          <li>Do not confirm scientific validity.</li>
          <li>Do not indicate regulatory approval.</li>
          <li>Do not guarantee claim accuracy.</li>
          <li>Are not endorsements.</li>
        </ul>
        <p>
          Statuses are based on the presence, completeness, relevance, and organization of
          submitted materials according to TruOrigin’s internal structuring framework.
        </p>
        <p>Users must independently evaluate products before making purchasing or usage decisions.</p>

        <h2>7. User Responsibilities</h2>
        <p>Users agree to:</p>
        <ul>
          <li>Use the Platform lawfully.</li>
          <li>Not misuse or manipulate the Platform.</li>
          <li>Not attempt unauthorized access.</li>
          <li>Not copy or scrape Platform data without permission.</li>
          <li>Not use the Platform to spread misinformation.</li>
          <li>Not interfere with Platform operations.</li>
        </ul>
        <p>
          Users understand that product pages are informational interfaces and should not replace
          professional advice, medical guidance, scientific review, or legal evaluation.
        </p>

        <h2>8. Product Information Disclaimer</h2>
        <p>
          All product information displayed through TruOrigin originates from brands or associated
          entities unless explicitly stated otherwise.
        </p>
        <p>TruOrigin does not independently verify:</p>
        <ul>
          <li>Ingredient authenticity</li>
          <li>Product performance</li>
          <li>Scientific evidence</li>
          <li>Safety claims</li>
          <li>Ethical sourcing claims</li>
          <li>Sustainability claims</li>
          <li>Manufacturing standards</li>
          <li>Health benefits</li>
          <li>Regulatory approvals</li>
        </ul>
        <p>Users should independently verify critical product information where necessary.</p>

        <h2>9. QR Code Usage</h2>
        <p>Each product page may include a unique QR code generated by the Platform.</p>
        <p>Brands are responsible for:</p>
        <ul>
          <li>Proper placement of QR codes.</li>
          <li>Preventing misuse or duplication.</li>
          <li>Ensuring products linked to QR codes are accurately represented.</li>
        </ul>
        <p>TruOrigin may disable, suspend, or regenerate QR codes in cases of:</p>
        <ul>
          <li>Misuse</li>
          <li>Fraud</li>
          <li>Unauthorized duplication</li>
          <li>Policy violations</li>
          <li>Product removal</li>
          <li>Platform abuse</li>
        </ul>
        <p>QR codes remain the property of TruOrigin unless otherwise agreed in writing.</p>

        <h2>10. Analytics and Insights</h2>
        <p>The Platform may provide brands with analytics including:</p>
        <ul>
          <li>QR scans</li>
          <li>Product interactions</li>
          <li>User engagement</li>
          <li>Traffic patterns</li>
          <li>Regional usage data</li>
        </ul>
        <p>Analytics are provided for informational and business insight purposes only.</p>
        <p>TruOrigin does not guarantee:</p>
        <ul>
          <li>Increased sales</li>
          <li>Improved conversions</li>
          <li>Customer trust outcomes</li>
          <li>Commercial success</li>
          <li>Market performance</li>
        </ul>
        <p>Any business decisions based on analytics remain the sole responsibility of the brand.</p>

        <h2>11. Intellectual Property</h2>
        <p>All Platform elements including:</p>
        <ul>
          <li>Logos</li>
          <li>Branding</li>
          <li>Interface designs</li>
          <li>Layout systems</li>
          <li>Frameworks</li>
          <li>Software</li>
          <li>Content structures</li>
          <li>Visual systems</li>
          <li>Databases</li>
          <li>QR generation systems</li>
        </ul>
        <p>
          are owned by or licensed to TruOrigin and protected under applicable intellectual
          property laws.
        </p>
        <p>Users may not:</p>
        <ul>
          <li>Copy</li>
          <li>Reproduce</li>
          <li>Reverse engineer</li>
          <li>Redistribute</li>
          <li>Modify</li>
          <li>Commercially exploit</li>
        </ul>
        <p>any portion of the Platform without written permission.</p>
        <p>Brands retain ownership of their own submitted materials.</p>

        <h2>12. Content Moderation Rights</h2>
        <p>TruOrigin reserves the right to:</p>
        <ul>
          <li>Reject submissions</li>
          <li>Edit formatting</li>
          <li>Remove misleading content</li>
          <li>Suspend product pages</li>
          <li>Disable accounts</li>
          <li>Request additional documentation</li>
          <li>Update internal presentation structures</li>
        </ul>
        <p>These actions may occur without prior notice where necessary to maintain Platform integrity.</p>

        <h2>13. Prohibited Activities</h2>
        <p>Users and brands may not:</p>
        <ul>
          <li>Submit false information</li>
          <li>Upload manipulated evidence</li>
          <li>Misrepresent products</li>
          <li>Impersonate organizations</li>
          <li>Abuse analytics systems</li>
          <li>Distribute malware</li>
          <li>Attempt unauthorized access</li>
          <li>Interfere with Platform security</li>
          <li>Use the Platform for unlawful purposes</li>
        </ul>
        <p>Violations may result in immediate suspension or termination.</p>

        <h2>14. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, TruOrigin shall not be liable for:</p>
        <ul>
          <li>Product inaccuracies</li>
          <li>False claims</li>
          <li>User purchasing decisions</li>
          <li>Financial losses</li>
          <li>Health outcomes</li>
          <li>Regulatory violations by brands</li>
          <li>Indirect damages</li>
          <li>Consequential damages</li>
          <li>Business interruption</li>
          <li>Loss of profits</li>
          <li>Data loss</li>
          <li>Third-party misuse</li>
        </ul>
        <p>Use of the Platform is at the user’s own risk.</p>

        <h2>15. No Warranty</h2>
        <p>The Platform is provided “as is” and “as available.”</p>
        <p>TruOrigin makes no warranties regarding:</p>
        <ul>
          <li>Accuracy</li>
          <li>Reliability</li>
          <li>Availability</li>
          <li>Performance</li>
          <li>Completeness</li>
          <li>Security</li>
          <li>Fitness for a particular purpose</li>
        </ul>
        <p>We do not guarantee uninterrupted or error-free operation.</p>

        <h2>16. Indemnification</h2>
        <p>
          Users and brands agree to indemnify and hold harmless TruOrigin, its affiliates,
          employees, contractors, and partners from claims, damages, liabilities, losses, or
          expenses arising from:
        </p>
        <ul>
          <li>Submitted content</li>
          <li>Product claims</li>
          <li>Regulatory violations</li>
          <li>Intellectual property disputes</li>
          <li>Misuse of the Platform</li>
          <li>Breach of these Terms</li>
        </ul>

        <h2>17. Privacy</h2>
        <p>Use of the Platform is also governed by the TruOrigin Privacy Policy.</p>
        <p>
          By using the Platform, users consent to data collection, storage, and processing
          practices described therein.
        </p>

        <h2>18. Third-Party Services</h2>
        <p>
          The Platform may integrate third-party tools, hosting providers, analytics systems, or
          external services.
        </p>
        <p>TruOrigin is not responsible for:</p>
        <ul>
          <li>Third-party availability</li>
          <li>Security failures</li>
          <li>Service interruptions</li>
          <li>Third-party policies</li>
        </ul>
        <p>Users interacting with third-party services do so at their own discretion.</p>

        <h2>19. Suspension and Termination</h2>
        <p>TruOrigin may suspend or terminate access at any time for:</p>
        <ul>
          <li>Policy violations</li>
          <li>Fraudulent activity</li>
          <li>Harmful behavior</li>
          <li>Legal compliance requirements</li>
          <li>Security concerns</li>
          <li>Abuse of the Platform</li>
        </ul>
        <p>Termination may occur without prior notice.</p>

        <h2>20. Modifications to the Platform</h2>
        <p>TruOrigin reserves the right to:</p>
        <ul>
          <li>Modify features</li>
          <li>Change workflows</li>
          <li>Update structures</li>
          <li>Remove functionalities</li>
          <li>Introduce paid plans</li>
          <li>Discontinue services</li>
        </ul>
        <p>at any time.</p>

        <h2>21. Changes to Terms</h2>
        <p>These Terms may be updated periodically.</p>
        <p>
          Continued use of the Platform after changes become effective constitutes acceptance of
          revised Terms.
        </p>
        <p>Users are encouraged to review these Terms regularly.</p>

        <h2>22. Governing Law</h2>
        <p>
          These Terms shall be governed by and interpreted in accordance with applicable laws and
          regulations of the relevant operating jurisdiction.
        </p>
        <p>
          Any disputes shall be subject to the exclusive jurisdiction of the competent courts within
          that jurisdiction.
        </p>

        <h2>23. Severability</h2>
        <p>
          If any provision of these Terms is found unenforceable or invalid, the remaining
          provisions shall remain in full force and effect.
        </p>

        <h2>24. Entire Agreement</h2>
        <p>
          These Terms constitute the entire agreement between TruOrigin and users regarding use of
          the Platform and supersede prior agreements or understandings.
        </p>

        <h2>25. Contact Information</h2>
        <p>For questions regarding these Terms and Conditions, please contact:</p>
        <p>TruOrigin</p>
        <p>Email: info@truorigin.in</p>
        <p>Website: www.truorigin.in</p>

        <h2>26. Acknowledgement</h2>
        <p>
          By accessing or using TruOrigin, you acknowledge that you have read, understood, and
          agreed to these Terms and Conditions.
        </p>
      </section>
    </div>
  );
}
