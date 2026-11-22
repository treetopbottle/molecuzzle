import { test, expect } from "@playwright/test";
import { start, openPuzzle, bond, clickBond, status } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await start(page);
});

// No Puzzle has Dotted lines that cross, so "Bonds can't cross." is tested
// only in the unit tests, on a made-up Grid (Bond.05, Messages.02).

test("Input.01 clicking makes a Bond, then stronger, then removes it", async ({ page }) => {
  await openPuzzle(page, 1); // Acetonitrile: CH₃ / C / N
  for (const name of ["single bond", "double bond", "triple bond", "no bond"]) {
    await clickBond(page, "2,1", "3,1");
    await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName(`C 2,1 to N 3,1: ${name}`);
  }
});

test("Bond.04, Messages.02 an Atom can have too many bonds, with no message: Glycine's OH 1,1, bonded to C 2,1 and to N 1,2", async ({ page }) => {
  await openPuzzle(page, 3);
  await clickBond(page, "1,1", "2,1");
  await clickBond(page, "1,1", "1,2");
  await expect(page.getByRole("alert")).toHaveText("");
  await expect(bond(page, "1,1", "1,2")).toHaveAccessibleName("O 1,1 to N 1,2: single bond");
});

test("Input.01 right-click makes a Bond one weaker, and does nothing to a dotted line", async ({ page }) => {
  await openPuzzle(page, 1);
  await clickBond(page, "2,1", "3,1", { times: 3 });
  await clickBond(page, "2,1", "3,1", { button: "right" });
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: double bond");
  await clickBond(page, "1,1", "2,1", { button: "right" });
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("C 1,1 to C 2,1: no bond");
});

test("Input.01, Input.02 Acetonitrile: three clicks, a right-click, Delete and Ctrl+Z", async ({ page }) => {
  await openPuzzle(page, 1);
  await clickBond(page, "2,1", "3,1", { times: 3 });
  await clickBond(page, "2,1", "3,1", { button: "right" });
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: double bond");
  await bond(page, "1,1", "2,1").focus();
  await page.keyboard.press("Tab");
  await expect(bond(page, "2,1", "3,1")).toBeFocused();
  await page.keyboard.press("Delete");
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: single bond");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: double bond");
});

test("Input.02 Enter and Space act as a click, Backspace and - as a right-click", async ({ page }) => {
  await openPuzzle(page, 1);
  await bond(page, "2,1", "3,1").focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: double bond");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("-");
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: no bond");
});

test("Input.02, Input.03 Undo and Ctrl+Z go back one change", async ({ page }) => {
  const undo = page.getByRole("button", { name: "Undo" });
  await openPuzzle(page, 2); // Acetic acid
  await expect(undo).toBeDisabled();
  await clickBond(page, "2,1", "2,2");
  await clickBond(page, "2,2", "3,2");
  await undo.click();
  await expect(bond(page, "2,2", "3,2")).toHaveAccessibleName("C 2,2 to O 3,2: no bond");
  await expect(bond(page, "2,1", "2,2")).toHaveAccessibleName("C 2,1 to C 2,2: single bond");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(bond(page, "2,1", "2,2")).toHaveAccessibleName("C 2,1 to C 2,2: no bond");
  await expect(undo).toBeDisabled();
});

test("Input.02, Input.03 Reset removes every Bond and the undo history", async ({ page }) => {
  const reset = page.getByRole("button", { name: "Reset" }), undo = page.getByRole("button", { name: "Undo" });
  await openPuzzle(page, 2);
  await expect(reset).toBeDisabled();
  await clickBond(page, "2,1", "2,2");
  await clickBond(page, "2,2", "3,2");
  page.once("dialog", dialog => dialog.accept());
  await reset.click();
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  await expect(reset).toBeDisabled();
  await expect(undo).toBeDisabled();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(bond(page, "2,1", "2,2")).toHaveAccessibleName("C 2,1 to C 2,2: no bond");
  await expect(bond(page, "2,2", "3,2")).toHaveAccessibleName("C 2,2 to O 3,2: no bond");
});

test("Board.05 the line under the Board counts the Bonds used of the budget, and nothing on which Atoms are right: Acetic acid", async ({ page }) => {
  await openPuzzle(page, 2);
  const counts = page.locator("#counts");
  await expect(counts).toHaveText("Bonds 0 of 4");
  await expect(counts).toHaveCSS("text-align", "start");
  await expect(page.locator("#note #counts")).toBeVisible(); // in the box of the status line
  const [status, line] = [await page.getByRole("status").boundingBox(), await counts.boundingBox()];
  expect(line.y).toBeGreaterThanOrEqual(status.y + status.height); // below its text
  await clickBond(page, "1,2", "2,2", { times: 3 }); // O≡C
  await clickBond(page, "2,2", "3,2");               // C─OH
  await expect(counts).toHaveText("Bonds 4 of 4");
  await clickBond(page, "2,2", "3,2");               // C═OH
  await clickBond(page, "2,1", "2,2");               // CH₃─C
  await expect(counts).toHaveText("Bonds 6 of 4");
  await expect(counts.locator(".warn")).toHaveText("Bonds 6 of 4");
  await expect(page.getByLabel("Bonds used, of the budget: 6 of 4")).toBeVisible();
});

test("Board.02, Board.04 Atoms are named with their hydrogens, and show nothing of what they need, also when complete", async ({ page }) => {
  await openPuzzle(page, 2); // Acetic acid
  await clickBond(page, "1,2", "2,2", { times: 2 });
  await expect(page.getByRole("img", { name: "Carbon 2,2", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Carbon 2,1, with 3 hydrogens", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Oxygen 1,2", exact: true })).not.toHaveClass(/\bok\b/);
  await expect(page.locator("#board .atom .badge")).toHaveCount(0);
  await expect(page.locator("#board .atom.ok")).toHaveCount(0);
});
