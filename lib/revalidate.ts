import { revalidatePath } from "next/cache";

/**
 * The public product pages have no session/cookie usage, so Next treats
 * them as static and caches them indefinitely once rendered — a brand or
 * admin change to a product's status/content otherwise never reaches them
 * until the next full redeploy. Call this after any mutation that can
 * change what a product looks like (or whether it's visible) publicly.
 *
 * The detail page is statically generated keyed by `scanCode`
 * (serialNumber, falling back to slug.toUpperCase() — see
 * generateStaticParams in app/(public)/p/[slug]/page.tsx and every product
 * card link), not by the bare slug, so that's the path that's actually
 * cached. Pass both when known; a bare slug still resolves (getProducts'
 * lookup accepts either), so revalidating it too costs nothing and covers
 * stray links that used it directly.
 */
export function revalidatePublicProduct(identifiers: { slug?: string | null; serialNumber?: string | null }) {
  revalidatePath("/for-products/home");
  revalidatePath("/for-products/products");

  const { slug, serialNumber } = identifiers;
  if (slug) {
    revalidatePath(`/p/${slug}`);
    revalidatePath(`/p/${slug.toUpperCase()}`);
  }
  if (serialNumber) revalidatePath(`/p/${serialNumber}`);
}
