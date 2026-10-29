import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";
import { getFirstProductHref } from "./helpers";

test.describe("direct URL load and hard refresh", () => {
  test("loading a product detail page directly by URL (fresh context, no prior navigation) renders fully", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);
    const productHref = await getFirstProductHref(page);

    await page.goto(productHref, { waitUntil: "load" });

    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer.saas-footer")).toBeVisible();
    await expect(page.locator("h1").first()).toBeVisible();

    assertNoUnexpectedErrors(tracker);
  });

  test("hard-refreshing a product detail page keeps it fully working", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    const productHref = await getFirstProductHref(page);

    await page.goto(productHref);
    await page.reload({ waitUntil: "load" });

    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer.saas-footer")).toBeVisible();

    // Confirm the page is interactive post-refresh, not just visually
    // present — this link renders identically on every viewport.
    await page.getByRole("link", { name: /Back to Products/ }).click();
    await expect(page).toHaveURL(/\/for-products\/products$/);

    assertNoUnexpectedErrors(tracker);
  });

  test("hard-refreshing the for-brands home page keeps it fully working", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-brands/home");
    await page.reload({ waitUntil: "load" });

    await expect(page).toHaveURL(/\/for-brands\/home$/);
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer.saas-footer")).toBeVisible();

    assertNoUnexpectedErrors(tracker);
  });
});
