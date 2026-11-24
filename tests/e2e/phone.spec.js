// Run only by the phone project (playwright.config.js): touch and the small screen.
import { test, expect } from "@playwright/test";
import { start, clickBond, bond, openPuzzle } from "./helpers.js";

test("Layout.02 tapping a dotted line bonds, as a click does", async ({ page }) => {
  await start(page);
  await clickBond(page, "1,1", "2,1", { tap: true });
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("C 1,1 to C 2,1: single bond");
});

test("Panel.05 the key shows every Element's number of bonds, and fits a phone with no sideways scroll", async ({ page }) => {
  await start(page);
  const key = page.locator("#info figure");
  await expect(key).toHaveCount(4);
  await expect(page.getByRole("img", { name: "Carbon: 4 bonds" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Sulfur: 2 bonds" })).toBeVisible();
  const { width } = page.viewportSize();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  const box = await key.last().boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(width);
});

for (const [number, name, board] of [[12, "Glucose's, the widest", "Board, 3 by 5"], [13, "Citric acid's, the tallest", "Board, 6 by 3"], [15, "N-Acetylglucosamine's", "Board, 5 by 5"], [23, "N-Acetylneuraminic acid's", "Board, 6 by 5"], [30, "Prostaglandin E2's, with the most Atoms", "Board, 6 by 5"]])
  test(`Layout.01, Puzzle.04 on a phone, the largest Grids fit: ${name}, with no sideways scroll, and the Board, its status line and its counts fit the screen`, async ({ page }) => {
    await start(page);
    await openPuzzle(page, number);
    await expect(page.getByRole("group", { name: board })).toBeVisible();
    const { width, height } = page.viewportSize();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const stage = await page.locator(".stage").boundingBox();
    const status = await page.getByRole("status").boundingBox(), counts = await page.locator("#counts").boundingBox();
    expect(counts.y).toBeGreaterThanOrEqual(status.y + status.height);
    expect(counts.y + counts.height - stage.y).toBeLessThanOrEqual(height);
  });
