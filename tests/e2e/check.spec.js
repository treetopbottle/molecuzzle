import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, build, status, colors, isGreen, isOrange, PUZZLES } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await start(page);
});

test("Messages.01 the status line says what is left to do", async ({ page }) => {
  await openPuzzle(page, 2);
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  await clickBond(page, "1,1", "2,1");
  await expect(status(page)).toHaveText("3 atoms still need bonds.");
});

test("Messages.01 every Atom complete, but in two pieces, in orange", async ({ page }) => {
  await openPuzzle(page, 5); // Methanol: . H . / O C H / H H .
  await clickBond(page, "3,1", "3,2"); // H–H
  await clickBond(page, "2,1", "2,2", { times: 2 }); // O=C
  await clickBond(page, "1,2", "2,2"); // C–H
  await clickBond(page, "2,2", "2,3"); // C–H
  await expect(status(page)).toHaveText("Every atom has its bonds, but they form more than one molecule. Everything must join up.");
  expect((await colors(status(page))).every(isOrange)).toBe(true);
});

test("Board.03, Messages.01, Panel.01, Panel.03, List.02, Progress.01 building the molecule solves the puzzle and names it", async ({ page }) => {
  await openPuzzle(page, 11);
  await build(page, PUZZLES[10]);
  await expect(status(page)).toHaveText("✓ Solved! It's Glycine.");
  await expect(page.locator("#board")).toHaveClass(/\bsolved\b/);
  await expect(page.getByRole("complementary")).toMatchAriaSnapshot(`
    - complementary:
      - navigation "Puzzle":
        - button "Previous puzzle"
        - text: Puzzle 11 of 21
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
  await expect(page.locator("#score")).toHaveText("Solved 1 of 21");
  await page.getByRole("button", { name: "Next puzzle →" }).click();
  await expect(page.locator("#counter")).toHaveText("Puzzle 12 of 21");
});

test("Messages.01 the status line is green when solved and when revealed", async ({ page }) => {
  await openPuzzle(page, 1);
  expect((await colors(status(page))).some(c => isGreen(c) || isOrange(c))).toBe(false);
  await build(page, PUZZLES[0]);
  await expect(status(page)).toHaveText("✓ Solved! It's Water.");
  expect((await colors(status(page))).every(isGreen)).toBe(true);
  await openPuzzle(page, 2);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Here is Ammonia. Reset and build it yourself to mark it solved.");
  expect((await colors(status(page))).every(isGreen)).toBe(true);
});

test("Panel.03 the last puzzle has no Next puzzle button", async ({ page }) => {
  await openPuzzle(page, 21);
  await build(page, PUZZLES[20]);
  await expect(status(page)).toHaveText("✓ Solved! It's Halothane.");
  await expect(page.getByRole("button", { name: "Next puzzle →" })).toBeHidden();
});

test("Input.04, Messages.01, Panel.01, List.01, List.02 Show solution asks first, then shows the molecule, still unsolved", async ({ page }) => {
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
  await expect(page.locator("#badge")).toHaveText("Unsolved");
  await expect(page.getByRole("button", { name: "Puzzle 9", exact: true })).toBeVisible();
  await expect(page.locator("#score")).toHaveText("Solved 0 of 21");
});

test("Messages.01, Panel.01, List.02 Show solution on a solved puzzle keeps it solved", async ({ page }) => {
  await start(page, { puzzles: { urea: "solved" }, current: "urea" });
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Here is Urea. Reset and build it yourself to mark it solved.");
  await expect(page.locator("#badge")).toHaveText("✓ Solved");
  await expect(page.locator("#score")).toHaveText("Solved 1 of 21");
});

test("Messages.01, Panel.01 after Reset, building it marks it solved", async ({ page }) => {
  await openPuzzle(page, 9);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset" }).click();
  await build(page, PUZZLES[8]);
  await expect(status(page)).toHaveText("✓ Solved! It's Urea.");
  await expect(page.locator("#badge")).toHaveText("✓ Solved");
});

test("Board.03 a solved Puzzle that opens again doesn't pulse, also right after solving another", async ({ page }) => {
  await openPuzzle(page, 4);
  await build(page, PUZZLES[3]);
  await openPuzzle(page, 1);
  await build(page, PUZZLES[0]);
  await expect(page.locator("#board")).toHaveClass(/\bpulse\b/);
  await openPuzzle(page, 4);
  await expect(status(page)).toHaveText("✓ Solved! It's Hydrogen cyanide.");
  await expect(page.locator("#board")).toHaveClass(/\bsolved\b/);
  await expect(page.locator("#board")).not.toHaveClass(/\bpulse\b/);
});
