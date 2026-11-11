import { defineConfig } from "@playwright/test";

// Uses Playwright's own Chromium (npx playwright install chromium), or the
// browser at CHROMIUM_PATH, e.g. CHROMIUM_PATH=/usr/bin/chromium.
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

export default defineConfig({
  testDir: "tests/ui",
  globalSetup: "./tests/ui/build.js",
  fullyParallel: true,
  reporter: process.env.CI ? "dot" : "list",
  use: { launchOptions, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "phone", testMatch: /layout\.spec\.js/, use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
