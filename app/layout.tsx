import type { Metadata } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "./globals.css";
import favicon from "@/favicon.png";
import logo from "../public/images/TruOrigin logo.png";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeProvider } from "@/components/dashboard/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://truorigin.com"),
  title: "TruOrigin | Product Authenticity & Transparency Platform",
  description:
    "Build trust through organized product information. Present origin details, certifications, claims, and supporting evidence through QR-powered product pages.",
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
    apple: favicon.src,
  },
  openGraph: {
    title: "TruOrigin",
    description:
      "Structured product information pages, claim evidence statuses, and QR-powered customer clarity.",
    images: [{ url: logo.src }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
