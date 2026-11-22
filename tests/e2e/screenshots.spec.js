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

  test("Page.01 Puzzle 3 solved", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 3);
    await build(page, PUZZLES[2]);
    await expect(page).toHaveScreenshot("page-solved.png", { fullPage: true });
  });

  test("Board.01, Board.02 Acetic acid with C═O", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 2);
    await clickBond(page, "1,2", "2,2", { times: 2 });
    await expect(page.locator(".stage")).toHaveScreenshot("board.png");
  });

  test("Board.01, Board.02 Glucose with no Bonds", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 12);
    await expect(page.locator(".stage")).toHaveScreenshot("board-glucose.png");
  });

  test("Input.03 the actions, with Bonds and something to undo", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 2);
    await clickBond(page, "2,1", "2,2");
    await expect(page.locator(".actions")).toHaveScreenshot("actions.png");
  });

  test("Panel.01, Panel.02, Panel.04 the panel of Puzzle 2, unsolved", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 2);
    await page.mouse.move(0, 0); // no button hovered when the panel scrolls into view
    await expect(page.locator(".panel")).toHaveScreenshot("panel-mystery.png");
  });

  test("Panel.01, Panel.03 the panel of Puzzle 3, solved", async ({ page }) => {
    await start(page);
    await openPuzzle(page, 3);
    await build(page, PUZZLES[2]);
    await page.mouse.move(0, 0);
    await expect(page.locator(".panel")).toHaveScreenshot("panel-solved.png");
  });

  test("List.01 the Puzzles list, with 1 solved and 3 open", async ({ page }) => {
    await start(page, { puzzles: { acetonitrile: "solved" }, current: "glycine" });
    await expect(page.locator("#puzzles").locator("..")).toHaveScreenshot("list.png");
  });

  test("Board.01, Board.03 with reduced motion, the solved Atoms don't pulse; their hydrogens never do", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await start(page);
    await build(page, PUZZLES[0]);
    await expect(page.locator("#board")).toHaveClass(/\bpulse\b/);
    const animations = () => page.locator("#board .atom .body").evaluateAll(els => els.map(e => getComputedStyle(e).animationName));
    expect(await animations()).toEqual(["none", "none", "none"]);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(await animations()).toEqual(["pulse", "pulse", "pulse"]);
    const hydrogens = () => page.locator("#board .hydrogen *").evaluateAll(els => els.map(e => getComputedStyle(e).animationName));
    expect(await hydrogens()).toEqual(Array(6).fill("none")); // 3 balls and their H, on the CH₃
    const glows = () => page.locator("#board .hydrogen circle").evaluateAll(els => els.map(e => getComputedStyle(e).filter));
    expect(await glows()).toEqual(Array(3).fill("none"));
  });
});

test.describe("on a phone, at 390×844", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("Layout.01 the Board above the panel", async ({ page }) => {
    await start(page);
    await expect(page).toHaveScreenshot("page-phone.png", { fullPage: true });
  });
});
