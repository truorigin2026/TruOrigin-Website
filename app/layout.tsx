import type { Metadata } from "next";
import { Poppins, Playfair_Display, Inter, DM_Serif_Display, Sora } from "next/font/google";
import "./globals.css";
import favicon from "@/favicon.png";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeProvider } from "@/components/dashboard/theme-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-poppins",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--ff-playfair-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-inter",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--ff-dm-serif-display",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--ff-sora",
  display: "swap",
});

const fontVariables = [
  poppins.variable,
  playfairDisplay.variable,
  inter.variable,
  dmSerifDisplay.variable,
  sora.variable,
].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TruOrigin | Product Authenticity & Transparency Platform",
    template: "%s | TruOrigin",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "product transparency",
    "product authenticity verification",
    "QR code product verification",
    "OriginCard",
    "counterfeit protection",
    "product claim verification",
    "brand trust platform",
  ],
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: favicon.src,
    shortcut: favicon.src,
    apple: favicon.src,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "TruOrigin | Product Authenticity & Transparency Platform",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "TruOrigin | Product Authenticity & Transparency Platform",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <ThemeProvider>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
