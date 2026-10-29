import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "../e2e/fixtures";

/**
 * Runs against `npm run dev` with no DATABASE_URL at all (see
 * playwright.dbfree.config.ts) — these are the only pages in the app
 * confirmed not to touch the database anywhere in their render path, so
 * this is a real, meaningful check CI can run on every push/PR with zero
 * database credentials configured.
 */
const STATIC_PAGES: { path: string; heading: string | RegExp }[] = [
  { path: "/terms", heading: /Terms/i },
  { path: "/privacy", heading: /Privacy/i },
  { path: "/disclaimer", heading: /Disclaimer/i },
];

test.describe("static pages render with no database available", () => {
  for (const { path, heading } of STATIC_PAGES) {
    test(`${path} renders fully, with working chrome, no DB`, async ({ page, baseURL }) => {
      const tracker = trackPageHealth(page, baseURL);

      const response = await page.goto(path, { waitUntil: "load" });
      expect(response?.status()).toBeLessThan(500);

      await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("footer.saas-footer")).toBeVisible();

      // The page must be genuinely interactive, not just rendered text —
      // click a real nav link and confirm it actually navigates.
      await page.locator('footer a[href="/for-brands/home"]').first().click();
      await expect(page).toHaveURL(/\/for-brands\/home$/);

      assertNoUnexpectedErrors(tracker);
    });
  }
});
