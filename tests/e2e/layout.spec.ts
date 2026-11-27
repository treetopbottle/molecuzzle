import { test, expect } from "@playwright/test";
import { start, box, viewport } from "./helpers.ts";

test("Layout.01 wide screens have the Board left of the panel, narrow ones above it", async ({ page }) => {
  await start(page);
  const board = await box(page.locator(".stage"));
  const panel = await box(page.locator(".panel"));
  const width = viewport(page).width;
  if (width > 820) expect(board.x + board.width).toBeLessThanOrEqual(panel.x);
  else expect(board.y + board.height).toBeLessThanOrEqual(panel.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
});
