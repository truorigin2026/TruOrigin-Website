import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";
import { getFirstProductHref } from "./helpers";

/**
 * Keyboard-interaction regression tests for Phase C.3 review item 3:
 * product detail tabs (a genuine same-page tabs widget — arrow-key
 * navigation per ARIA Authoring Practices) and the two mobile-only
 * horizontal carousels (keyboard-reachable scrollable regions).
 */

test.describe("product detail tabs: keyboard navigation", () => {
  test("ArrowRight/ArrowLeft/Home/End move focus and switch panels, matching aria-selected", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);
    const productHref = await getFirstProductHref(page);
    await page.goto(productHref);
    // The tab bar sits below the hero/stat-card section -- confirmed
    // directly that calling .focus() before it's scrolled into view (and
    // the page has settled) can silently no-op in some engines, leaving
    // focus on <body> and every subsequent assertion failing for a
    // reason that has nothing to do with the arrow-key behavior under
    // test.
    await page.waitForLoadState("networkidle");

    const overviewTab = page.locator("#product-tab-overview");
    const claimsTab = page.locator("#product-tab-claims");
    const ingredientsTab = page.locator("#product-tab-ingredients");
    const documentsTab = page.locator("#product-tab-documents");
    // Each tab has its own panel id (product-tab-panel-<key>), confirmed
    // necessary: AnimatePresence briefly keeps the exiting AND entering
    // panel both mounted during its ~0.3s transition, so a shared static
    // id would collide (and did, before this was fixed) -- target the
    // specific entering panel directly rather than a bare role query,
    // which can transiently match both during that window.

    await overviewTab.scrollIntoViewIfNeeded();
    await overviewTab.focus();
    await expect(overviewTab).toHaveAttribute("aria-selected", "true");

    // ArrowRight moves focus AND switches the panel (automatic activation).
    await page.keyboard.press("ArrowRight");
    await expect(claimsTab).toBeFocused();
    await expect(claimsTab).toHaveAttribute("aria-selected", "true");
    await expect(overviewTab).toHaveAttribute("aria-selected", "false");
    await expect(page.locator("#product-tab-panel-claims")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(ingredientsTab).toBeFocused();
    await expect(ingredientsTab).toHaveAttribute("aria-selected", "true");

    // ArrowLeft moves back.
    await page.keyboard.press("ArrowLeft");
    await expect(claimsTab).toBeFocused();
    await expect(claimsTab).toHaveAttribute("aria-selected", "true");

    // End jumps to the last tab, Home back to the first.
    await page.keyboard.press("End");
    await expect(documentsTab).toBeFocused();
    await expect(documentsTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Home");
    await expect(overviewTab).toBeFocused();
    await expect(overviewTab).toHaveAttribute("aria-selected", "true");

    // ArrowRight from the last tab wraps to the first, and vice versa.
    await page.keyboard.press("ArrowLeft");
    await expect(documentsTab).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(overviewTab).toBeFocused();

    assertNoUnexpectedErrors(tracker);
  });

  test("roving tabindex: Tab enters the tablist once, at the active tab, not at every tab", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);
    const productHref = await getFirstProductHref(page);
    await page.goto(productHref);

    const tabIndexes = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="tab"]')).map((el) => el.getAttribute("tabindex")),
    );
    // Exactly one tab (the active one, "Overview" by default) is a real
    // Tab stop; the rest are pulled out of the normal Tab sequence so
    // Tab itself skips past the whole group in one step.
    expect(tabIndexes.filter((t) => t === "0").length).toBe(1);
    expect(tabIndexes.filter((t) => t === "-1").length).toBe(tabIndexes.length - 1);

    assertNoUnexpectedErrors(tracker);
  });
});

test.describe("mobile carousels: keyboard reachability", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "Desktop Chrome", "Both carousels under test are mobile-only UI.");
  });

  test("the verify-steps and advantage carousels are reachable by Tab and have a real accessible name", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-brands/home");

    const verifyCarousel = page.locator(".brands-verify-carousel");
    const advantageCarousel = page.locator(".brands-advantage-carousel");

    if (await verifyCarousel.isVisible().catch(() => false)) {
      await verifyCarousel.evaluate((el) => el.focus());
      await expect(verifyCarousel).toBeFocused();
      await expect(verifyCarousel).toHaveAttribute("role", "region");
      const label = await verifyCarousel.getAttribute("aria-label");
      expect(label?.length).toBeGreaterThan(0);
    }

    if (await advantageCarousel.isVisible().catch(() => false)) {
      await advantageCarousel.evaluate((el) => el.focus());
      await expect(advantageCarousel).toBeFocused();
      await expect(advantageCarousel).toHaveAttribute("role", "region");
      const label = await advantageCarousel.getAttribute("aria-label");
      expect(label?.length).toBeGreaterThan(0);
    }

    assertNoUnexpectedErrors(tracker);
  });
});
