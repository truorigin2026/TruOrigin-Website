import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";
import { getFirstProductHref } from "./helpers";

test.describe("product ↔ brand navigation", () => {
  test("product detail page links back to the products catalog", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    const productHref = await getFirstProductHref(page);

    await page.goto(productHref);
    await expect(page.locator("header").first()).toBeVisible();
    await expect(page.locator("footer.saas-footer")).toBeVisible();

    await page.getByRole("link", { name: /Back to Products/ }).click();
    await expect(page).toHaveURL(/\/for-products\/products$/);

    assertNoUnexpectedErrors(tracker);
  });

  test("switching audience from Products to Brands and back via the header toggle preserves a working page", async ({
    page,
    baseURL,
  }, testInfo) => {
    // The header's Products/Brands toggle is desktop-only UI (hidden below
    // 900px in app/globals.css) — mobile has its own equivalent inside the
    // nav drawer, covered separately in mobile.spec.ts.
    test.skip(testInfo.project.name !== "Desktop Chrome", "Header audience toggle is desktop-only UI.");

    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/home");
    await expect(page.getByRole("tab", { name: "Products" })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "Brands" }).click();
    await expect(page).toHaveURL(/\/for-brands\/home$/);
    await expect(page.getByRole("tab", { name: "Brands" })).toHaveAttribute("aria-selected", "true");

    await page.getByRole("tab", { name: "Products" }).click();
    await expect(page).toHaveURL(/\/for-products\/home$/);

    // The page must still be genuinely interactive after the round trip,
    // not just visually present — click something real and confirm it
    // actually navigates.
    await page.getByRole("tab", { name: "Brands" }).click();
    await expect(page).toHaveURL(/\/for-brands\/home$/);

    assertNoUnexpectedErrors(tracker);
  });

  test("browser back/forward between a product and the catalog lands on working pages", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    const productHref = await getFirstProductHref(page); // navigates to /for-products/products

    await page.locator('a.product-card[href^="/p/"]').first().click();
    await expect(page).toHaveURL(new RegExp(productHref.replace(/[/]/g, "\\/") + "$"));

    await page.goBack();
    await expect(page).toHaveURL(/\/for-products\/products$/);
    await expect(page.locator('a.product-card[href^="/p/"]').first()).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(new RegExp(productHref.replace(/[/]/g, "\\/") + "$"));
    await expect(page.locator("footer.saas-footer")).toBeVisible();

    assertNoUnexpectedErrors(tracker);
  });

  test("repeated back/forward navigation never leaves a stuck overlay blocking clicks or inflating page height", async ({
    page,
    baseURL,
  }) => {
    // Regression test for a confirmed live bug: AnimatePresence's
    // popLayout page-transition wrapper could leave the outgoing page's
    // layer mounted (invisible but still interactive) on top of the real
    // page after a fast back/forward navigation, blocking every click and
    // padding the document's scrollable height past the real footer.
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/home");
    await page.goto("/for-brands/home");
    await page.goto("/for-products/home");

    // Next's client router does its own async history/RSC bookkeeping on
    // each back/forward step. Waiting for the full "load" event races with
    // that and intermittently aborts the navigation itself, so these wait
    // only for the navigation to commit (not fully settle) and then give
    // the SPA router a short, fixed moment to finish its own work — more
    // reliable for this specific rapid-fire navigation stress scenario
    // than event-based waits across three different browser engines.
    for (let i = 0; i < 4; i += 1) {
      await page.goBack({ waitUntil: "commit" });
      await page.waitForTimeout(400);
      await page.goForward({ waitUntil: "commit" });
      await page.waitForTimeout(400);
    }
    await page.goBack({ waitUntil: "commit" });
    await page.waitForTimeout(400);
    await page.goBack({ waitUntil: "commit" });
    await page.waitForTimeout(400);

    // The page must still be clickable: a real click on a real link must
    // actually navigate, not silently no-op behind a stuck invisible layer.
    // The footer's "Brands" home link is used here (rather than the header
    // audience toggle) because it renders identically on every viewport,
    // so this same assertion covers desktop and mobile alike.
    await page.locator('footer a[href="/for-brands/home"]').first().click();
    await expect(page).toHaveURL(/\/for-brands\/home$/);

    // /for-brands/home is a long, section-heavy marketing page, and this
    // was reached via a client-side (SPA) navigation — the browser's
    // "load" event already fired once for the session's original page
    // load and won't fire again for an SPA transition, so waiting on it
    // here is a no-op. Wait for network activity (images etc.) to settle
    // as a first pass, otherwise an in-progress layout mid-load looks
    // identical to the stuck-layer bug this is actually checking for. A
    // direct, un-navigated load of this page measures a ~0px gap once
    // settled; that's the real baseline.
    await page.waitForLoadState("networkidle");

    const footer = page.locator("footer.saas-footer");
    await expect(footer).toBeVisible();

    // The document's scrollable area must end at (or very near) the real
    // footer, not extend into blank space left by a stuck taller layer.
    // Measured with expect.poll() rather than a fixed wait + one-shot
    // snapshot: Playwright's own docs call out networkidle as unreliable
    // for pages with any ongoing background activity, and this one has
    // plenty (whileInView fade-ins, lazy images, Next's own link
    // prefetching of everything already in the viewport) — a "quiet"
    // window can land before the last bit of that has actually finished
    // affecting layout. Polling the real measurement until it settles (or
    // the timeout below expires) waits exactly as long as the page
    // actually needs, instead of guessing a fixed delay — this is a
    // synchronization improvement only; the correctness threshold itself
    // (<50px) is unchanged from before.
    await expect
      .poll(
        async () => {
          const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
          const footerBottom = await footer.evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
          return scrollHeight - footerBottom;
        },
        { timeout: 10_000 },
      )
      .toBeLessThan(50);

    assertNoUnexpectedErrors(tracker);
  });
});
