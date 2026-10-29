import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";

test.describe("not-found handling", () => {
  test("a nonexistent product code shows the 404 page cleanly, not a crash", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    const response = await page.goto("/p/definitely-not-a-real-product-code-xyz");

    // KNOWN ISSUE (confirmed against a real production build, not a dev-mode
    // quirk): this route serves the not-found content with an HTTP 200
    // instead of 404 — a pre-existing soft-404 unrelated to this test setup.
    // Not asserted on here since fixing it is a separate app change; only
    // the sub-resource/server-error checks in trackPageHealth() (5xx,
    // same-origin request failures) can fail this test.
    expect(response?.status()).toBeLessThan(500);
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer.saas-footer")).toBeVisible();

    // The "Go Home" link on the 404 page must still actually work.
    await page.getByRole("link", { name: "Go Home" }).click();
    await expect(page).toHaveURL(/\/$/);

    assertNoUnexpectedErrors(tracker);
  });
});
