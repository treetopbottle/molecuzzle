// The "First day" narrative from docs/spec/narratives.md, end to end.
import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, build, status, bond, PUZZLES } from "./helpers.ts";

test("First day", async ({ page }) => {
  // Noor opens Molecuzzle: Puzzle 1, a mystery molecule of three atoms in a
  // column, a C with three small hydrogens, another C and an N.
  await start(page);
  await expect(page.locator("#counter")).toHaveText("Puzzle 1 of 30");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("?");
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  await expect(page.getByRole("group", { name: "Board, 3 by 1" })).toMatchAriaSnapshot(`
    - 'button "C 1,1 to C 2,1: no bond"'
    - 'button "C 2,1 to N 3,1: no bond"'
    - 'img "Carbon 1,1, with 3 hydrogens"'
    - 'img "Carbon 2,1"'
    - 'img "Nitrogen 3,1"'
  `);
  await expect(page.locator("#board .hydrogen")).toHaveCount(3);

  // The top dotted line, then three clicks for a triple Bond, and it is Acetonitrile.
  await clickBond(page, "1,1", "2,1");
  await expect(status(page)).toHaveText("Not every atom has the right number of bonds yet.");
  await expect(page.locator("#counts")).toHaveText("Bonds 1 of 4");
  await clickBond(page, "2,1", "3,1", { times: 3 });
  await expect(status(page)).toHaveText("✓ Solved! It's Acetonitrile.");
  await expect(page.locator("#counts")).toHaveText("Bonds 4 of 4");
  await expect(page.locator("#board .atom.ok")).toHaveCount(0); // no glow
  await expect(page.getByText(PUZZLES[0].fact)).toBeVisible();

  // Next puzzle brings Acetic acid: the line between C and O takes two clicks.
  await page.getByRole("button", { name: "Next puzzle →" }).click();
  await clickBond(page, "1,2", "2,2", { times: 2 });
  await expect(bond(page, "1,2", "2,2")).toHaveAccessibleName("O 1,2 to C 2,2: double bond");
  await clickBond(page, "2,1", "2,2");
  await clickBond(page, "2,2", "3,2");
  await expect(status(page)).toHaveText("✓ Solved! It's Acetic acid.");

  // On Serine, an OH can be bonded twice, which gives it one bond too many.
  await openPuzzle(page, 8);
  await clickBond(page, "1,2", "2,2");
  await clickBond(page, "1,1", "1,2");
  await expect(page.getByRole("alert")).toHaveText("");
  await expect(page.locator("#counts")).not.toContainText("many"); // nothing says the OH has one too many

  // Stuck, Noor looks at the solution, resets, and builds Serine alone.
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(page.locator("#badge")).toHaveText("Unsolved");
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset" }).click();
  await build(page, PUZZLES[7]);
  await expect(page.locator("#badge")).toHaveText("✓ Solved");

  // The next day, in the same browser, the game opens on Puzzle 8, still showing Serine.
  await page.reload();
  await expect(page.locator("#counter")).toHaveText("Puzzle 8 of 30");
  await expect(status(page)).toHaveText("✓ Solved! It's Serine.");
  await expect(page.locator("#score")).toHaveText("Solved 3 of 30");
});
