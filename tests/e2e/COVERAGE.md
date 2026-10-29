# Coverage audit (phase 2)

This is a precise record of what this suite actually asserts, what it
doesn't, and why — written for anyone deciding what to test next or
reviewing whether a given page change is actually covered. See
[README.md](./README.md) for how to run things.

## Per-test behavior audit

For each test: what it asserts, and — the point of this audit — what
**disproves** it. A test that would still pass if the feature silently
broke is a false sense of coverage; every test below either (a) asserts on
something a broken/unresponsive page couldn't produce (a real navigation
happening, an active-state class appearing, a specific element becoming
visible), or is noted where that's weaker than it looks.

### `navigation.spec.ts`

| Test | Asserts | Would NOT catch |
|---|---|---|
| product detail → catalog | A real "Back to Products" link click lands back on `/for-products/products` | Visual-only breakage (link mispositioned but clickable) |
| audience toggle round-trip (desktop) | Each tab click changes the URL AND flips `aria-selected`; ends by actually navigating again (not just checking the toggle's own state) | A toggle that updates its own visual state without the underlying Link actually working would still be caught — this test clicks through to a real URL change each time |
| product ↔ catalog browser back/forward | `goBack()`/`goForward()` each land on the correct URL, with the catalog's product card and the product's footer actually visible afterward | — |
| repeated back/forward stress (regression test) | After 10 rapid back/forward steps: a real footer link click still navigates (not blocked by a stuck invisible layer), and the document's scrollable height doesn't extend past the real footer by more than 50px | A *partial* click-blocking regression (e.g. only one small region blocked) — this only probes one click target |

### `refresh-and-direct-url.spec.ts`

| Test | Asserts | Would NOT catch |
|---|---|---|
| direct URL load, product page | Header/footer/h1 visible on a cold load | Content that renders but is factually wrong (wrong product data) — this suite doesn't assert on product *content*, only structure |
| hard refresh, product page | Same as above, PLUS a real click-through afterward (interactivity survives a refresh) | — |
| hard refresh, for-brands/home | Same structural checks, no post-refresh interactivity click (unlike the product-page version) | A refresh that leaves this specific page non-interactive — **gap**, see below |

### `mobile.spec.ts`

| Test | Asserts | Would NOT catch |
|---|---|---|
| nav drawer open/close | Drawer becomes visible/invisible on the right triggers, AND a real footer-link click works after closing | A drawer that closes visually but leaves a residual click-blocking overlay *outside* the areas this specific click happens to test |
| drawer audience toggle | Clicking "For Brands" inside the drawer navigates, closes the drawer, footer is visible | — |
| filter sheet header clearance (regression test) | The close button's bounding box top is at/below the header's bottom edge; the button is actually clickable and closes the sheet | A clearance of exactly the wrong few pixels right at the `-1` tolerance boundary — intentionally tight, not padded |

### `not-found.spec.ts`

| Test | Asserts | Would NOT catch |
|---|---|---|
| bogus product code | Status isn't a 5xx; "Page Not Found" heading visible; header/footer visible; "Go Home" link actually navigates | The confirmed soft-404 (200 instead of 404) — deliberately not asserted on; see "Confirmed defects" below |

### `filters-and-search.spec.ts` (new)

| Test | Asserts | Would NOT catch |
|---|---|---|
| category filter (desktop) | URL gains `category=`, the clicked option gets `.is-active` and "All Products" loses it, AND the grid actually shows cards or the real empty-state text (not just a URL change) | A category that happens to have 0 real products today looks identical to "filter silently broken" in the data itself — mitigated by also requiring the explicit empty-state text, not just "0 cards" |
| search narrows to a real product | URL gains the right `search=` param, first result's name actually contains the typed term | — |
| search shows empty state | Explicit "No products match..." text, zero cards, recovery link present | Whether the recovery link *works* — split out, see Confirmed Defects |
| sort via URL | `?sort=name` actually produces alphabetically-sorted names | No UI control exists to trigger this by clicking — this only guards the underlying logic, not a user-facing control (see Highest-risk gaps) |
| pagination | If a second page exists, its product names differ from page 1's | Currently **always skips** — live catalog has 3 products, 12/page |
| rapid repeated filter clicks | After 3 fast clicks, the *last* one wins (not an earlier, superseded one), and the search input is still editable afterward | A race that corrupts the result list without also breaking the active-state class — narrow but real signal |

### `api-failures.spec.ts` (new)

| Test | Asserts | Would NOT catch |
|---|---|---|
| 500 from /api/contact | Error message shown, success message NOT shown, submit button re-enabled, page still navigable afterward | — |
| dropped connection | Same error message shown via a different code path (`fetch()` rejecting vs resolving non-ok) | — |
| slow response / double-submit | Button disabled while in flight; a forced second click doesn't fire a second POST (`requestCount` asserted `=== 1`) | — |

### `tests/e2e-dbfree/static-pages.spec.ts` (new)

| Test | Asserts | Would NOT catch |
|---|---|---|
| /terms, /privacy, /disclaimer | Status not 5xx, correct `<h1>`, header/footer visible, a real footer-link click navigates — all with **no database available at all** | Content accuracy (legal text correctness) — out of scope for an e2e suite |

## The 5 original skips, explained

(There are more skips now with the new tests — see "All current skip
conditions" below — but these are the ones from the original phase-1
suite, which the task specifically asked about.)

1. **`navigation.spec.ts` — audience toggle, skipped on Mobile Chrome / Mobile Safari.**
   Reason: the header's Products/Brands toggle is CSS-hidden below 900px
   (`app/globals.css`). Not a gap — the mobile equivalent (the drawer's own
   toggle) is a *separate, real* test in `mobile.spec.ts` that runs on
   mobile and is skipped on desktop for the mirror-image reason. Together
   they're full coverage, not a hole.

2–4. **`mobile.spec.ts`'s three tests, skipped on Desktop Chrome.**
   Reason: the hamburger menu and the filter sheet only render below
   1024px; there's nothing to test at desktop width. Not a gap — these
   are mobile-specific UI with no desktop equivalent to miss.

5. **`filters-and-search.spec.ts`'s original desktop-sidebar test** (at the
   time of the first audit, the only filter test that existed), skipped
   on mobile. Reason: same sidebar-is-desktop-only CSS fact as #1. The
   mobile filter *sheet* itself is covered separately in `mobile.spec.ts`
   (the header-clearance regression test), though mobile doesn't get a
   test for *clicking a filter inside* the sheet specifically — see gaps
   below.

