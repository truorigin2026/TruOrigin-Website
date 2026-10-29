# End-to-end tests (Playwright)

Regression coverage for navigation, browser back/forward, direct URL loads,
mobile layout, catalog filters/search/sort/pagination, and API-failure
handling, run against a real production build of the app.

For a precise audit of what's asserted vs. not, the 404 investigation, the
network-write audit, and confirmed defects found while writing these tests,
see **[COVERAGE.md](./COVERAGE.md)**.

## Important: there is no separate test database (for the main suite)

This project has only one Postgres database, and it's the one production
uses (`DATABASE_URL` in `.env`). The **main suite** (`tests/e2e/`) runs
against **real, live data** locally, and against a dedicated staging
database in CI (see "CI and the database" below) — **never** against
production in CI.

Every test in the main suite is required to stay **read-only**: navigate
pages and assert on them, never log in, or otherwise write real data. Two
safety measures enforce this:

- `fixtures.ts` intercepts the public product page's analytics beacons
  (`/api/scan`, `/api/scan/duration`) so normal navigation through this
  suite never pollutes the real view-count analytics the brand/admin
  dashboards report on. Confirmed directly that a real, unintercepted
  product-page visit fires two of these — see COVERAGE.md's network audit.
- `api-failures.spec.ts` is the one spec that touches a real client-side
  write path (the contact form's `POST /api/contact`) — every test there
  intercepts that request before it reaches the real route, so no email
  is sent and no record is created regardless of what the test simulates.

There's a second, independent suite — `tests/e2e-dbfree/` — for the small
set of pages confirmed to need no database at all. See "Two suites" below.

**If you add a new test to `tests/e2e/`**, keep it read-only. Don't add a
test that logs in, creates/edits/deletes a product or brand, or lets a
real form submission reach its real endpoint.

## Two suites

| | Main suite | Database-free suite |
|---|---|---|
| Config | `playwright.config.ts` | `playwright.dbfree.config.ts` |
| Tests | `tests/e2e/*.spec.ts` | `tests/e2e-dbfree/*.spec.ts` |
| Server | production build (`next build && next start`) | `next dev` |
| Needs `DATABASE_URL`? | yes | **no** — confirmed to run with it genuinely unset |
| Covers | navigation, filters/search, mobile, API failures, etc. | `/terms`, `/privacy`, `/disclaimer` only |
| Runs in CI | only if `STAGING_DATABASE_URL` is set | always, every push/PR |

## Running the tests locally

```bash
# One-time setup, if you haven't already:
npx playwright install --with-deps chromium webkit

# Main suite (builds the app, starts it, runs all tests, then shuts the server down):
npm run test:e2e

# Database-free suite (fast, no DATABASE_URL needed):
npx playwright test --config=playwright.dbfree.config.ts

# A single file:
npx playwright test tests/e2e/navigation.spec.ts

# A single test by name:
npx playwright test -g "filter sheet's close button"

# One browser project only (Desktop Chrome | Mobile Chrome | Mobile Safari):
npx playwright test --project="Mobile Safari"

# Interactive UI mode (great while writing/debugging a test):
npm run test:e2e:ui
```

The first run of the main suite builds the app (`next build`), which takes
~30-60s and needs `DATABASE_URL` set in `.env` (it's already there for
local dev). Playwright starts the production server itself and tears it
down after the run.

If you already have a fresh build sitting in `.next` (e.g. you just ran
`npm run build` yourself) and don't want Playwright to rebuild, skip it:

```bash
PLAYWRIGHT_SKIP_BUILD=1 npm run test:e2e
```

## Viewing a report

```bash
npm run test:e2e:report                 # main suite's report
npx playwright show-report playwright-report-dbfree   # dbfree suite's report
```

On failure, a screenshot and video are attached automatically
(`test-results/`), and a trace is captured on the first retry in CI.

## Adding a new test

- Put it in `tests/e2e/` (needs the database) or `tests/e2e-dbfree/`
  (genuinely doesn't), named `*.spec.ts`.
- Import `test`/`expect` from **`./fixtures`** (or `../e2e/fixtures` from
  `tests/e2e-dbfree/`), not directly from `@playwright/test` — that's what
  wires up the analytics-safety interception and the health checks below.
- Start it with `const tracker = trackPageHealth(page, baseURL);` and end
  it with `assertNoUnexpectedErrors(tracker);` to get automatic checks for
  uncaught exceptions, `console.error` calls, and failed/5xx same-origin
  requests. See any existing spec for the pattern. If your test
  *deliberately* makes one specific request fail (like
  `api-failures.spec.ts` does), pass its URL substring as a third
  argument — `trackPageHealth(page, baseURL, ["/api/contact"])` — so the
  failure you caused on purpose isn't also flagged as a bug.
- Don't hardcode a product slug/code — use `getFirstProductHref(page)` from
  `./helpers` to grab whatever's actually live in the catalog right now. It
  skips (not fails) the test if the catalog is ever empty.
- For a check that only makes sense on mobile widths (something hidden by
  CSS above the site's 1023px breakpoint) or desktop widths (something
  hidden below it), skip the other projects with `test.skip(testInfo...)`
  — see `mobile.spec.ts` or `navigation.spec.ts`'s audience-toggle test
  for the pattern.
- If you find a real bug while writing a test, don't weaken the assertion
  to make it pass — write the test to assert the *correct* behavior, mark
  it `test.fail(true, "reason")`, and document the root cause in a comment.
  See `filters-and-search.spec.ts`'s two "CONFIRMED DEFECT" tests.
- When your assertion checks a count or some other value that updates via
  a client-side transition, prefer an auto-retrying locator assertion
  (`await expect(locator).not.toHaveCount(0)`) over a one-shot `.count()`
  read — the latter can race the transition and read a stale value.

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
  cleanly instead of crashing (see COVERAGE.md for the soft-404 status-code
  investigation).
- `filters-and-search.spec.ts` — category filters, search (match + empty
  state), sort order, pagination (skips if unreachable — see COVERAGE.md),
  rapid repeated filter clicks, and regression coverage for three app
  defects found and fixed during this suite's work (origin filter removed
  for lack of any backing data, "Clear Filters" now actually resets the
  search box, and a related navigation race where clicking "Clear
  Filters" immediately after submitting a search — before that search's
  own navigation lands — could leave the catalog stuck despite a clean
  URL; see COVERAGE.md's "navigation race investigation" for the full
  root cause).
- `api-failures.spec.ts` — the contact form's handling of a 500, a dropped
  connection, and a slow response (no double-submit).
- `tests/e2e-dbfree/static-pages.spec.ts` — `/terms`, `/privacy`,
  `/disclaimer` render correctly with no database available at all.

See [COVERAGE.md](./COVERAGE.md) for the precise per-test audit (what each
assertion would and wouldn't catch), the full skip-condition list, and the
highest-risk untested journeys.

## CI and the database

**No production database credential is configured in CI.**
`.github/workflows/e2e.yml` has two jobs:

- `e2e-dbfree` — runs on every push/PR, no secrets required.
- `e2e-full` — the main suite. Only runs if a `STAGING_DATABASE_URL`
  repository secret is configured (read into `DATABASE_URL` for that job
  only); otherwise it prints a clear warning and skips every step after
  the check. See COVERAGE.md → "CI and the database" for exactly what a
  staging database needs (schema + minimal seed data) and how to wire it
  up.

## Known gaps / things worth knowing

Full detail in COVERAGE.md; summary:

- **`/p/[slug]`'s soft 404** (200 instead of 404) — investigated in depth,
  root cause confirmed (a Next.js App Router streaming/fallback-rendering
  interaction), but no safe *minimal* fix exists without trading away
  either new-product visibility or page-caching performance. Left as-is;
  see COVERAGE.md for the full investigation and the options considered.
- **Two confirmed app defects found while writing the filter tests are now
  fixed and verified** (Country of Origin filter removed entirely — there
  was no backing data for it anywhere in the schema; "Clear Filters" now
  actually resets the search box via a prop-sync `useEffect`). See
  COVERAGE.md for the root causes and what changed.
- **The shared database occasionally drops connections under concurrent
  load.** Confirmed directly (real Prisma `ECONNRESET` / `P1017` errors in
  the server log). `playwright.config.ts` runs fully serial (`workers: 1`)
  specifically to avoid manufacturing failures out of this pre-existing
  characteristic; it also makes the suite slower than it could otherwise
  be. If a staging database is ever set up for CI, revisiting `workers`
  there is worth it (local runs against the real shared DB should probably
  stay serial regardless).
- **No authenticated coverage.** Brand/admin dashboards, login, and product
  submission aren't covered — the single largest gap in this suite. See
  COVERAGE.md → "Highest-risk untested user journeys."
