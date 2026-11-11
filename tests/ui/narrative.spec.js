// The "First day" narrative from docs/spec/narratives.md, end to end.
import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, build, status, bond, PUZZLES } from "./helpers.js";

test("First day", async ({ page }) => {
  // Noor opens Molecuzzle: Puzzle 1, a mystery molecule of H, O and H.
  await start(page);
  await expect(page.locator("#counter")).toHaveText("Puzzle 1 of 13");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("?");
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");

  // Two clicks on the dotted lines, and it is Water.
  await clickBond(page, "1,1", "1,2");
  await expect(status(page)).toHaveText("2 atoms still need bonds.");
  await clickBond(page, "1,2", "2,2");
  await expect(status(page)).toHaveText("✓ Solved! It's Water.");
  await expect(page.getByText(PUZZLES[0].fact)).toBeVisible();
  await page.getByRole("button", { name: "Next puzzle →" }).click();
  await build(page, PUZZLES[1]);
  await page.getByRole("button", { name: "Next puzzle →" }).click();

  // Formaldehyde needs a double Bond: click the C–O line twice.
  await clickBond(page, "1,1", "2,1");
  await clickBond(page, "2,1", "2,2");
  await clickBond(page, "2,1", "3,1", { times: 2 });
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to O 3,1: double bond");
  await expect(status(page)).toHaveText("✓ Solved! It's Formaldehyde.");

  // On Glycine, a Bond across another one isn't allowed.
  await openPuzzle(page, 11);
  await clickBond(page, "2,1", "2,3");
  await clickBond(page, "1,2", "4,2");
  await expect(page.getByRole("alert")).toHaveText("Bonds can't cross.");

  // Stuck, Noor looks at the solution, resets, and builds it alone.
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await expect(page.locator("#badge")).toHaveText("Solution seen");
  await page.getByRole("button", { name: "Reset" }).click();
  await build(page, PUZZLES[10]);
  await expect(page.locator("#badge")).toHaveText("✓ Solved");

  // The next day, in the same browser, the game opens where Noor left off.
  await page.reload();
  await expect(page.locator("#counter")).toHaveText("Puzzle 11 of 13");
  await expect(page.locator("#score")).toHaveText("Solved 4 of 13");
});
