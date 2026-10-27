import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "font-src 'self' data:",
  "connect-src 'self' https://ruucm.github.io",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // pdf-parse (PDF->image rendering, used by lib/pdf-compress.ts) and its
  // @napi-rs/canvas dependency ship native/WASM binaries that break if
  // Next bundles them — keep them external so Vercel includes their
  // node_modules as-is in the deployed function instead.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  // Confirmed live (2026-10-27, Vercel runtime logs): serverExternalPackages
  // alone wasn't enough — @napi-rs/canvas picks its actual native binary at
  // runtime from a platform-specific optional dependency
  // (@napi-rs/canvas-linux-x64-gnu on Vercel's Node runtime), and Vercel's
  // automatic file tracing doesn't reliably follow that runtime-resolved
  // require() the way it does a plain static one, so the binary was
  // missing from the deployed function (PDF compression was silently
  // falling back to storing the original file every time). Force both the
  // glibc and musl Linux x64 variants in, since either is a realistic
  // Vercel Node runtime.
  outputFileTracingIncludes: {
    "/api/upload": [
      "./node_modules/@napi-rs/canvas-linux-x64-gnu/**/*",
      "./node_modules/@napi-rs/canvas-linux-x64-musl/**/*",
    ],
  },
  async redirects() {
    return [
      {
        source: "/for-products/about-verification",
        destination: "/for-products/how-it-works",
        permanent: true,
      },
      {
        // Documents merged into Claims & Evidence — see app/(public)/brand/claims/page.tsx.
        source: "/brand/documents",
        destination: "/brand/claims",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async headers() {
    const staticCacheHeaders = isDev
      ? [{ key: "Cache-Control", value: "no-store" }]
      : [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: staticCacheHeaders,
      },
      {
        source: "/images/:path*",
        headers: staticCacheHeaders,
      },
    ];
  },
};

export default nextConfig;
