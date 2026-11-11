import { test, expect } from "@playwright/test";
import { start, openPuzzle, build, PUZZLES, storedProgress } from "./helpers.js";

test("Puzzle.02 a puzzle starts with no Bonds and its name hidden", async ({ page }) => {
  await start(page);
  await openPuzzle(page, 3);
  await expect(page.getByRole("complementary")).toMatchAriaSnapshot(`
    - complementary:
      - navigation "Puzzle":
        - button "Previous puzzle"
        - text: Puzzle 3 of 13
        - button "Next puzzle"
        - text: Unsolved
      - text: Mystery molecule
      - heading "?" [level=1]
      - text: Bond every atom to find out what it is.
  `);
  await expect(page.getByRole("group", { name: "Board, 3 by 2" })).toMatchAriaSnapshot(`
    - 'button "H 1,1 to C 2,1: no bond"'
    - 'button "C 2,1 to H 2,2: no bond"'
    - 'button "C 2,1 to O 3,1: no bond"'
    - 'img "Hydrogen 1,1: needs 1 more bond"'
    - 'img "Carbon 2,1: needs 4 more bonds"'
    - 'img "Hydrogen 2,2: needs 1 more bond"'
    - 'img "Oxygen 3,1: needs 2 more bonds"'
  `);
});

test("Puzzle.03 any puzzle opens from the list, or with previous and next", async ({ page }) => {
  await start(page);
  await expect(page.locator("#counter")).toHaveText("Puzzle 1 of 13");
  await expect(page.getByRole("button", { name: "Previous puzzle" })).toBeDisabled();
  await page.getByRole("button", { name: "Next puzzle" }).click();
  await expect(page.locator("#counter")).toHaveText("Puzzle 2 of 13");
  await openPuzzle(page, 13);
  await expect(page.getByRole("button", { name: "Next puzzle" })).toBeDisabled();
  await page.getByRole("button", { name: "Previous puzzle" }).click();
  await expect(page.locator("#counter")).toHaveText("Puzzle 12 of 13");
});

test("Puzzle.04, Puzzle.05 the list and the badge show what is solved and seen", async ({ page }) => {
  await start(page, { puzzles: { water: "solved", formaldehyde: "revealed" }, current: "formaldehyde" });
  await expect(page.getByRole("list", { name: "Puzzles" })).toMatchAriaSnapshot(`
    - listitem:
      - 'button "Puzzle 1: Water, solved"'
    - listitem:
      - button "Puzzle 2"
    - listitem:
      - 'button "Puzzle 3: Formaldehyde, solution seen"'
  `);
  await expect(page.getByRole("button", { name: /^Puzzle 3:/ })).toHaveAttribute("aria-current", "true");
  await expect(page.locator("#badge")).toHaveText("Solution seen");
  await expect(page.locator("#score")).toHaveText("Solved 1 of 13");
  await openPuzzle(page, 1);
  await expect(page.locator("#badge")).toHaveText("✓ Solved");
  await openPuzzle(page, 2);
  await expect(page.locator("#badge")).toHaveText("Unsolved");
});

test("Progress.01 solved puzzles and the open puzzle are kept over a reload", async ({ page }) => {
  await start(page);
  await build(page, PUZZLES[0]);
  await openPuzzle(page, 4);
  await page.reload();
  await expect(page.locator("#counter")).toHaveText("Puzzle 4 of 13");
  await expect(page.getByRole("button", { name: "Puzzle 1: Water, solved" })).toBeVisible();
  expect(await storedProgress(page)).toEqual({ puzzles: { water: "solved" }, current: "hydrogen-cyanide" });
});
