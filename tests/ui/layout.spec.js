import { test, expect } from "@playwright/test";
import { start, clickBond, bond } from "./helpers.js";

test("Layout.01 wide screens have the Board left of the panel, narrow ones above it", async ({ page }) => {
  await start(page);
  const board = await page.locator(".stage").boundingBox();
  const panel = await page.locator(".panel").boundingBox();
  const width = page.viewportSize().width;
  if (width > 820) expect(board.x + board.width).toBeLessThanOrEqual(panel.x);
  else expect(board.y + board.height).toBeLessThanOrEqual(panel.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
});

test("Layout.02 tapping a dotted line bonds, as a click does", async ({ page, isMobile }) => {
  test.skip(!isMobile, "touch only");
  await start(page);
  await clickBond(page, "1,1", "1,2", { tap: true });
  await expect(bond(page, "1,1", "1,2")).toHaveAccessibleName("H 1,1 to O 1,2: single bond");
});
