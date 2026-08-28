import type { Metadata } from "next";
import { BrandsLandingPage } from "@/components/brands/brands-landing-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "For Brands",
  description:
    "Give every product a verified OriginCard. Organize claims, certifications, and lab reports into a QR-powered page customers trust before they buy.",
  path: "/for-brands/home",
});

export default function ForBrandsHomePage() {
  return <BrandsLandingPage />;
}
