"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
import logo from "../../public/images/TruOrigin logo.png";
import facebookIcon from "../../public/images/icons/facebook.svg";
import instagramIcon from "../../public/images/icons/instagram.svg";
import linkedinIcon from "../../public/images/icons/linkedin.svg";
import xIcon from "../../public/images/icons/x.svg";
import {
  brandNavItems,
  landingNavItems,
  landingNavGroups,
  productNavItems,
  getAudienceFromPath,
  isGatewayPage,
  isHeroPage,
  type NavGroup,
} from "@/lib/data/frontend-data";

function isActive(pathname: string, href: string) {
  const cleanHref = href.split("#")[0];
  if (cleanHref === "/") return pathname === "/";
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

function ChevronIcon({ open }: { open?: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className={`nav-dropdown-chevron ${open ? "is-open" : ""}`}>
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DesktopNavDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  const groupActive = group.items.some((item) => isActive(pathname, item.href));
  const panelId = `nav-dropdown-panel-${group.label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="nav-dropdown" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        className={`desktop-nav-link nav-dropdown-trigger ${groupActive ? "is-active" : ""}`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {group.label}
        <ChevronIcon open={open} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            className="nav-dropdown-panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-dropdown-item ${isActive(pathname, item.href) ? "is-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// Point straight at the destination page rather than the bare segment
// root (which just permanentRedirects here) — one fewer transition
// stacked under the page crossfade when switching audiences.
const audienceTabs = [
  { key: "brands" as const, href: "/for-brands/home", label: "Brands", drawerLabel: "For Brands" },
  { key: "products" as const, href: "/for-products/home", label: "Products", drawerLabel: "For Products" },
];

const drawerSocialLinks = [
  { href: "https://facebook.com", label: "Facebook", icon: facebookIcon },
  { href: "https://x.com", label: "X", icon: xIcon },
  { href: "https://linkedin.com", label: "LinkedIn", icon: linkedinIcon },
  { href: "https://instagram.com", label: "Instagram", icon: instagramIcon },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const audience = getAudienceFromPath(pathname);
  const onHeroPage = isHeroPage(pathname);
  const isLandingPage = pathname === "/for-brands" || pathname.startsWith("/for-brands/");
  const isProductsLandingPage = pathname === "/for-products" || pathname.startsWith("/for-products/");
  const navItems = isLandingPage ? landingNavItems : isProductsLandingPage ? productNavItems : audience === "brands" ? brandNavItems : productNavItems;
  const logoHref = isLandingPage ? "/for-brands/home" : isProductsLandingPage ? "/for-products/home" : audience === "brands" ? "/" : "/for-products";
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useDialogA11y<HTMLDivElement>(menuOpen, () => setMenuOpen(false), hamburgerRef);

  useEffect(() => {
    setMenuOpen(false);
    setOpenMobileGroup(null);
  }, [pathname]);

  useEffect(() => {
    if (!onHeroPage) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onHeroPage]);

  if (isGatewayPage(pathname)) {
    return null;
  }

  return (
    <>
      <header
        className={[
          onHeroPage ? "hero-glass-header" : "site-static-header",
          scrolled ? "is-scrolled" : "is-top",
          menuOpen ? "menu-is-open" : "",
        ].join(" ")}
      >
        <div className="container-shell">
          <div
            className={onHeroPage ? "hero-glass-header-inner" : "site-static-header-inner"}
            style={
              menuOpen
                ? { backdropFilter: "none", WebkitBackdropFilter: "none" }
                : undefined
            }
          >
            <Link href={logoHref} className={`site-brand-link ${menuOpen ? "is-moving" : ""}`}>
              <Image src={logo} alt="TruOrigin" className="site-brand-logo" priority />
            </Link>

            {/* Ordinary navigation, not a tabs widget: each link navigates
                to a genuinely different page (for-brands vs for-products
                home), not a same-page tabpanel -- confirmed there's no
                tabpanel anywhere this controls. role="tablist"/"tab" +
                aria-selected was the textbook ARIA-tabs misuse (and,
                confirmed directly, broke WebKit's native Tab-key order:
                browsers give role="tab" elements inside a tablist their
                own arrow-key-oriented keyboard handling, which was
                skipping these links in the normal Tab sequence).
                aria-current="page" is the correct way to mark the active
                link in ordinary navigation. */}
            <nav className="header-audience-toggle" aria-label="Choose experience">
              {audienceTabs.map((tab) => (
                <Link
                  key={tab.key}
                  href={tab.href}
                  aria-current={audience === tab.key ? "page" : undefined}
                  className={`header-audience-btn ${audience === tab.key ? "is-active" : ""}`}
                >
                  {audience === tab.key ? (
                    <motion.span
                      layoutId="header-audience-thumb"
                      className="header-audience-thumb"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="header-audience-btn-label">{tab.label}</span>
                </Link>
              ))}
            </nav>

            <nav className="desktop-nav">
              {isLandingPage ? (
                <>
                  <Link
                    href="/for-brands/home"
                    className={`desktop-nav-link ${isActive(pathname, "/for-brands/home") ? "is-active" : ""}`}
                  >
                    Home
                  </Link>
                  {landingNavGroups.map((group) => (
                    <DesktopNavDropdown key={group.label} group={group} pathname={pathname} />
                  ))}
                </>
              ) : (
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`desktop-nav-link ${isActive(pathname, item.href) ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))
              )}
            </nav>

            <div className="header-right-zone">
              {isLandingPage ? (
                <>
                  <Link href="/for-brands/contact" className="mobile-header-cta header-lets-talk-btn">
                    Let&apos;s Talk
                  </Link>
                  <Link href="/for-brands/contact" className="desktop-header-cta header-lets-talk-btn">
                    Let&apos;s Talk
                  </Link>
                </>
              ) : null}

              <button
                ref={hamburgerRef}
                type="button"
                className={`stylish-hamburger-btn ${menuOpen ? "is-open" : ""}`}
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav-drawer"
                onClick={(event) => {
                  // WebKit/Safari doesn't move focus to a button on
                  // click/tap (confirmed directly: document.activeElement
                  // stayed on whatever was focused before, not this
                  // button) -- without this, useDialogA11y's "restore
                  // focus to whatever opened the dialog" has nothing real
                  // to restore to on that engine. Forcing it here makes
                  // that deterministic on every engine.
                  event.currentTarget.focus();
                  setMenuOpen((current) => !current);
                }}
              >
                <span className="hamburger-lines">
                  <span className="line line-1" />
                  <span className="line line-2" />
                  <span className="line line-3" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="mobile-drawer-overlay is-open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            {/* motion.div, not motion.aside: axe-core's aria-allowed-role
                rule doesn't permit overriding <aside>'s implicit
                "complementary" role with "dialog" -- a plain div has no
                implicit role, so the override is always valid. Framer
                Motion renders this identically either way; only the tag
                name changes. */}
            <motion.div
              id="mobile-nav-drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              tabIndex={-1}
              className="mobile-drawer is-open"
              initial={{ x: "105%" }}
              animate={{ x: 0 }}
              exit={{ x: "105%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mobile-drawer-scroll">
                {/* Same fix as the desktop header's audience toggle above
                    -- ordinary navigation between two different pages, not
                    a same-page tabs widget. */}
                <nav className="mobile-drawer-toggle" aria-label="Choose experience">
                  {audienceTabs.map((tab) => (
                    <Link
                      key={tab.key}
                      href={tab.href}
                      aria-current={audience === tab.key ? "page" : undefined}
                      className={`mobile-drawer-toggle-btn ${audience === tab.key ? "is-active" : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {audience === tab.key ? (
                        <motion.span
                          layoutId="mobile-drawer-audience-thumb"
                          className="mobile-drawer-toggle-thumb"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className="mobile-drawer-toggle-label">{tab.drawerLabel}</span>
                    </Link>
                  ))}
                </nav>

                <div className="mobile-drawer-content">
                  {isLandingPage ? (
                    <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
                      <Link
                        href="/for-brands/home"
                        className={`mobile-drawer-link ${isActive(pathname, "/for-brands/home") ? "is-active" : ""}`}
                        onClick={() => setMenuOpen(false)}
                      >
                        Home
                      </Link>
                    </motion.div>
                  ) : null}
                  {isLandingPage
                    ? landingNavGroups.map((group, index) => {
                        const open = openMobileGroup === group.label;
                        return (
                          <motion.div
                            key={group.label}
                            initial={{ opacity: 0, x: 18 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 + index * 0.05 }}
                          >
                            <button
                              type="button"
                              className={`mobile-drawer-link mobile-drawer-group-trigger ${open ? "is-open" : ""}`}
                              aria-expanded={open}
                              onClick={() => setOpenMobileGroup(open ? null : group.label)}
                            >
                              <span>{group.label}</span>
                              <ChevronIcon open={open} />
                            </button>
                            <AnimatePresence initial={false}>
                              {open ? (
                                <motion.div
                                  className="mobile-drawer-subgroup"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                >
                                  {group.items.map((item) => (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      className={`mobile-drawer-sublink ${isActive(pathname, item.href) ? "is-active" : ""}`}
                                      onClick={() => setMenuOpen(false)}
                                    >
                                      {item.label}
                                    </Link>
                                  ))}
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })
                    : navItems.map((item, index) => (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: 18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            className={`mobile-drawer-link ${isActive(pathname, item.href) ? "is-active" : ""}`}
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                </div>
              </div>

              <div className="mobile-drawer-footer">
                <Link
                  href="/for-brands/contact"
                  className="mobile-drawer-cta"
                  onClick={() => setMenuOpen(false)}
                >
                  Let&apos;s Talk
                </Link>

                <div className="mobile-drawer-socials">
                  {drawerSocialLinks.map((item) => (
                    <Link key={item.label} href={item.href} aria-label={item.label} className="mobile-drawer-social">
                      <Image src={item.icon} alt="" width={15} height={15} />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
