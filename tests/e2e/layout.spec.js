import { test, expect } from "@playwright/test";
import { start, clickBond, bond, openPuzzle } from "./helpers.js";

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
  await clickBond(page, "1,1", "2,1", { tap: true });
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("C 1,1 to C 2,1: single bond");
});

for (const [number, name, board] of [[12, "Glucose's, the widest", "Board, 3 by 5"], [13, "Citric acid's, the tallest", "Board, 6 by 3"], [14, "N-Acetylglucosamine's, the largest", "Board, 5 by 5"]])
  test(`Layout.01, Puzzle.04 on a phone, the largest Grids fit: ${name}, with no sideways scroll, and the Board and its status line fit the screen`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "phone only");
    await start(page);
    await openPuzzle(page, number);
    await expect(page.getByRole("group", { name: board })).toBeVisible();
    const { width, height } = page.viewportSize();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const stage = await page.locator(".stage").boundingBox();
    const status = await page.getByRole("status").boundingBox();
    expect(status.y + status.height - stage.y).toBeLessThanOrEqual(height);
  });
