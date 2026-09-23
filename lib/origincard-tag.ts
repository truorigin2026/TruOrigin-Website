/**
 * OriginCard Tag Compositing
 * ----------------------------------------------------------------------
 * Composites a product's QR code and serial number onto the printable
 * TruOrigin tag template (public/images/for-brands/tag/truorigin-tag-updated.png).
 *
 * The template is opaque throughout (no transparent QR cutout, unlike the
 * original tag design) — the QR and serial text are painted on top of it,
 * in that order. Both regions were measured directly from the source PNG's
 * pixel data (2399x2298) and confirmed unchanged between the original and
 * updated template (identical outside the old cutout's bounds).
 */

import path from "node:path";
import { readFileSync } from "node:fs";
import sharp from "sharp";
import { generateQrBuffer } from "@/lib/qr";

const TEMPLATE_PATH = path.join(process.cwd(), "public/images/for-brands/tag/truorigin-tag-updated.png");
const FONT_PATH = path.join(process.cwd(), "public/fonts/Montserrat-Variable.ttf");

// sharp's SVG rendering (librsvg) can't reach Google Fonts/web fonts — the
// font has to be embedded directly in the SVG for it to render reliably in
// any deployment environment. Read once at module load, not per request.
const MONTSERRAT_BASE64 = readFileSync(FONT_PATH).toString("base64");

// Measured from the template's original transparent cutout (alpha === 0
// region) — the updated template is solid there now, but pixel-identical
// to the original everywhere else, so this position is still correct.
const QR_REGION = { left: 798, top: 669, size: 794 };

// Measured from the template's opaque white strip (starts at y=1766, card
// spans roughly x:105-2296). Text is centered within a safe inset box that
// avoids the bottom rounded corners.
const SERIAL_STRIP = { left: 300, top: 1800, width: 1799, height: 320 };

function serialTextSvg(serialNumber: string, region: typeof SERIAL_STRIP) {
  const { width, height } = region;
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face {
            font-family: "Montserrat";
            src: url(data:font/ttf;base64,${MONTSERRAT_BASE64}) format("truetype");
            font-weight: 400 900;
          }
        </style>
      </defs>
      <text
        x="50%" y="38%"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Montserrat"
        font-size="34" font-weight="700" letter-spacing="8"
        fill="#1a7a44"
      >SERIAL NO.</text>
      <text
        x="50%" y="78%"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Montserrat"
        font-size="76" font-weight="800" letter-spacing="4"
        fill="#0f1a14"
      >${escapeXml(serialNumber)}</text>
    </svg>
  `);
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Returns a print-ready PNG buffer: QR + serial number composited onto the OriginCard tag template. */
export async function generateOriginCardTagBuffer(serialNumber: string): Promise<Buffer> {
  const template = sharp(TEMPLATE_PATH);
  const meta = await template.metadata();
  const width = meta.width ?? 2399;
  const height = meta.height ?? 2298;

  const [templateBuffer, qrBuffer] = await Promise.all([template.toBuffer(), generateQrBuffer(serialNumber)]);

  const qrResized = await sharp(qrBuffer)
    .resize(QR_REGION.size, QR_REGION.size)
    .extend({
      top: 24,
      bottom: 24,
      left: 24,
      right: 24,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .resize(QR_REGION.size, QR_REGION.size)
    .toBuffer();

  const textSvg = serialTextSvg(serialNumber, SERIAL_STRIP);

  return sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } },
  })
    .composite([
      { input: templateBuffer, left: 0, top: 0 },
      { input: qrResized, left: QR_REGION.left, top: QR_REGION.top },
      { input: textSvg, left: SERIAL_STRIP.left, top: SERIAL_STRIP.top },
    ])
    .png()
    .toBuffer();
}
