import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logos/TruOrigin-footer.png";
import trademarkLogo from "../../public/images/trademark-LOGO.png";
import { socialLinks } from "@/lib/data/frontend-data";

const brandLinks = [
  ["Home", "/for-brands/home"],
  ["Company", "/for-brands/about"],
  ["Solutions", "/for-brands/how-it-works"],
  ["Resources", "/for-brands/resources"],
] as const;

const productLinks = [
  ["Home", "/for-products/home"],
  ["Products", "/for-products/products"],
  ["Support", "/for-products/support"],
  ["About Product Information", "/for-products/how-it-works"],
] as const;

const businessLinks = [
  ["Brand Sign In", "/login"],
  ["Brand Sign Up", "/for-brands/contact"],
] as const;

const legalLinks = [
  ["Terms & Conditions", "/terms"],
  ["Privacy Policy", "/privacy"],
  ["Disclaimer", "/disclaimer"],
] as const;

export function SiteFooter() {
  return (
    <footer className="saas-footer">
      <div className="container-shell">
        <div className="saas-footer-top">
          <div className="saas-footer-brand">
            <Image src={logo} alt="TruOrigin" className="h-10 w-auto" />
            <p>
              Structured product information and product pages that help brands and
              consumers meet in a clearer place.
            </p>
            <div className="saas-footer-socials">
              {socialLinks.map((item) => (
                <Link key={item.label} href={item.href} aria-label={item.label} className="saas-footer-social">
                  <Image src={item.icon} alt="" width={16} height={16} />
                </Link>
              ))}
            </div>
          </div>

          {/* h2, not h3: axe-core flagged a heading-order skip on pages
              whose own content never reaches an h2 before the footer (the
              404 page is h1-only) -- h1 straight to h3 skips a level. A
              footer column heading going from any level back up to h2 is
              never a skip, regardless of what precedes it on the page, and
              these columns are genuinely their own top-level sections
              within the footer landmark, not sub-sections of something
              else on the page. */}
          <div className="saas-footer-columns">
            <div className="saas-footer-link-group">
              <h2>For Brands</h2>
              <ul>
                {brandLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="saas-footer-link-group">
              <h2>For Products</h2>
              <ul>
                {productLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="saas-footer-link-group">
              <h2>Business</h2>
              <ul>
                {businessLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        <div className="saas-footer-wordmark-wrap" aria-hidden="true">
          <p className="saas-footer-wordmark">TruOrigin</p>
        </div>

        <div className="saas-footer-bottom">
          <p className="saas-footer-credit">
            © 2026 TruOrigin. All rights reserved.
            <Link
              href="https://github.com/darklord8515"
              target="_blank"
              rel="noreferrer"
              className="saas-footer-credit-link"
              aria-label="Designed by Mohamed Fayez — opens GitHub profile"
            >
              Designed by
              <Image src={trademarkLogo} alt="" className="saas-footer-credit-logo" />
            </Link>
          </p>
          <nav className="saas-footer-legal" aria-label="Legal links">
            {legalLinks.map(([label, href]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
