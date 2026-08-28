import type { Metadata } from "next";
import { ProductsLandingPage } from "@/components/products/products-landing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "For Consumers",
  description:
    "Scan a QR code or enter a serial number to see a product's origin, certifications, claims, and supporting documents — clear, structured, and verified.",
  path: "/for-products/home",
});

export default function ForProductsHomePage() {
  return <ProductsLandingPage />;
}
