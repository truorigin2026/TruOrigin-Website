"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../../public/images/TruOrigin logo.png";
import { brandHeroNavItems } from "@/lib/data/brands-landing-data";

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7h8M8 4l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BrandsHeroHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const sectionIds = brandHeroNavItems.map((item) => item.href.replace("#", ""));

    const handleScroll = () => {
      setScrollY(window.scrollY);
      setVisible(window.scrollY > 120);

      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="brands-hero-topbar">
        <div className="brands-hero-topbar-inner">
          <Link href="/" className="brands-hero-topbar-logo" aria-label="TruOrigin home">
            <Image src={logo} alt="TruOrigin" className="brands-hero-topbar-logo-img" priority />
          </Link>

          <nav className="brands-hero-topbar-links" aria-label="Page sections">
            {brandHeroNavItems.map((item) => (
              <a key={item.href} href={item.href} className="brands-hero-topbar-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="brands-hero-topbar-actions">
            <Link href="/login" className="brands-hero-topbar-cta">
              Get Started
              <ArrowIcon />
            </Link>

            <button
              type="button"
              className={`brands-scroll-header-menu ${menuOpen ? "is-open" : ""}`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      <motion.header
        className={`brands-scroll-header ${visible ? "is-visible" : ""}`}
        initial={false}
        animate={{
          y: visible ? 0 : -120,
          opacity: visible ? 1 : 0,
        }}
        style={{
          backdropFilter: visible ? "blur(12px)" : "blur(0px)",
          WebkitBackdropFilter: visible ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="brands-scroll-header-inner">
          <Link href="/" className="brands-scroll-header-logo" aria-label="TruOrigin home">
            <Image src={logo} alt="TruOrigin" className="brands-scroll-header-logo-img" />
          </Link>

          <nav className="brands-scroll-header-links" aria-label="Page sections">
            {brandHeroNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`brands-scroll-header-link ${activeSection === item.href.replace("#", "") ? "is-active" : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="brands-scroll-header-actions">
            <Link href="/login" className="brands-scroll-header-cta">
              Get Started
              <ArrowIcon />
            </Link>

            <button
              type="button"
              className={`brands-scroll-header-menu ${menuOpen ? "is-open" : ""}`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="brands-hero-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.aside
              className="brands-hero-mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              {brandHeroNavItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="brands-hero-mobile-link"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + index * 0.05 }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
              <Link href="/login" className="brands-hero-mobile-cta" onClick={() => setMenuOpen(false)}>
                Get Started
              </Link>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