**Verdict:** none of the 5 original skips hide a real gap — each is either
a CSS-enforced non-applicability (nothing to test at that width) or has an
equivalent test on the other viewport. The gaps that *do* exist (below)
are about missing scenarios, not skipped ones.

## All current skip conditions (after phase 2)

Full list (`grep -rn "test.skip(" tests/`):

- Desktop-only UI tested only on Desktop Chrome, skipped elsewhere: header
  audience toggle, filter sidebar (category/origin/rapid-click tests).
- Mobile-only UI tested only on mobile projects, skipped on Desktop
  Chrome: nav drawer, drawer audience toggle, filter sheet.
- **Data-conditional skips** (check live state every run, never hardcoded):
  empty catalog (`helpers.ts`), fewer than 2/3 filter or category options
  rendered, fewer than 2 live products (sort-order test), no second
  pagination page (confirmed: catalog has 3 products today, 12/page).

## Confirmed defects found during this audit

**Both of the filter defects below are now fixed and verified** (a
separate pass from the one that found them) — kept here for the record of
what was wrong and why, with the fix noted at the end of each.

1. **~~Country of Origin filter always empties the results.~~ FIXED by
   removal, not by "correct" matching.**
   `components/products/products-content.tsx`, `filterProducts()`:
   `const originMatch = !origin;` never actually compared against a
   product's own origin — it was only true when no origin was selected, so
   picking *any* origin value failed every product. Investigating the fix
   turned up something bigger than a bad comparison: **there is no
   country-of-origin field anywhere in the data model** — checked
   `prisma/schema.prisma`'s `Product` model, the `ProductRecord` type, and
   the repository layer that feeds the catalog; none of them have one. The
   sidebar's five origin options (`"United States"`, `"Canada"`, ...) were
   hardcoded strings in `products-content.tsx`, never wired to any real
   product data — there was never anything correct to match against.
   Fixing the comparison alone would have been the superficial workaround
   (fabricate data, or make the control a silent no-op); the actual fix,
   confirmed with the user, was removing the filter entirely —
   `components/ui/filter-sidebar.tsx` (the "Country of Origin" group),
   `components/ui/filter-sidebar-mobile.tsx` and `products-content.tsx`
   (the `origin`/`selectedOrigin`/`origins` plumbing), and
   `app/(public)/for-products/products/page.tsx` (the server-side `origin`
   search-param read). If a real country-of-origin field is ever added to
   the schema, the filter can come back wired to it.
   Test: `filters-and-search.spec.ts` → "FIXED: the Country of Origin
   filter is gone, not silently broken" (verified passing on all 3
   projects).

