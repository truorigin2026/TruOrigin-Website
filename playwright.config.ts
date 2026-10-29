import { defineConfig, devices } from "@playwright/test";

/**
 * This project has no separate test/staging database — the dev server
 * these tests drive reads from the same Postgres instance production
 * uses (see .env). Every test MUST stay read-only against app data:
 * navigate and assert, never submit forms, log in, or mutate records.
 * tests/e2e/fixtures.ts additionally blocks the public product page's
 * analytics beacons (/api/scan*) so normal navigation tests don't pollute
 * real view-count analytics the brand/admin dashboards report on.
 */
const PORT = process.env.PLAYWRIGHT_PORT ?? "3100";
// "localhost", not a bare 127.0.0.1 IP: confirmed locally that WebKit's
// private-network-origin access-control checks intermittently reject
// Next.js's background RSC link-prefetch requests against a raw loopback
// IP (an uncaught "due to access control checks" exception, unrelated to
// anything a test actually interacts with) — not reproducible against
// "localhost", and not expected against a real deployed hostname either.
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
// Set by CI after it already ran `npm run build` itself (with its own
// retry around a confirmed, pre-existing transient DB flake during static
// generation — see .github/workflows/e2e.yml) — avoids building twice.
const SKIP_BUILD = process.env.PLAYWRIGHT_SKIP_BUILD === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Confirmed locally, twice, with different symptoms each time: real
  // Prisma ECONNRESET / P1017 "server has closed the connection" errors
  // from this project's shared Postgres connection under concurrent
  // requests, and separately a crashed/unresponsive browser context from
  // running several of this site's shader-heavy pages (WebGL "GPU stall"
  // driver messages) at once. Both are pre-existing environment
  // characteristics, not something these tests can fix, and a regression
  // suite that's slower but doesn't manufacture its own failures is more
  // useful than a faster, flaky one.
  workers: 1,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"], ["list"]]
    : [["html", { open: "never" }], ["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    // Deliberately a production build+start, not `next dev`: confirmed
    // locally that the Turbopack dev server can't keep up with parallel
    // test workers hitting on-demand route compilation at once, and its
    // dev-only HMR client crashes with cross-origin chunk-load errors in
    // WebKit specifically — neither is a real app bug, both go away
    // against a real build.
    command: SKIP_BUILD ? `npm run start -- --port ${PORT}` : `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
