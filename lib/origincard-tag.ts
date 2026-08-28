/**
 * OriginCard Tag Compositing
 * ----------------------------------------------------------------------
 * Composites a product's QR code and serial number onto the printable
 * TruOrigin tag template (public/images/for-brands/tag/truorigin-tag.png).
 *
 * The template has a transparent square cut out where the QR belongs, and
 * an opaque white strip at the bottom for the serial number — both regions
 * were measured directly from the source PNG's pixel data (2399x2298).
 */

import path from "node:path";
import sharp from "sharp";
import { generateQrBuffer } from "@/lib/qr";

const TEMPLATE_PATH = path.join(process.cwd(), "public/images/for-brands/tag/truorigin-tag.png");

// Measured from the template's transparent cutout (alpha === 0 region).
const QR_REGION = { left: 798, top: 669, size: 794 };

// Measured from the template's opaque white strip (starts at y=1766, card
// spans roughly x:105-2296). Text is centered within a safe inset box that
// avoids the bottom rounded corners.
const SERIAL_STRIP = { left: 300, top: 1800, width: 1799, height: 320 };

function serialTextSvg(serialNumber: string, region: typeof SERIAL_STRIP) {
  const { width, height } = region;
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <text
        x="50%" y="38%"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="34" font-weight="700" letter-spacing="8"
        fill="#1a7a44"
      >SERIAL NO.</text>
      <text
        x="50%" y="78%"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
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
      { input: qrResized, left: QR_REGION.left, top: QR_REGION.top },
      { input: templateBuffer, left: 0, top: 0 },
      { input: textSvg, left: SERIAL_STRIP.left, top: SERIAL_STRIP.top },
    ])
    .png()
    .toBuffer();
}
