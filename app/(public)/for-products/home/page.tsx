import type { Metadata } from "next";
import { ProductsLandingPage } from "@/components/products/products-landing-page";
import { pageMetadata } from "@/lib/seo";

// No cookies/searchParams here, so Next treats this page as static and
// caches it indefinitely by default — product mutations call
// revalidatePublicProduct() for an immediate refresh, this is just a
// self-healing fallback in case a path misses that.
export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "For Consumers",
  description:
    "Scan a QR code or enter a serial number to see a product's origin, certifications, claims, and supporting documents — clear and structured.",
  path: "/for-products/home",
});

export default function ForProductsHomePage() {
  return <ProductsLandingPage />;
}
