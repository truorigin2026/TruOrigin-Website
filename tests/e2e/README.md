# End-to-end tests (Playwright)

Regression coverage for navigation, browser back/forward, direct URL loads, and
mobile layout, run against a real production build of the app.

## Important: there is no separate test database

This project has only one Postgres database, and it's the one production
uses (`DATABASE_URL` in `.env`). These tests run against **real, live data**.

Every test in this suite is required to stay **read-only**: navigate pages and
assert on them, never log in, submit a form, or otherwise write data. The
shared fixture (`fixtures.ts`) also intercepts the public product page's
analytics beacons (`/api/scan`, `/api/scan/duration`) so normal navigation
through this suite never pollutes the real view-count analytics the
brand/admin dashboards report on.

**If you add a new test**, keep it read-only. Don't add a test that logs in,
creates/edits/deletes a product or brand, or submits the contact form against
this database.

## Running the tests locally

```bash
# One-time setup, if you haven't already:
npx playwright install --with-deps chromium webkit

# Full suite (builds the app, starts it, runs all tests, then shuts the server down):
npm run test:e2e

# A single file:
npx playwright test tests/e2e/navigation.spec.ts

# A single test by name:
npx playwright test -g "filter sheet's close button"

# One browser project only (Desktop Chrome | Mobile Chrome | Mobile Safari):
npx playwright test --project="Mobile Safari"

# Interactive UI mode (great while writing/debugging a test):
npm run test:e2e:ui
```

The first run builds the app (`next build`), which takes ~30-60s and needs
`DATABASE_URL` set in `.env` (it's already there for local dev). Playwright
starts the production server itself and tears it down after the run.

If you already have a fresh build sitting in `.next` (e.g. you just ran
`npm run build` yourself) and don't want Playwright to rebuild, skip it:

```bash
PLAYWRIGHT_SKIP_BUILD=1 npm run test:e2e
```

## Viewing a report

```bash
npm run test:e2e:report
```

Opens the last run's HTML report (also written to `playwright-report/`).
On failure, a screenshot and video are attached automatically
(`test-results/`), and a trace is captured on the first retry in CI.

## Adding a new test

- Put it in `tests/e2e/`, named `*.spec.ts`.
- Import `test`/`expect` from **`./fixtures`**, not directly from
  `@playwright/test` — that's what wires up the analytics-safety
  interception.
- Start it with `const tracker = trackPageHealth(page, baseURL);` and end it
  with `assertNoUnexpectedErrors(tracker);` to get automatic checks for
  uncaught exceptions, `console.error` calls, and failed/5xx same-origin
  requests. See any existing spec for the pattern.
- Don't hardcode a product slug/code — use `getFirstProductHref(page)` from
  `./helpers` to grab whatever's actually live in the catalog right now. It
  skips (not fails) the test if the catalog is ever empty.
- For a check that only makes sense on mobile widths (something hidden by
  CSS above the site's 1023px breakpoint), skip it on `"Desktop Chrome"` —
  see the `test.beforeEach` in `mobile.spec.ts` for the pattern.

## What's covered

- `navigation.spec.ts` — product detail page back to the catalog, the
  desktop header's Products/Brands audience toggle, browser back/forward
  between a product and the catalog, and a repeated back/forward stress test
  (regression test for a confirmed production bug: a stuck page-transition
  layer could block every click and pad the page's scrollable height past
  the real footer).
- `refresh-and-direct-url.spec.ts` — loading a product page by direct URL
  with no prior navigation, and hard-refreshing both a product page and
  `/for-brands/home`.
- `mobile.spec.ts` — the mobile nav drawer (open/close/still-clickable-after),
  switching audience via the drawer's own toggle, and the product filter
  sheet's close button staying clear of the fixed header (regression test
  for a separate confirmed production bug).
- `not-found.spec.ts` — a nonexistent product code renders the 404 page
  cleanly instead of crashing. Also documents a pre-existing, separate issue
  found while writing this test (see "Known gaps" below).

## Known gaps / things worth knowing

- **This route's 404 is a soft 404.** `/p/[a-nonexistent-code]` renders the
  not-found page content correctly, but the response's HTTP status is 200,
  not 404 — confirmed against a real production build, not a dev-server
  quirk. That's a pre-existing SEO-relevant issue, unrelated to anything
  this test setup changed, and intentionally left unfixed here (out of
  scope for a test-setup task). `not-found.spec.ts` documents this instead
  of silently asserting on the wrong status code.
- **The shared database occasionally drops connections under concurrent
  load.** Confirmed directly (real Prisma `ECONNRESET` / `P1017` errors in
  the server log) while tuning this suite's parallelism — not something
  these tests can fix. `playwright.config.ts` runs fully serial
  (`workers: 1`) specifically to avoid manufacturing failures out of this
  pre-existing characteristic; it also makes the suite slower than it could
  otherwise be. If the project ever gets a dedicated staging database, raising
  `workers` back up is the main thing worth revisiting.
- **No authenticated coverage.** Brand/admin dashboards, login, and product
  submission aren't covered — they'd require either real test accounts and
  write access against production data (against this task's constraints) or
  a separate seeded test database, neither of which exists today.
- **CI needs a `DATABASE_URL` repository secret** pointing at this same
  database (see `.github/workflows/e2e.yml`) — without it, the workflow's
  build step fails immediately. `JWT_SECRET` is optional for this specific
  suite (nothing here logs in), but is cheap to set for when authenticated
  tests are eventually added.
