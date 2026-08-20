/**
 * QR Code Generation
 * ----------------------------------------------------------------------
 * Per dev notes: generated automatically after approval, points to
 *   https://truorigin.com/product/{serial-number}
 * No manual upload — always derived from the serial number.
 */

import QRCode from "qrcode";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://truorigin.com";

export function productVerificationUrl(serialNumber: string): string {
  return `${SITE_URL}/product/${serialNumber}`;
}

/** Returns a PNG data URL — good for previewing in the brand dashboard UI. */
export async function generateQrDataUrl(serialNumber: string): Promise<string> {
  const url = productVerificationUrl(serialNumber);
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: {
      dark: "#0f1a14",
      light: "#ffffff",
    },
  });
}

/** Returns a PNG Buffer — good for saving to disk / uploading to storage (Cloudinary, S3, etc). */
export async function generateQrBuffer(serialNumber: string): Promise<Buffer> {
  const url = productVerificationUrl(serialNumber);
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 1024,
  });
}
