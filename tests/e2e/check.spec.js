import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, build, status, colors, isGreen, isOrange, PUZZLES } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await start(page);
});

test("Messages.01 the status line says what is left to do: Acetic acid", async ({ page }) => {
  await openPuzzle(page, 2);
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  await clickBond(page, "2,1", "2,2");
  await expect(status(page)).toHaveText("Not every atom has the right number of bonds yet.");
});

test("Messages.01 every Atom complete, but in two pieces, in orange: Glycerol with OH─OH apart", async ({ page }) => {
  await openPuzzle(page, 6);
  await clickBond(page, "1,1", "1,2");
  await clickBond(page, "1,2", "2,2");
  await clickBond(page, "2,1", "2,2", { times: 2 });
  await clickBond(page, "3,1", "3,2");
  await expect(status(page)).toHaveText("Every atom has its bonds, but they form more than one molecule. Everything must join up.");
  expect((await colors(status(page))).every(isOrange)).toBe(true);
});

test("Board.03, Messages.01, Panel.01, Panel.03, List.02, Progress.01 building the molecule solves the puzzle and names it", async ({ page }) => {
  await openPuzzle(page, 3);
  await build(page, PUZZLES[2]);
  await expect(status(page)).toHaveText("✓ Solved! It's Glycine.");
  await expect(page.locator("#board")).toHaveClass(/\bsolved\b/);
  await expect(page.getByRole("complementary")).toMatchAriaSnapshot(`
    - complementary:
      - navigation "Puzzle":
        - button "Previous puzzle"
        - text: Puzzle 3 of 30
        - button "Next puzzle"
        - text: ✓ Solved
      - paragraph: Difficulty 7
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
  await expect(page.locator("#score")).toHaveText("Solved 1 of 30");
  await page.getByRole("button", { name: "Next puzzle →" }).click();
  await expect(page.locator("#counter")).toHaveText("Puzzle 4 of 30");
});

test("Messages.01 the status line is green when solved and when revealed", async ({ page }) => {
  await openPuzzle(page, 1);
  expect((await colors(status(page))).some(c => isGreen(c) || isOrange(c))).toBe(false);
  await build(page, PUZZLES[0]);
  await expect(status(page)).toHaveText("✓ Solved! It's Acetonitrile.");
  expect((await colors(status(page))).every(isGreen)).toBe(true);
  await openPuzzle(page, 2);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Here is Acetic acid. Reset and build it yourself to mark it solved.");
  expect((await colors(status(page))).every(isGreen)).toBe(true);
});

test("Panel.03 the last puzzle has no Next puzzle button", async ({ page }) => {
  await openPuzzle(page, 30);
  await build(page, PUZZLES[29]);
  await expect(status(page)).toHaveText("✓ Solved! It's Prostaglandin E2.");
  await expect(page.getByRole("button", { name: "Next puzzle →" })).toBeHidden();
});

test("Input.04, Messages.01, Panel.01, List.01, List.02 Show solution asks first, then shows the molecule, still unsolved", async ({ page }) => {
  await openPuzzle(page, 7);
  page.once("dialog", dialog => dialog.dismiss());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  page.once("dialog", dialog => {
    expect(dialog.message()).toBe("Show the solution?");
    dialog.accept();
  });
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Here is 1,4-Benzoquinone. Reset and build it yourself to mark it solved.");
  await expect(page.locator("#badge")).toHaveText("Unsolved");
  await expect(page.getByRole("button", { name: "Puzzle 7", exact: true })).toBeVisible();
  await expect(page.locator("#score")).toHaveText("Solved 0 of 30");
});

test("Messages.01, Panel.01, List.02 Show solution on a solved puzzle keeps it solved", async ({ page }) => {
  await start(page, { puzzles: { "1-4-benzoquinone": "solved" }, current: "1-4-benzoquinone" });
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Here is 1,4-Benzoquinone. Reset and build it yourself to mark it solved.");
  await expect(page.locator("#badge")).toHaveText("✓ Solved");
  await expect(page.locator("#score")).toHaveText("Solved 1 of 30");
});

test("Help.01, Help.02, Messages.01, Panel.01 Serine: the solution shown, then Reset, and building it marks it solved", async ({ page }) => {
  await openPuzzle(page, 8);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(status(page)).toHaveText("Here is Serine. Reset and build it yourself to mark it solved.");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset" }).click();
  await build(page, PUZZLES[7]);
  await expect(status(page)).toHaveText("✓ Solved! It's Serine.");
  await expect(page.locator("#badge")).toHaveText("✓ Solved");
});

test("Board.03 a solved Puzzle that opens again doesn't pulse, also right after solving another", async ({ page }) => {
  await openPuzzle(page, 2);
  await build(page, PUZZLES[1]);
  await openPuzzle(page, 1);
  await build(page, PUZZLES[0]);
  await expect(page.locator("#board")).toHaveClass(/\bpulse\b/);
  await openPuzzle(page, 2);
  await expect(status(page)).toHaveText("✓ Solved! It's Acetic acid.");
  await expect(page.locator("#board")).toHaveClass(/\bsolved\b/);
  await expect(page.locator("#board")).not.toHaveClass(/\bpulse\b/);
});
