import { test, expect, assertNoUnexpectedErrors, trackPageHealth } from "./fixtures";

/**
 * The contact form (components/brands/contact-form.tsx, rendered on
 * /for-brands/contact and /for-products/support) is the only client-side
 * fetch reachable from a public, unauthenticated page in this app that
 * this suite can safely exercise — everything else either requires a
 * session (brand/admin dashboards, behind middleware auth) or isn't a
 * fetch at all (the catalog's filters/search/sort are plain URL
 * navigations, server-rendered, not something a route-intercept can fail
 * independently of the whole page).
 *
 * Every test here intercepts POST /api/contact before it ever reaches the
 * real route — the real endpoint (which sends an email and can create a
 * SupportTicket-like record) is never actually called, so this cannot
 * write to the production database or send a real email, regardless of
 * what status the test simulates.
 */

async function fillRequiredFields(page: import("@playwright/test").Page) {
  await page.getByLabel("Email").fill("e2e-test@example.com");
  await page.getByLabel("Message").fill("Automated test — simulated API failure, not a real inquiry.");
}

test.describe("contact form: API failure handling", () => {
  test("a 500 response from /api/contact shows a graceful error, not a crash", async ({ page, baseURL }) => {
    // The 500 below is deliberate (that's what this test is for) — excluded
    // from the generic failed-request check so it isn't flagged as a bug;
    // console.error/uncaught-exception checks still apply in full.
    const tracker = trackPageHealth(page, baseURL, ["/api/contact"]);

    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Internal Server Error" }) }),
    );

    await page.goto("/for-brands/contact");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible();
    // The success message must NOT also appear — a real bug could show
    // both if state handling were broken.
    await expect(page.getByText("Thank you! Your message has been received.")).not.toBeVisible();

    // The page must still be usable after the failure — not stuck
    // mid-submit, not frozen.
    const submitButton = page.getByRole("button", { name: "Submit" });
    await expect(submitButton).toBeEnabled();
    await expect(page.locator("footer.saas-footer")).toBeVisible();
    await page.locator('footer a[href="/for-brands/home"]').first().click();
    await expect(page).toHaveURL(/\/for-brands\/home$/);

    assertNoUnexpectedErrors(tracker);
  });

  test("a dropped connection to /api/contact (not just a bad status) also shows a graceful error", async ({ page, baseURL }) => {
    // Distinct failure mode from a 500: route.abort() simulates the
    // request never completing at all (DNS failure, connection reset,
    // offline) — fetch() rejects rather than resolving with a
    // non-ok response, which is a different code path in the component's
    // try/catch than the 500 case above.
    const tracker = trackPageHealth(page, baseURL, ["/api/contact"]);

    await page.route("**/api/contact", (route) => route.abort("connectionfailed"));

    await page.goto("/for-brands/contact");
    await fillRequiredFields(page);
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeEnabled();

    assertNoUnexpectedErrors(tracker);
  });

  test("a slow /api/contact response disables the submit button instead of allowing a double-submit", async ({ page, baseURL }) => {
    const tracker = trackPageHealth(page, baseURL);
    let requestCount = 0;

    await page.route("**/api/contact", async (route) => {
      requestCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    });

    await page.goto("/for-brands/contact");
    await fillRequiredFields(page);

    const submitButton = page.getByRole("button", { name: /Submit|Sending/ });
    await submitButton.click();
    await expect(page.getByRole("button", { name: "Sending..." })).toBeDisabled();

    // Try to click again while it's in flight — the disabled state should
    // make this a no-op, not a second POST.
    await submitButton.click({ force: true }).catch(() => {});

    await expect(page.getByText("Thank you! Your message has been received.")).toBeVisible({ timeout: 5000 });
    expect(requestCount, "Submit must not fire a second request while one is already in flight").toBe(1);

    assertNoUnexpectedErrors(tracker);
  });
});
