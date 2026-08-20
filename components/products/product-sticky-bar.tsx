"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VerifiedBadge } from "@/components/ui/verified-badge";

const NAV_ITEMS = [
  { href: "#overview", label: "Overview" },
  { href: "#certificates", label: "Certificates" },
  { href: "#claims-panel", label: "Claims" },
  { href: "#ingredients-panel", label: "Ingredients" },
];

export function ProductStickyBar({ name, brand }: { name: string; brand: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "-72px 0px 0px 0px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="product-sticky-bar"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="container-shell product-sticky-bar-inner">
            <div className="product-sticky-bar-identity">
              <VerifiedBadge className="product-sticky-bar-badge" />
              <div className="product-sticky-bar-text">
                <p className="product-sticky-bar-brand">{brand}</p>
                <p className="product-sticky-bar-name">{name}</p>
              </div>
            </div>
            <nav className="product-sticky-bar-nav" aria-label="Jump to section">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
