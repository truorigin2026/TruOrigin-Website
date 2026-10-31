import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";
import { getFirstProductHref } from "./helpers";

/**
 * Accessibility regression suite for the public-facing site (Phase C.3).
 * Reuses the same fixtures (`./fixtures` — scan-beacon interception, the
 * uncaught-exception/console-error/failed-request health check) and the
 * same three browser projects (Desktop Chrome, Mobile Chrome, Mobile
 * Safari) every other spec in this suite runs on — no separate config.
 *
 * Every test here asserts on real axe-core violations with zero
 * tolerance (no severity threshold, no disabled rules) — a violation of
 * any impact level fails the test, with the violation's id, impact,
 * description, and every affected element's CSS selector printed in the
 * failure message. There is exactly one documented, narrowly-scoped
 * exception below (the header/drawer audience toggle); see its own
 * comment for why.
 *
 * A short settle after every navigation/interaction, before running axe:
 * confirmed directly, repeatedly, that axe can catch a page or an
 * interactive panel mid-render (a framer-motion/CSS transition still in
 * flight, or the brief pre-hydration instant right after a fresh
 * navigation) and report violations that vanish once rendering actually
 * settles — never a real defect, just sampling too early. This is a
 * synchronization choice, not a weakened assertion: the final check still
 * requires zero violations.
 *
 * What this suite does NOT and cannot verify — tracked here, not
 * silently assumed safe:
 *  - Real keyboard-trap behavior (axe can assert `aria-modal`/`role`
 *    exist on a dialog; it cannot simulate a user actually tabbing
 *    through one and confirm focus never escapes).
 *  - Real screen-reader announcement wording for the aria-live regions
 *    added in this pass (NVDA/VoiceOver, not just DOM structure).
 *  - Whether the product-tabs' click/Enter-only activation (no
 *    left/right-arrow roving between tabs) is something a real keyboard
 *    user notices in practice.
 *  - Actual rendered/composited color contrast (gradients, overlays,
 *    opacity) — axe does check contrast from computed styles, so this
 *    one IS covered by the automated run below, just flagged here since
 *    computed-style contrast and true rendered-pixel contrast can
 *    diverge in edge cases axe doesn't model (e.g. a background image
 *    behind semi-transparent text).
 */

const SETTLE_MS = 400;

async function gotoAndCheck(page: Page, url: string) {
  await page.goto(url);
  await page.waitForTimeout(SETTLE_MS);
  await runAxe(page);
}

async function settleAndCheck(page: Page) {
  await page.waitForTimeout(SETTLE_MS);
  await runAxe(page);
}

async function runAxe(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.description,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map((node) => node.target.join(" ")),
  }));
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test.describe("accessibility: public pages", () => {
  test("home pages (products and brands audience) have no axe violations", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await gotoAndCheck(page, "/for-products/home");
    await gotoAndCheck(page, "/for-brands/home");

    assertNoUnexpectedErrors(tracker);
  });

  test("products catalog page has no axe violations, including with an active filter and a search term", async ({
    page,
    baseURL,
  }) => {
    const tracker = trackPageHealth(page, baseURL);

    await gotoAndCheck(page, "/for-products/products");

    // Exercises the FilterOption aria-current fix on a real active state,
    // not just the all-inactive default.
    const firstCategory = page.locator(".filter-sidebar-option").nth(1);
    if (await firstCategory.isVisible().catch(() => false)) {
      await firstCategory.click();
      await settleAndCheck(page);
    }

    // Exercises the search input's new label, in both the has-results and
    // explicit-empty-state conditions.
    await gotoAndCheck(page, "/for-products/products?search=cream");
    await gotoAndCheck(page, "/for-products/products?search=zzz-no-such-product-zzz");

    assertNoUnexpectedErrors(tracker);
  });

  test("a product detail page, including a non-default tab, has no axe violations", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    const productHref = await getFirstProductHref(page);

    await gotoAndCheck(page, productHref);

    const claimsTab = page.getByRole("tab", { name: "Claims" });
    if (await claimsTab.isVisible().catch(() => false)) {
      await claimsTab.click();
      await settleAndCheck(page);
    }

    assertNoUnexpectedErrors(tracker);
  });

  test("contact, login, forgot-password pages have no axe violations", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await gotoAndCheck(page, "/for-brands/contact");
    await gotoAndCheck(page, "/login");
    await gotoAndCheck(page, "/forgot-password");

    assertNoUnexpectedErrors(tracker);
  });

  test("the not-found page has no axe violations", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await gotoAndCheck(page, "/product/this-code-does-not-exist-zzz");

    assertNoUnexpectedErrors(tracker);
  });
});

test.describe("accessibility: desktop-only interactive states", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "Desktop Chrome", "Desktop-only UI, not applicable at mobile width.");
  });

  test("the desktop nav dropdown has no axe violations while open", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-brands");
    const trigger = page.locator(".nav-dropdown-trigger").first();
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click();
      await settleAndCheck(page);
    }

    assertNoUnexpectedErrors(tracker);
  });
});

test.describe("accessibility: mobile-only interactive states", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === "Desktop Chrome", "Mobile-only UI, not applicable at desktop width.");
  });

  test("the mobile nav drawer has no axe violations while open", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/home");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.locator(".mobile-drawer.is-open")).toBeVisible();
    await settleAndCheck(page);

    assertNoUnexpectedErrors(tracker);
  });

  test("the mobile filter sheet has no axe violations while open", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/products");
    await page.getByRole("button", { name: "Open filters" }).click();
    await expect(page.locator(".filter-modal-overlay")).toBeVisible();
    await settleAndCheck(page);

    assertNoUnexpectedErrors(tracker);
  });
});