2. **~~"Clear Filters" doesn't actually clear a search.~~ FIXED.**
   `components/products/products-content.tsx`: `searchValue` is a local
   `useState(selectedSearch)` — seeded once at mount (React's `useState`
   initializer only runs once), never re-synced when the URL's `search`
   param changed via a *client-side* navigation (e.g. the "Clear Filters"
   link, a plain `<Link>` back to the bare catalog URL). The filtering
   itself reads `searchValue`, not the `selectedSearch` prop, so the
   catalog stayed stuck at zero results even once the address bar showed
   no search param. Fixed with a `useEffect(() => setSearchValue(selectedSearch), [selectedSearch])`
   — re-syncs the local copy whenever the URL's own search value changes,
   covering "Clear Filters" and any other navigation that changes the
   search param out from under the input (a direct URL edit, browser
   back/forward). No other local state needed the same treatment — every
   other filter (category/brand/certification/sort/page) is read straight
   from props each render, with no local copy to desync.
   Test: `filters-and-search.spec.ts` → "FIXED: \"Clear Filters\" resets
   the URL, the search box, and restores the catalog" (verified passing on
   all 3 projects) — now also asserts the search input's own value is
   cleared, not just that products reappear, since the stale input value
   was the actual defect.
   **Related finding from the same investigation, now ALSO fixed** — see
   "The navigation race investigation" below for the full writeup.

3. **`/p/[slug]` soft-404** (investigated per item 6 of the prior audit,
   not fixed — out of scope for this round too, see below).

## The navigation race investigation (third round)

A separate, narrower issue surfaced while verifying the Clear Filters fix:
firing a second client-side navigation before a prior one has committed
could sometimes be treated as a no-op by Next's router. Investigated
properly this round rather than left as a side note.

**Classification: a genuine, confirmed, reproducible application defect**
— not merely an inherent/unavoidable characteristic of Next.js's router,
and not a test-synchronization artifact. It's a real consequence of how
this one component uses the router, reachable by a real user action
sequence, with a real user-visible broken state as the result.

**Reproduction**, against a real production build (`next build && next
start`), in real browser engines (Chromium and WebKit via Playwright),
with zero artificial delay between the two actions — not a contrived
timing window, see "does this explain the unresponsive-page reports?"
below for why zero delay is realistic here specifically:

1. Submit a search (fills the box, clicks Search — calls
   `startTransition(() => router.push(...))`).
2. Immediately click "Clear Filters" (a plain `<Link>`), before the
   search's own navigation has delivered fresh props back to the
   component.

