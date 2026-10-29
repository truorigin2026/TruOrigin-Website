import { defineConfig, devices } from "@playwright/test";

/**
 * A second, independent Playwright config for pages that genuinely need
 * no database at all — confirmed directly: /terms, /privacy, and
 * /disclaimer render with DATABASE_URL completely unset, because nothing
 * in their render path (or the shared header/footer chrome) touches
 * lib/prisma.ts. Everything else in this app (the product catalog, any
 * product detail page, the brand/admin dashboards) does need the database
 * and belongs in the main suite (playwright.config.ts) instead.
 *
 * This exists so CI can run a real, meaningful check on every push/PR
 * with NO database secret configured at all (see .github/workflows/e2e.yml)
 * — see tests/e2e/README.md for why the main suite can't use a production
 * credential in CI and what a dedicated staging database would need.
 *
 * Deliberately `next dev`, not a production build: a build's
 * generateStaticParams runs for every route in the app, including the
 * DB-dependent ones, so it would need DATABASE_URL anyway even though
 * these specific tests never query it at runtime.
 */
const PORT = process.env.PLAYWRIGHT_DBFREE_PORT ?? "3101";
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e-dbfree",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["html", { open: "never", outputFolder: "playwright-report-dbfree" }], ["github"], ["list"]]
    : [["html", { open: "never", outputFolder: "playwright-report-dbfree" }], ["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      // Deliberately NOT inherited/forwarded even if present in the host
      // shell (e.g. a developer's own .env on their machine) — the point
      // of this suite is to prove these specific pages need no database,
      // and a real-but-unused DATABASE_URL in the environment would let a
      // page that secretly started depending on the DB pass by accident.
      DATABASE_URL: "",
      DIRECT_URL: "",
    },
  },
});
