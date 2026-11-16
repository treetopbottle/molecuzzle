import { defineConfig } from "@playwright/test";

// Uses Playwright's own Chromium (npx playwright install chromium), or the
// browser at CHROMIUM_PATH, e.g. CHROMIUM_PATH=/usr/bin/chromium.
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/build.js",
  fullyParallel: true,
  reporter: process.env.CI ? "dot" : "list",
  use: { launchOptions, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", testIgnore: /screenshots\.spec\.js/, use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", testMatch: /layout\.spec\.js/, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    // Only scripts/screenshots.sh runs this one, in Playwright's image (decision 0013).
    // The tolerance is Playwright's default, written out.
    {
      name: "screenshots",
      testMatch: /screenshots\.spec\.js/,
      snapshotPathTemplate: "docs/spec/screenshots/{arg}{ext}",
      expect: { toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 0 } },
    },
  ],
});