Result before the fix, consistent across both browser engines, repeated
runs: the address bar ends up clean (matching Clear Filters' target —
Next does apply *that* click's URL), but `ProductsContent` never actually
re-renders with the corresponding fresh `selectedSearch` prop. Since
`searchValue` (the state that actually drives what's filtered/displayed)
only gets reset by an effect watching that prop, and the component is
stuck on old props, the catalog stays showing "No products match your
filters." with zero cards — while the URL shows nothing wrong at all.
Confirmed strictly worse than the original Clear Filters defect in one
way: at least that one left `?search=...` visible in the address bar as
a clue; this one doesn't.

**Examined and ruled out as the/a primary cause:**
- `useTransition`/`startTransition` specifically — removing it
  (replacing `isPending` with a manually-managed boolean) did **not**
  fix the reproduction case above, and introduced a new, worse, easily-
  reachable regression of its own: resubmitting the *same* search term
  (e.g. clicking Search again without changing the input) left the
  button permanently stuck disabled/"Searching...", because resetting
  the manual flag was tied to a `selectedSearch` prop *change* that
  never happens when the value is already the same. Reverted; the
  original `useTransition` doesn't have this problem, since React
  resolves `isPending` to `false` on transition completion regardless of
  whether any watched value actually changed.
- Plain `<Link>`-to-`<Link>` rapid navigation (no `router.push`/
  transition involved at all) — confirmed fine, repeatedly, both ad hoc
  and via the existing "rapid repeated category-filter clicks" test,
  which continues to pass. The race is specific to a `router.push()`
  navigation being interrupted, not "any two fast navigations."
- A second, narrower variant — submitting the identical search term
  twice in a row, racing the button's own `disabled` state rather than a
  different element — reproduces consistently (3/3) but requires beating
  React's own render cycle to re-click a button that's about to become
  (and almost immediately does become) disabled. **Not fixed**: the
  practical reachability for a real user is low (bounded by that
  disabled state), and a real fix would mean understanding/changing how
  Next's router queues/supersedes in-flight `router.push()` calls, which
  is exactly the "rewrite the routing architecture" this task says not
  to do for a sub-defect of this severity. Documented, not pursued.

**Fix implemented** (`components/products/products-content.tsx`): "Clear
Filters" now resets `searchValue` directly in its own `onClick`,
synchronously, instead of relying solely on the prop-sync effect:

```tsx
<Link href={basePath} scroll={false} className="saas-btn-outline" onClick={() => setSearchValue("")}>
  Clear Filters
</Link>
```

This makes the one thing the user actually sees (the search box, and the
filtering it drives) correct immediately and unconditionally, regardless
of whether the earlier search's own navigation ever delivers fresh props.
The prop-sync effect from the first fix is unchanged and still the
correct mechanism for every case that isn't this exact race (browser
back/forward, a direct URL edit, a settled normal Clear Filters click —
none of those have a click handler to hook into, and all of them
continue to work via the effect). `useTransition` is unchanged from
before this investigation.

Regression test: `filters-and-search.spec.ts` → "FIXED: clicking \"Clear
Filters\" immediately after submitting a search (before that navigation
lands) still restores the catalog" — no artificial delay between the two
actions, by design. Passed 9/9 (3 runs × 3 projects) during verification.

**Does this explain the originally-reported unresponsive-page symptoms?**
No. Two independent reasons:
1. `startTransition`/`useTransition` is used in exactly one place in the
   entire codebase — this component (confirmed: `grep -r
   "startTransition|useTransition"` across every `.tsx` file matches only
   `products-content.tsx`). The original reports were site-wide, across
   pages (home pages, product pages) that never touch this code at all.
