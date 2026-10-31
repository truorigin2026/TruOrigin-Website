import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";

/**
 * Keyboard-interaction regression tests for hooks/use-dialog-a11y.ts's two
 * integrations (mobile nav drawer, mobile filter sheet) — Phase C.3 review
 * item 1. Real `page.keyboard` simulation, not just DOM-attribute
 * assertions: axe-core can confirm `aria-modal`/`role` exist, but it can't
 * confirm Tab genuinely stays trapped or that background content is
 * unreachable, which is exactly what this file checks.
 */

test.describe("dialog keyboard behavior", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "Desktop Chrome", "Both dialogs under test are mobile-only UI.");
  });

  test("mobile nav drawer: focus enters on open, Tab traps, Escape closes, focus returns to the trigger", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/home");

    // Not getByRole(name: "Open navigation") kept as a reference across
    // the whole test: its accessible name flips to "Close navigation"
    // once open, so re-querying by that stale name later would silently
    // never resolve. The class is stable across both states.
    const hamburger = page.locator(".stylish-hamburger-btn");
    await hamburger.click();
    const drawer = page.locator("#mobile-nav-drawer");
    await expect(drawer).toBeVisible();

    // Focus must land inside the drawer, not stay on the button that
    // opened it (a real click doesn't retain focus the way `.focus()`
    // calling code would).
    const activeInDrawerAfterOpen = await drawer.evaluate((el) => el.contains(document.activeElement));
    expect(activeInDrawerAfterOpen).toBe(true);

    // Tab through every focusable element inside the drawer, then once
    // more — the (N+1)th Tab must wrap back to the first, not escape the
    // drawer.
    const focusableCount = await drawer.evaluate(
      (el) =>
        el.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ).length,
    );
    expect(focusableCount).toBeGreaterThan(0);

    for (let i = 0; i < focusableCount; i += 1) {
      await page.keyboard.press("Tab");
    }
    // After exactly `focusableCount` Tabs from the first element, focus
    // should have cycled through all of them and wrapped back to the
    // first again.
    const wrappedForward = await drawer.evaluate((el) => el.contains(document.activeElement));
    expect(wrappedForward).toBe(true);

    // Shift+Tab from wherever we are now must also stay inside the drawer
    // -- never escape to whatever the drawer's own DOM neighbors are.
    await page.keyboard.press("Shift+Tab");
    const stillInDrawer = await drawer.evaluate((el) => el.contains(document.activeElement));
    expect(stillInDrawer).toBe(true);

    // Background content must be genuinely unreachable by keyboard while
    // the drawer is open -- not just "the trap usually catches Tab at the
    // boundary". Try to reach a real footer link via many more Tabs than
    // the drawer has focusable elements; it must never succeed.
    for (let i = 0; i < focusableCount + 10; i += 1) {
      await page.keyboard.press("Tab");
    }
    const footerLinkFocused = await page
      .locator('footer a[href="/for-brands/home"]')
      .first()
      .evaluate((el) => el === document.activeElement)
      .catch(() => false);
    expect(footerLinkFocused).toBe(false);

    // Escape closes it.
    await page.keyboard.press("Escape");
    await expect(drawer).not.toBeVisible();

    // Focus must return to the hamburger button that opened it.
    const focusReturnedToTrigger = await hamburger.evaluate((el) => el === document.activeElement);
    expect(focusReturnedToTrigger).toBe(true);

    assertNoUnexpectedErrors(tracker);
  });

  test("mobile nav drawer: closing via the close button and via the backdrop both return focus correctly", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/home");

    const hamburger = page.locator(".stylish-hamburger-btn");

    // Close via the explicit close button (same element, now showing
    // "Close navigation" -- use the stable class, not the dynamic name).
    await hamburger.click();
    await hamburger.click();
    await expect(page.locator("#mobile-nav-drawer")).not.toBeVisible();
    expect(await hamburger.evaluate((el) => el === document.activeElement)).toBe(true);

    // Close via a backdrop click (clicking the overlay outside the panel
    // and below the fixed header -- the drawer itself is right-anchored
    // and nearly full-width on mobile, so the only genuinely-empty
    // backdrop strip is low on the left edge, clear of the header).
    await hamburger.click();
    await expect(page.locator("#mobile-nav-drawer")).toBeVisible();
    await page.locator(".mobile-drawer-overlay").click({ position: { x: 5, y: 300 } });
    await expect(page.locator("#mobile-nav-drawer")).not.toBeVisible();
    expect(await hamburger.evaluate((el) => el === document.activeElement)).toBe(true);

    assertNoUnexpectedErrors(tracker);
  });

  test("mobile filter sheet: focus enters on open, Tab traps, Escape closes, focus returns to the trigger", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");

    const openButton = page.getByRole("button", { name: "Open filters" });
    await openButton.click();
    const sheet = page.locator("#filter-modal");
    await expect(sheet).toBeVisible();

    expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    const focusableCount = await sheet.evaluate(
      (el) =>
        el.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ).length,
    );
    expect(focusableCount).toBeGreaterThan(0);

    for (let i = 0; i < focusableCount + 10; i += 1) {
      await page.keyboard.press("Tab");
    }
    expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    // The product search button sits behind the sheet on this page -- a
    // concrete, real background element to confirm stays unreachable.
    const searchButtonFocused = await page
      .locator(".products-search-button")
      .first()
      .evaluate((el) => el === document.activeElement)
      .catch(() => false);
    expect(searchButtonFocused).toBe(false);

    await page.keyboard.press("Escape");
    await expect(sheet).not.toBeVisible();
    expect(await openButton.evaluate((el) => el === document.activeElement)).toBe(true);

    assertNoUnexpectedErrors(tracker);
  });
});
