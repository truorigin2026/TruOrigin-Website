/**
 * PDF Compression
 * ----------------------------------------------------------------------
 * There's no Ghostscript-class binary available in Vercel's serverless
 * Node runtime, so real PDF compression here means: render each page to
 * an image, recompress that image (reusing the same sharp pipeline as
 * lib/blob.ts's image uploads), and rebuild a new PDF from the
 * recompressed pages. This is lossy — any selectable/searchable text in
 * the source PDF is flattened into a flat image — which is an accepted
 * trade-off for this app's use case (scanned certificates/lab reports
 * are themselves photos of paper, not text-native PDFs).
 *
 * Any failure anywhere in this pipeline (corrupt PDF, render timeout,
 * unexpected structure) must never block an upload — compressPdf()
 * always resolves to null on failure, and the caller falls back to
 * storing the original file untouched.
 */
// Must import before "pdf-parse": pdf-parse loads pdfjs-dist, which touches
// browser-only globals (e.g. DOMMatrix) as soon as it's evaluated. This
// supplies the Node-compatible canvas implementation (@napi-rs/canvas)
// pdf-parse needs to render pages outside a browser.
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

// Render resolution relative to the PDF's own page size (scale 1 == 72dpi,
// matching the PDF unit system) -- high enough that stamps/signatures/small
// print stay legible after the JPEG re-encode below.
const RENDER_SCALE = 2;
const MAX_PAGE_DIMENSION = 2000;
const JPEG_QUALITY = 70;

// Certificates/lab reports are realistically a handful of pages; this is a
// safety cap against an unexpectedly huge PDF eating the serverless
// function's time/memory budget -- past this, skip compression entirely
// and keep the original rather than risk the upload itself failing.
const MAX_PAGES_TO_COMPRESS = 40;

export async function compressPdf(original: Buffer): Promise<Buffer | null> {
  let parser: PDFParse | null = null;

  try {
    parser = new PDFParse({ data: new Uint8Array(original), CanvasFactory });

    const info = await parser.getInfo({ parsePageInfo: true });
    if (!info.total || info.total > MAX_PAGES_TO_COMPRESS) {
      return null;
    }

    const screenshots = await parser.getScreenshot({
      scale: RENDER_SCALE,
      imageBuffer: true,
      imageDataUrl: false,
    });

    const pdfDoc = await PDFDocument.create();

    for (const page of screenshots.pages) {
      const pagePointWidth = page.width / RENDER_SCALE;
      const pagePointHeight = page.height / RENDER_SCALE;

      const jpeg = await sharp(Buffer.from(page.data))
        .resize({ width: MAX_PAGE_DIMENSION, height: MAX_PAGE_DIMENSION, fit: "inside", withoutEnlargement: true })
        .flatten({ background: "#ffffff" }) // PDF pages have no alpha channel; flatten before JPEG encode
        .jpeg({ quality: JPEG_QUALITY })
        .toBuffer();

      const embedded = await pdfDoc.embedJpg(jpeg);
      const pdfPage = pdfDoc.addPage([pagePointWidth, pagePointHeight]);
      pdfPage.drawImage(embedded, { x: 0, y: 0, width: pagePointWidth, height: pagePointHeight });
    }

    const compressed = Buffer.from(await pdfDoc.save());

    // Never ship a "compressed" file that's actually bigger -- some PDFs
    // (already-optimized, mostly-vector/text) won't shrink from this.
    if (compressed.length >= original.length) {
      return null;
    }

    return compressed;
  } catch (error) {
    console.error("[compressPdf]", error);
    return null;
  } finally {
    await parser?.destroy().catch(() => {});
  }
}
