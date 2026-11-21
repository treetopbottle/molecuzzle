// The screenshots of docs/spec/ui.md, compared pixel for pixel. Only
// scripts/screenshots.sh runs these, in Playwright's image (decision 0013).
import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, build, PUZZLES } from "./helpers.js";

test.describe("at 1280×800", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("Page.01 Puzzle 1 at the start", async ({ page }) => {
    await start(page);
    await expect(page).toHaveScreenshot("page-start.png", { fullPage: true });
  });

  test("Page.01 Puzzle 11 solved", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 11);
    await build(page, PUZZLES[10]);
    await expect(page).toHaveScreenshot("page-solved.png", { fullPage: true });
  });

  test("Board.01, Board.02 Formaldehyde with C═O", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 3);
    await clickBond(page, "2,1", "3,1", { times: 2 });
    await expect(page.locator(".stage")).toHaveScreenshot("board.png");
  });

  test("Input.03 the actions, with Bonds and something to undo", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 2);
    await clickBond(page, "1,1", "2,1");
    await expect(page.locator(".actions")).toHaveScreenshot("actions.png");
  });

  test("Panel.01, Panel.02, Panel.04 the panel of Puzzle 3, unsolved", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 3);
    await expect(page.locator(".panel")).toHaveScreenshot("panel-mystery.png");
  });

  test("Panel.01, Panel.03 the panel of Puzzle 11, solved", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 11);
    await build(page, PUZZLES[10]);
    await expect(page.locator(".panel")).toHaveScreenshot("panel-solved.png");
  });

  test("List.01 the Puzzles list, with 1 solved and 3 open", async ({ page }) => {
    await start(page, { puzzles: { water: "solved" }, current: "formaldehyde" });
    await expect(page.locator("#puzzles").locator("..")).toHaveScreenshot("list.png");
  });

  test("Board.03 with reduced motion, the solved Atoms don't pulse", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await start(page);
    await build(page, PUZZLES[0]);
    await expect(page.locator("#board")).toHaveClass(/\bpulse\b/);
    const animations = () => page.locator("#board .atom .body").evaluateAll(els => els.map(e => getComputedStyle(e).animationName));
    expect(await animations()).toEqual(["none", "none", "none"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await animations()).toEqual(["pulse", "pulse", "pulse"]);
  });
});

test.describe("on a phone, at 390×844", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("Layout.01 the Board above the panel", async ({ page }) => {
    await start(page);
    await expect(page).toHaveScreenshot("page-phone.png", { fullPage: true });
  });
});
