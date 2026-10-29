import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";

test.describe("mobile layout", () => {
  test.beforeEach(({}, testInfo) => {
    // The hamburger menu and the mobile filter button only render below
    // the site's 1023px breakpoint (app/globals.css) — these checks are
    // meaningless at desktop width, so skip there instead of asserting
    // against elements the layout never shows at that size.
    test.skip(testInfo.project.name === "Desktop Chrome", "Mobile-only layout, not applicable at desktop width.");
  });

  test("mobile nav drawer opens, closes, and doesn't leave the page unusable", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/home");

    const hamburger = page.getByRole("button", { name: "Open navigation" });
    await hamburger.click();

    const drawer = page.locator(".mobile-drawer.is-open");
    await expect(drawer).toBeVisible();

    const homeLink = drawer.getByRole("link", { name: "Home" });
    await expect(homeLink).toBeVisible();

    await page.getByRole("button", { name: "Close navigation" }).click();
    await expect(drawer).not.toBeVisible();

    // The rest of the page must still be clickable after closing the drawer.
    await page.locator('footer a[href="/for-brands/home"]').first().click();
    await expect(page).toHaveURL(/\/for-brands\/home$/);

    assertNoUnexpectedErrors(tracker);
  });

  test("switching audience from Products to Brands via the mobile drawer's own toggle works", async ({
    page,
    baseURL,
  }) => {
    // Mobile has no header audience toggle (desktop-only UI, covered in
    // navigation.spec.ts) — on mobile the equivalent lives inside the nav
    // drawer itself, with its own distinct accessible names ("For Brands"
    // / "For Products") so this never collides with the header's tabs.
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/home");
    await page.getByRole("button", { name: "Open navigation" }).click();

    const drawer = page.locator(".mobile-drawer.is-open");
    await drawer.getByRole("tab", { name: "For Brands" }).click();
    await expect(page).toHaveURL(/\/for-brands\/home$/);

    // Drawer must have closed itself on navigation, and the new page must
    // still be interactive.
    await expect(page.locator(".mobile-drawer.is-open")).not.toBeVisible();
    await expect(page.locator("footer.saas-footer")).toBeVisible();

    assertNoUnexpectedErrors(tracker);
  });

  test("the product filter sheet's close button stays clear of the fixed header", async ({ page, baseURL }) => {
    // Regression test for a confirmed-live bug: the filter sheet was
    // bottom-anchored up to 90vh, which on a short viewport reached high
    // enough to sit behind the fixed site header, hiding the sheet's own
    // close (X) button underneath it.
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/products");

    await page.getByRole("button", { name: "Open filters" }).click();
    const closeButton = page.getByRole("button", { name: "Close filters" });
    await expect(closeButton).toBeVisible();

    const header = page.locator("header").first();
    const headerBox = await header.boundingBox();
    const closeBox = await closeButton.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(closeBox).not.toBeNull();

    // The close button's top edge must be at or below the header's
    // bottom edge — i.e. not overlapping/hidden behind it.
    expect(closeBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);

    // And it must still be clickable (not just correctly positioned).
    await closeButton.click();
    await expect(page.locator(".filter-modal-overlay")).not.toBeVisible();

    assertNoUnexpectedErrors(tracker);
  });
});