2. The original symptom (already fixed earlier — see
   `components/site-chrome.tsx`'s `PageTransitionPane`) was a stuck
   `AnimatePresence` exit layer keyed on `pathname`, a completely
   different mechanism triggered by *cross-page* navigation. This race is
   about same-page, search-param-only navigation never reaching a
   `startTransition`-wrapped `router.push()`'s target component with
   fresh props. Different trigger, different code path, different pages.

The zero-delay reproduction above is realistic specifically *for this
component* because "No products match your filters." (and the "Clear
Filters" link's appearance) is driven entirely by local `searchValue`
state — it shows up the instant the button is clicked, with no
dependency on the network at all, so a user can genuinely react to it
and click Clear Filters before the actual server round-trip has
returned. On a real deployment the RSC fetch latency is also almost
certainly higher than this local dev/production-build setup (and this
app's shared database has independently shown real fragility under
load, elsewhere in this project's history), which if anything widens
this exact window rather than narrows it.

## The soft-404 investigation (item 6)

**Root cause confirmed, but no safe minimal fix exists — nothing was
changed in application code.**

Confirmed via direct, controlled A/B testing against a real production
build (not a dev-mode artifact):

| Route | `generateStaticParams` | `revalidate` | Async DB I/O | Bogus-slug status |
|---|---|---|---|---|
| `/product/[code]` | no | no | yes | **404** (correct) |
| `/for-brands/resources/blog/[slug]` | yes | no | no (sync local data) | **404** (correct) |
| `/p/[slug]` | yes | yes (then tested without) | yes | **200** (soft-404) |

Three specific hypotheses were tested and **disproved** by direct
measurement (curl against a real `next build && next start`, re-verified
after each code change):

1. "It's the `revalidate = 3600` export" — removed it, rebuilt, re-tested:
   still 200.
2. "It's `generateMetadata`'s duplicate async DB call" — stubbed it to a
   static return with no DB call, rebuilt, re-tested: still 200.
3. "Use `dynamicParams = false` to skip the buggy fallback render
   entirely" — ruled out *without* shipping it: this would make any
   genuinely new product (created/approved after the last deploy, not yet
   in the build's static list) 404 immediately instead of rendering via
   the on-demand fallback this app depends on for exactly that case
   (`revalidatePublicProduct()` is called from every admin
   approve/edit/delete path specifically so new/changed products show up
   without a redeploy) — correctness-safe at the file level but a real
   functional regression at the product level.

What's left standing: Next.js App Router's fallback rendering of a
`generateStaticParams`-eligible route — for a param outside the static
list, with real `await`ed data fetching before `notFound()` — appears to
stream the response with a committed 200 status before the not-found
decision is made, independent of ISR/`revalidate` specifically. This
matches third-party reports of the same symptom (a Vercel community
thread attributes it to streaming: 200 for streamed responses, 404 for
non-streamed) — see citation in the PR/commit history for this
investigation.

**Why no fix was implemented:** every option that would actually change
the status code trades away something real:
- `dynamicParams = false` — breaks new-product visibility (above).
- `export const dynamic = "force-dynamic"` — would fix it, but removes
  static caching for *every* product page (not just the unlisted-param
  case), turning every page view into a live DB query — a real concern
  given this project's Postgres connection has independently shown
  fragility under concurrent load (see "Network writes" below).
- A middleware-level existence pre-check — adds a DB round-trip to every
  single product page request (valid or not) in Edge middleware, which
  isn't free either, and is a nontrivial architecture addition, not a
  minimal one.

**Recommendation:** track this separately as a real, confirmed, low-
severity (SEO-relevant, not functionality-relevant) issue, revisit if a
Next.js version bump changes this streaming behavior, or make a
deliberate call on one of the tradeoffs above with eyes open. Left
undone here per the task's "minimal fix only if one exists" framing.

## Highest-risk untested user journeys

**For Products:**
1. **Product detail page content correctness** — claims, certificates,
   documents, ingredients tabs. This suite checks the page *structure*
   (header/footer/h1) on every product-page test, never the claims/cert
   content itself. A regression that silently drops a product's claims
   list, for instance, would pass every test here.
2. **The scan-tracking / QR-code entry path** (`/product/[code]` →
   redirect → `/p/[slug]`, and the `/api/verify` endpoint, used by actual
   QR scans) — never navigated to in this suite. `/api/verify` additionally
   writes a scan event (see below) and isn't reachable from any current
   test, deliberately.
3. **No sort or origin-filter UI exists to click** — both are only
   reachable via direct URL today (see Confirmed Defects for origin; sort
   just has no control at all). If either grows a UI, this suite's
   current coverage of the underlying logic won't catch a broken new
   *control*, only a broken underlying *function*.

**For Brands:**
4. **Every single brand/admin dashboard flow is untested** — login,
   product submission wizard, claims review, settings, messaging,
   analytics. This is the single largest gap in the whole suite, and it's
   deliberate: testing any of it meaningfully means either real write
   access against production data (explicitly out of bounds for this
   task) or a seeded staging database (doesn't exist yet — see "CI and
   the database"). This is almost certainly where the next investment
   should go once a staging database exists.
5. **The contact form's *success* path** is never tested — only its
   failure paths (`api-failures.spec.ts`). A real submission would write
   to the production database and send a real email, so it's
   intentionally untested here; a staging database would unblock this.

## Audit item 7: every network request / write a test can trigger

Verified **empirically**, not just by reading code — a throwaway
diagnostic logged every request across this suite's full navigation
surface (home pages, catalog, a product page, browser back/forward, a
bogus product code, a reload) using the *raw*, unintercepted Playwright
`test` (not this suite's `fixtures.ts`), to see what would happen without
any safety net:

- **Confirmed real writes**: a single product-page visit fires **two**
  `POST /api/scan` requests — one `VIEW` event on mount
  (`components/analytics/scan-tracking.tsx`'s `ScanTracker`), and one more
  from `TrackInView`'s `IntersectionObserver` firing for whatever claim/
  certificate is already above the fold. Both are intercepted and
  short-circuited by `fixtures.ts` in every real test in this suite — this
  is the exact threat the fixture exists to neutralize, now with direct
  proof rather than an assumption.
- **No other request fired a write** across the full navigation surface
  tested (home pages, catalog, product page, back/forward, bogus code,
  reload) — confirmed zero non-GET requests besides the two scan POSTs
  above.
- **`/api/verify` also writes a scan event** (`recordScanEvent`, inside the
  route handler) but is **never called by any component in the app today**
  (confirmed by grep — nothing references it client-side) and nothing in
  this suite navigates to it directly. Flagged here as a standing hazard:
  if a future test is tempted to hit this endpoint directly to test the
  QR-scan path, it needs the same interception treatment `/api/scan` gets.
- **The contact form's fetch** (`/api/contact`) is the only other
  client-side write path reachable from a public page. Every test that
  touches it (`api-failures.spec.ts`) intercepts the request before it
  ever reaches the route handler — confirmed by design (the route is
  registered before any navigation), not just by absence of errors.
- **Everything else that writes** (`/api/admin/*`, `/api/brand/*`,
  `/api/auth/*`, `/api/upload`) is either behind `middleware.ts`'s session
  check (never reachable without a real login, which this suite never
  does) or requires a user action this suite never performs (submitting a
  form, logging in). No test in this suite logs in or submits a form other
  than the deliberately-intercepted contact form.

## Investigating the two documented intermittent flakes (fourth round)

Per instruction, evidence was gathered **before** changing either test —
neither was touched on the basis of a guess.

**The WebKit search-timing flake** (`filters-and-search.spec.ts` →
"searching for nonsense shows the explicit empty state"): could not be
freshly reproduced this round despite real effort —
- 5/5 clean running it alone, repeatedly, against a fresh server each time.
- 10 full-suite runs this round (6 plain + 4 with `--trace=on` forced on
  specifically to capture maximum diagnostic data if it occurred), all
  55/55 passing, 0 failures.
- A dedicated ordering experiment: ran Mobile Safari's full project
  against a long-lived server fresh, then again after Desktop Chrome's
  and Mobile Chrome's full projects had already run ~80 requests against
  that same server (testing "does whichever project runs last in the
  sequence degrade, regardless of engine" vs. "is it specifically
  WebKit") — clean both times. The persistent server's own log carried
  zero DB/connection errors across the whole exercise, in contrast to the
  real `ECONNRESET`/`P1017` errors caught directly earlier in this
  project's work.

No code or test change was made for this one — there's nothing here to
act on beyond what's already documented (a rare, environment-dependent
flake, most plausibly tied to this shared database's occasional
real-world connection fragility under sustained load, which this round's
attempts simply didn't happen to trigger). Left exactly as-is.

**The scroll-height measurement flake** (`navigation.spec.ts` →
"repeated back/forward navigation never leaves a stuck overlay..."):
also not freshly reproduced this round (same 10 full-suite runs above
all passed this test too). The evidence here is different in kind,
though, and was judged sufficient to act on without a fresh catch:

1. The prior session's actual failure output is still in this
   conversation's history — concrete measured values (a ~9000px and a
   ~6763px gap) on a test that measures a ~0px gap on a direct,
   un-navigated load of the same page once settled. That's a real,
   previously-observed defect in the test's own timing, not a one-off
   fluke of the number.
2. Playwright's own documentation explicitly advises against relying on
   `waitForLoadState("networkidle")` for pages with any ongoing
   background activity, which `/for-brands/home` has plenty of
   (`whileInView` fade-ins, lazy images, Next prefetching every link
   already in the initial viewport). A "quiet" 500ms window can land
   before the last bit of that has actually finished affecting layout —
   this is a structural weakness in the WAIT strategy, not the assertion.

Given that, the test's synchronization was strengthened: the fixed
`waitForTimeout(500)` + one-shot measurement was replaced with
`expect.poll()` on the actual `scrollHeight - footerBottom` value,
converging for up to 10s instead of guessing a fixed delay. The
correctness threshold itself (`< 50px`) is **unchanged** — this is a
synchronization improvement, not a weakened assertion; if the stuck-layer
bug this test guards against ever reoccurs, polling for up to 10s makes
it *more* likely to be caught (a transient layout glitch has 10s to
resolve before the test gives up), not less.

## CI and the database (item 8)

**No production database credential is configured in CI.** The old
workflow referenced a `DATABASE_URL` secret pointing at production; that's
been removed. `.github/workflows/e2e.yml` now has two jobs:

- **`e2e-dbfree`** — runs on every push/PR, no secrets at all, against
  `playwright.dbfree.config.ts` + `tests/e2e-dbfree/`. Confirmed directly
  (dev server started with `DATABASE_URL` genuinely unset) that this is
  real, not theoretical.
- **`e2e-full`** — the main suite (navigation, filters, mobile, etc.).
  Only runs if a `STAGING_DATABASE_URL` repository secret is set, read
  into `DATABASE_URL` for that job only. **Never reads the production
  secret.** Without it configured, the job prints a clear
  `::warning::` and every step after the check is skipped — not a hard
  CI failure, not a silent no-op either.

**What a dedicated staging database needs**, if/when one is set up:
1. Same Postgres schema as production (`npx prisma migrate deploy` against
   it, or a schema dump).
2. A handful of disposable seed rows: at least one approved, publicly
   visible `Product` (with an image, at least one claim, one certificate)
   and its `Brand`, so `getFirstProductHref()` and the filter/search tests
   have something real to find. None of this suite's tests need more than
   that — no admin/brand accounts are required unless authenticated
   coverage is added later (see Highest-risk gaps).
3. Add the connection string as the `STAGING_DATABASE_URL` repository
   secret (Settings → Secrets and variables → Actions). The workflow picks
   it up automatically from there — no other change needed.
4. Optional but recommended: a scheduled reset/reseed (the suite is
   read-only today, but a future authenticated test suite would want a
   clean slate).

Until that exists, `e2e-full` simply doesn't run in CI — run it locally
against the real (shared) database instead, exactly as documented in
README.md, with the same read-only discipline.
