import type { Page } from "@playwright/test";
import { test } from "./fixtures";

const PRODUCT_CARD_SELECTOR = 'a.product-card[href^="/p/"]';

/**
 * Finds a real, currently-published product on the live catalog and
 * returns its detail-page href. Tests deliberately don't hardcode a
 * product code — the catalog is real production data that can change —
 * and skip (rather than fail) if the catalog is ever empty, since that's
 * a data-availability condition, not a regression in the app.
 */
export async function getFirstProductHref(page: Page): Promise<string> {
  await page.goto("/for-products/products");
  const cards = page.locator(PRODUCT_CARD_SELECTOR);

  if ((await cards.count()) === 0) {
    test.skip(true, "No live products in the catalog to drive this test against.");
  }

  const href = await cards.first().getAttribute("href");
  if (!href) {
    test.skip(true, "First product card has no href.");
  }

  return href as string;
}
