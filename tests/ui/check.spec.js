import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, build, status, PUZZLES } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await start(page);
});

test("Check.01, Check.02 the status line says what is left to do", async ({ page }) => {
  await openPuzzle(page, 2);
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  await clickBond(page, "1,1", "2,1");
  await expect(status(page)).toHaveText("3 atoms still need bonds.");
});

test("Check.03 every Atom complete, but in two pieces", async ({ page }) => {
  await openPuzzle(page, 5); // Methanol: . H . / O C H / H H .
  await clickBond(page, "3,1", "3,2"); // H–H
  await clickBond(page, "2,1", "2,2", { times: 2 }); // O=C
  await clickBond(page, "1,2", "2,2"); // C–H
  await clickBond(page, "2,2", "2,3"); // C–H
  await expect(status(page)).toHaveText("Every atom has its bonds, but they form more than one molecule. Everything must join up.");
  await expect(status(page)).toHaveClass("warn");
});

test("Check.04 building the molecule solves the puzzle and names it", async ({ page }) => {
  await openPuzzle(page, 11);
  await build(page, PUZZLES[10]);
  await expect(status(page)).toHaveText("✓ Solved! It's Glycine.");
  await expect(page.locator("#board")).toHaveClass(/\bsolved\b/);
  await expect(page.getByRole("complementary")).toMatchAriaSnapshot(`
    - complementary:
      - navigation "Puzzle":
        - button "Previous puzzle"
        - text: Puzzle 11 of 13
        - button "Next puzzle"
        - text: ✓ Solved
      - text: Mystery molecule
      - heading "Glycine" [level=1]
      - text: C
      - subscript: "2"
      - text: H
      - subscript: "5"
      - text: "NO"
      - subscript: "2"
      - paragraph: Glycine is the simplest amino acid, one of the building blocks of proteins. Traces have even been found in samples from comets.
      - button "Next puzzle →"
  `);
  await expect(page.locator("#score")).toHaveText("Solved 1 of 13");
  await page.getByRole("button", { name: "Next puzzle →" }).click();
  await expect(page.locator("#counter")).toHaveText("Puzzle 12 of 13");
});

test("Check.04 the last puzzle has no Next puzzle button", async ({ page }) => {
  await openPuzzle(page, 13);
  await build(page, PUZZLES[12]);
  await expect(status(page)).toHaveText("✓ Solved! It's Alanine.");
  await expect(page.getByRole("button", { name: "Next puzzle →" })).toBeHidden();
});

test("Help.01 Show solution asks first, then shows the molecule as seen", async ({ page }) => {
  await openPuzzle(page, 9);
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  page.once("dialog", dialog => {
    expect(dialog.message()).toBe("Show the solution?");
    dialog.accept();
  });
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Here is Urea. Reset and build it yourself to mark it solved.");
  await expect(page.locator("#badge")).toHaveText("Solution seen");
  await expect(page.getByRole("button", { name: "Puzzle 9: Urea, solution seen" })).toBeVisible();
});

test("Help.02 after Reset, building it marks it solved", async ({ page }) => {
  await openPuzzle(page, 9);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await page.getByRole("button", { name: "Reset" }).click();
  await build(page, PUZZLES[8]);
  await expect(status(page)).toHaveText("✓ Solved! It's Urea.");
  await expect(page.locator("#badge")).toHaveText("✓ Solved");
});
