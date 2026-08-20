import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logos/TruOrigin-footer.png";
import facebookIcon from "../../public/images/icons/facebook.svg";
import xIcon from "../../public/images/icons/x.svg";
import instagramIcon from "../../public/images/icons/instagram.svg";
import linkedinIcon from "../../public/images/icons/linkedin.svg";

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
  ["About Product Information", "/for-products/about-verification"],
] as const;

const legalLinks = [
  ["Terms", "/terms"],
  ["Privacy", "/privacy"],
  ["Disclaimer", "/disclaimer"],
] as const;

const socialLinks = [
  { href: "https://x.com/truoriginindia?s=11", label: "X / Twitter", icon: xIcon },
  { href: "https://www.linkedin.com/company/truorigin/", label: "LinkedIn", icon: linkedinIcon },
  {
    href: "https://www.instagram.com/truorigin.in?igsh=MWF1ZTNyYW9kcDdkeQ%3D%3D&igsi=MWF1ZTNyYW9kcDdkeQ%3D%3D&utm_source=qr",
    label: "Instagram",
    icon: instagramIcon,
  },
  { href: "https://www.facebook.com/truoriginindia", label: "Facebook", icon: facebookIcon },
];

export function SiteFooter() {
  return (
    <footer className="saas-footer">
      <div className="container-shell">
        <div className="saas-footer-top">
          <div className="saas-footer-brand">
            <Image src={logo} alt="TruOrigin" className="h-10 w-auto" />
            <p>
              Product transparency, structured claims, and verification pages that help brands and
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

          <div className="saas-footer-columns">
            <div className="saas-footer-link-group">
              <h3>For Brands</h3>
              <ul>
                {brandLinks.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="saas-footer-link-group">
              <h3>For Products</h3>
              <ul>
                {productLinks.map(([label, href]) => (
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
          <p>© 2026 TruOrigin. All rights reserved.</p>
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
