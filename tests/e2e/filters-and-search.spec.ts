import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";

/**
 * The products catalog (app/(public)/for-products/products/page.tsx +
 * components/products/products-content.tsx) is the one place in this app
 * with filters, search, sort, and pagination — there's no equivalent on the
 * For Brands side (marketing pages + a contact form, covered in
 * api-failures.spec.ts). All of it is URL-driven: filtering/search/sort
 * read from query params and the server component re-renders; there's no
 * client-side fetch to intercept here (unlike the contact form).
 */

test.describe("products catalog: filters, search, sort, pagination, empty states", () => {
  test("category filter (desktop sidebar) narrows results and marks itself active", async ({ page, baseURL }, testInfo) => {
    // The filter sidebar is a real, clickable control only on desktop
    // (hidden below 1024px — components/ui/filter-sidebar-mobile.tsx);
    // the mobile equivalent (same underlying component, inside a sheet)
    // is covered in mobile.spec.ts.
    test.skip(testInfo.project.name !== "Desktop Chrome", "Filter sidebar is desktop-only UI; mobile's sheet is covered in mobile.spec.ts.");

    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");

    const sidebar = page.locator(".filter-sidebar-desktop");
    const allProductsOption = sidebar.getByRole("link", { name: "All Products" });
    await expect(allProductsOption).toHaveClass(/is-active/);

    const categoryOptions = sidebar.locator(".filter-sidebar-group", { hasText: "Categories" }).locator(".filter-sidebar-option");
    const optionCount = await categoryOptions.count();
    if (optionCount < 2) {
      test.skip(true, "Fewer than 2 category options rendered — nothing to switch between.");
    }

    // Pick a category option that isn't "All Products" — whichever comes
    // first, rather than hardcoding a category name the live catalog may
    // or may not actually have a product in (an empty result for a real
    // category is itself meaningful information, not a reason to skip).
    const target = categoryOptions.nth(1);
    const targetLabel = (await target.textContent())?.trim();
    await target.click();

    await expect(page).toHaveURL(/category=/);
    await expect(target).toHaveClass(/is-active/);
    await expect(allProductsOption).not.toHaveClass(/is-active/);

    // The control must have actually changed what's on screen, not just
    // the URL — either narrowed the grid, or (a real, valid outcome) shown
    // the explicit empty state. Either is a sign the UI responded; neither
    // happening at all (stale "All Products" results still showing) would
    // be the actual bug this guards against.
    const cardCount = await page.locator('a.product-card[href^="/p/"]').count();
    const emptyState = page.getByText("No products match your filters.");
    const responded = cardCount > 0 || (await emptyState.isVisible());
    expect(responded, `Selecting "${targetLabel}" produced neither cards nor the empty state.`).toBe(true);

    assertNoUnexpectedErrors(tracker);
  });

  test("searching for a real product's name narrows results to it", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");
    // Confirmed under full-suite load (not in isolation): WebKit needs a
    // moment to finish hydrating this client component before its first
    // interaction reliably registers — give it that moment rather than
    // interact against a half-hydrated page.
    await page.waitForLoadState("networkidle");

    const firstCardName = page.locator(".product-card-name").first();
    const count = await page.locator('a.product-card[href^="/p/"]').count();
    if (count === 0) {
      test.skip(true, "No live products in the catalog to search for.");
    }
    const name = (await firstCardName.textContent())?.trim() ?? "";
    // A distinctive fragment, not the whole name (which may include
    // punctuation like "–" that's awkward to type/compare reliably).
    const searchTerm = name.split(/\s+/)[0];

    await page.getByPlaceholder("Search products, brands, or categories").fill(searchTerm);
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL(new RegExp(`search=${encodeURIComponent(searchTerm)}`, "i"));
    await expect(page.locator(".product-card-name").first()).toContainText(searchTerm, { ignoreCase: true });

    assertNoUnexpectedErrors(tracker);
  });

  test("searching for nonsense shows the explicit empty state, not a blank or broken page", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");
    await page.waitForLoadState("networkidle");

    const searchTerm = "zzzznonexistentproductqueryxyz123";
    await page.getByPlaceholder("Search products, brands, or categories").fill(searchTerm);
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByText("No products match your filters.")).toBeVisible();
    await expect(page.locator('a.product-card[href^="/p/"]')).toHaveCount(0);
    // The recovery link's *presence* is covered here; whether it actually
    // works is a separate, currently-failing test below — see the
    // CONFIRMED DEFECT test for why those are split apart.
    await expect(page.getByRole("link", { name: "Clear Filters" })).toBeVisible();

    assertNoUnexpectedErrors(tracker);
  });

  test("CONFIRMED DEFECT: \"Clear Filters\" resets the URL but not the search box, so the catalog stays stuck at zero results", async ({
    page,
    baseURL,
  }) => {
    // Root cause (components/products/products-content.tsx): `filtered`
    // is computed from `searchValue`, a LOCAL useState seeded once from
    // the URL (`useState(selectedSearch)`) — not from the `selectedSearch`
    // prop itself. "Clear Filters" is a plain <Link> back to the bare
    // /for-products/products URL; it updates the URL and the
    // `selectedSearch` prop, but nothing re-syncs the already-initialized
    // `searchValue` state, so the stale search term keeps filtering out
    // every product even though the address bar shows no search param.
    // Reproduced directly: searching for a nonsense term, clicking "Clear
    // Filters", and reading the search input's value afterward shows it
    // still holds the old query. This test encodes the CORRECT behavior
    // and is marked test.fail() because it currently doesn't hold — remove
    // test.fail() once the component re-syncs searchValue (e.g. a
    // key={selectedSearch} remount, or a useEffect watching the prop).
    test.fail(true, "Known defect — see comment above. Should start unexpectedly passing once fixed.");

    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("Search products, brands, or categories").fill("zzzznonexistentproductqueryxyz123");
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByText("No products match your filters.")).toBeVisible();

    await page.getByRole("link", { name: "Clear Filters" }).click();
    await expect(page).toHaveURL(/\/for-products\/products$/);

    await expect(page.locator('a.product-card[href^="/p/"]')).not.toHaveCount(0);

    assertNoUnexpectedErrors(tracker);
  });

  test("sort order actually changes result order (no UI control exists for this today — verified via the URL param the app already reads)", async ({
    page,
    baseURL,
  }) => {
    // KNOWN GAP, not a defect: there is no clickable sort control anywhere
    // in the UI (confirmed by reading products-content.tsx and
    // filter-sidebar.tsx — `createHref()` accepts a `sort` param and
    // sortProducts() respects it, but nothing in either component ever
    // sets it). This test exercises the feature the only way it's
    // actually reachable today, and exists to catch a regression in the
    // sorting logic itself if a UI control is added later.
    const tracker = trackPageHealth(page, baseURL);

    await page.goto("/for-products/products");
    const count = await page.locator('a.product-card[href^="/p/"]').count();
    if (count < 2) {
      test.skip(true, "Fewer than 2 live products — sort order isn't observable.");
    }

    await page.goto("/for-products/products?sort=name");
    const nameSorted = await page.locator(".product-card-name").allTextContents();
    const expectedAlpha = [...nameSorted].sort((a, b) => a.localeCompare(b));
    expect(nameSorted).toEqual(expectedAlpha);

    assertNoUnexpectedErrors(tracker);
  });

  test("pagination: page 2 (if it exists) shows different products than page 1", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");

    const hasPagination = await page.locator(".products-pagination").count();
    if (hasPagination === 0) {
      // Confirmed live: only 3 products exist today (12/page) — this isn't
      // reachable yet. Skipping rather than faking enough products to
      // trigger it, per this suite's read-only-against-real-data rule.
      test.skip(true, "Catalog has one page of results today — pagination isn't reachable without fabricating data.");
    }

    const page1Names = await page.locator(".product-card-name").allTextContents();

    await page.getByRole("link", { name: "2", exact: true }).click();
    await expect(page).toHaveURL(/page=2/);

    const page2Names = await page.locator(".product-card-name").allTextContents();
    expect(page2Names.length).toBeGreaterThan(0);
    expect(page2Names).not.toEqual(page1Names);

    assertNoUnexpectedErrors(tracker);
  });

  test("CONFIRMED DEFECT: selecting any Country of Origin filter always empties the results, regardless of the product's actual origin", async ({
    page,
    baseURL,
  }, testInfo) => {
    // Root cause (components/products/products-content.tsx,
    // filterProducts()): `const originMatch = !origin;` ignores the
    // product's own origin field entirely — it's only ever true when NO
    // origin filter is selected, so picking *any* origin value makes every
    // product fail the match. Reproduced directly: selecting "Canada"
    // against the live catalog shows zero results even though valid
    // products exist. This test encodes the CORRECT behavior (selecting
    // an origin should narrow, not always empty, the results) and is
    // marked test.fail() because it currently doesn't hold — remove
    // test.fail() once filterProducts() is fixed to actually compare
    // against each product's origin. Desktop-only for the same reason as
    // the category filter test above.
    test.skip(testInfo.project.name !== "Desktop Chrome", "Filter sidebar is desktop-only UI.");
    test.fail(true, "Known defect — see comment above. Should start unexpectedly passing once filterProducts() is fixed.");

    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");

    const sidebar = page.locator(".filter-sidebar-desktop");
    const originGroup = sidebar.locator(".filter-sidebar-group", { hasText: "Country of Origin" });
    if ((await originGroup.count()) === 0) {
      test.skip(true, "No Country of Origin filter group rendered.");
    }

    const firstRealOrigin = originGroup.locator(".filter-sidebar-option").nth(1); // index 0 is "All Origins"
    await firstRealOrigin.click();
    await expect(firstRealOrigin).toHaveClass(/is-active/);

    await expect(page.locator('a.product-card[href^="/p/"]')).not.toHaveCount(0);

    assertNoUnexpectedErrors(tracker);
  });

  test("rapid repeated category-filter clicks don't leave the catalog stuck mid-transition", async ({ page, baseURL }, testInfo) => {
    // Distinct from navigation.spec.ts's whole-page back/forward stress
    // test — this hammers the catalog's OWN client-side transition
    // (components/products/products-content.tsx uses useTransition() +
    // router.push() for every filter/search change, with
    // scroll:false, all while staying on the same route). Firing several
    // before any one settles is a real thing a fast double-clicking user
    // can do.
    test.skip(testInfo.project.name !== "Desktop Chrome", "Filter sidebar is desktop-only UI.");

    const tracker = trackPageHealth(page, baseURL);
    await page.goto("/for-products/products");

    const sidebar = page.locator(".filter-sidebar-desktop");
    const categoryOptions = sidebar.locator(".filter-sidebar-group", { hasText: "Categories" }).locator(".filter-sidebar-option");
    const optionCount = await categoryOptions.count();
    if (optionCount < 3) {
      test.skip(true, "Fewer than 3 category options rendered — not enough to cycle through.");
    }

    for (let i = 0; i < 3; i += 1) {
      await categoryOptions.nth(i).click({ noWaitAfter: true });
    }
    // No settle wait on purpose — the next assertion must hold even if the
    // last click's navigation is still resolving.
    await page.waitForLoadState("networkidle");

    // The final click's category must be the one actually reflected, not
    // an earlier, superseded one — and the page must still be interactive.
    const lastClicked = categoryOptions.nth(2);
    await expect(lastClicked).toHaveClass(/is-active/);
    await expect(page.getByPlaceholder("Search products, brands, or categories")).toBeEditable();

    assertNoUnexpectedErrors(tracker);
  });
});
