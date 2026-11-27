// @ts-nocheck
import { defineConfig } from "@playwright/test";

// Uses Playwright's own Chromium (npx playwright install chromium), or the
// browser at CHROMIUM_PATH, e.g. CHROMIUM_PATH=/usr/bin/chromium.
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

// scripts/screenshots.sh sets MOLECUZZLE_SCREENSHOTS=1 in Playwright's image
// (decision 0013), and builds the page on the host first. Only then is the
// screenshots project defined, so a run elsewhere doesn't compare or remake the
// screenshots with another browser unless it sets this on purpose.
const screenshots = process.env.MOLECUZZLE_SCREENSHOTS === "1";

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: screenshots ? undefined : "./tests/e2e/build.ts",
  fullyParallel: true,
  reporter: process.env.CI ? "dot" : "list",
  use: { launchOptions, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", testIgnore: /(screenshots|phone)\.spec\.ts/, use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", testMatch: /(layout|phone)\.spec\.ts/, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    ...(screenshots ? [{
      name: "screenshots",
      testMatch: /screenshots\.spec\.ts/,
      snapshotPathTemplate: "docs/spec/screenshots/{arg}{ext}",
      // Playwright's default tolerance, written out.
      expect: { toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 0 } },
    }] : []),
  ],
});
