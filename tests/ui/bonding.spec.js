import { test, expect } from "@playwright/test";
import { start, openPuzzle, bond, clickBond, status } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await start(page);
});

test("Bond.01, Bond.02, Bond.03 clicking makes a Bond, then stronger, then removes it", async ({ page }) => {
  await openPuzzle(page, 4); // H C N
  for (const name of ["single bond", "double bond", "triple bond", "no bond"]) {
    await clickBond(page, "1,2", "1,3");
    await expect(bond(page, "1,2", "1,3")).toHaveAccessibleName(`C 1,2 to N 1,3: ${name}`);
  }
});

test("Bond.04 an Atom with all its bonds says so", async ({ page }) => {
  await openPuzzle(page, 5); // Methanol: . H . / O C H / H H .
  await clickBond(page, "3,1", "3,2"); // H–H
  await clickBond(page, "2,1", "3,1"); // O–H: that H is full
  await expect(page.getByRole("alert")).toHaveText("Hydrogen already has all its bonds.");
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("O 2,1 to H 3,1: no bond");
});

test("Bond.05 Bonds can't cross", async ({ page }) => {
  await openPuzzle(page, 11); // Glycine
  await clickBond(page, "2,1", "2,3"); // H–C across the middle
  await clickBond(page, "1,2", "4,2"); // O–H down through it
  await expect(page.getByRole("alert")).toHaveText("Bonds can't cross.");
  await expect(bond(page, "1,2", "4,2")).toHaveAccessibleName("O 1,2 to H 4,2: no bond");
});

test("Bond.06 right-click makes a Bond one weaker", async ({ page }) => {
  await openPuzzle(page, 4);
  await clickBond(page, "1,2", "1,3", { times: 3 });
  await clickBond(page, "1,2", "1,3", { button: "right" });
  await expect(bond(page, "1,2", "1,3")).toHaveAccessibleName("C 1,2 to N 1,3: double bond");
  await clickBond(page, "1,1", "1,2", { button: "right" });
  await expect(bond(page, "1,1", "1,2")).toHaveAccessibleName("H 1,1 to C 1,2: no bond");
});

test("Bond.07 Bonds can be reached with Tab and changed with keys", async ({ page }) => {
  await openPuzzle(page, 4);
  await bond(page, "1,1", "1,2").focus();
  await page.keyboard.press("Tab");
  await expect(bond(page, "1,2", "1,3")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(bond(page, "1,2", "1,3")).toHaveAccessibleName("C 1,2 to N 1,3: double bond");
  await page.keyboard.press("Delete");
  await expect(bond(page, "1,2", "1,3")).toHaveAccessibleName("C 1,2 to N 1,3: single bond");
});

test("Bond.08 Undo and Ctrl+Z go back one change", async ({ page }) => {
  const undo = page.getByRole("button", { name: "Undo" });
  await openPuzzle(page, 2); // Ammonia
  await expect(undo).toBeDisabled();
  await clickBond(page, "1,1", "2,1");
  await clickBond(page, "2,1", "2,2");
  await undo.click();
  await expect(bond(page, "2,1", "2,2")).toHaveAccessibleName("N 2,1 to H 2,2: no bond");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("H 1,1 to N 2,1: no bond");
  await expect(undo).toBeDisabled();
});

test("Bond.09 Reset removes every Bond, and Undo brings them back", async ({ page }) => {
  const reset = page.getByRole("button", { name: "Reset" });
  await openPuzzle(page, 2);
  await expect(reset).toBeDisabled();
  await clickBond(page, "1,1", "2,1");
  await clickBond(page, "2,1", "3,1");
  await reset.click();
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  await expect(reset).toBeDisabled();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("H 1,1 to N 2,1: single bond");
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("N 2,1 to H 3,1: single bond");
});

test("Valence.01, Valence.02 Atoms show what they still need, and glow when complete", async ({ page }) => {
  await openPuzzle(page, 3); // Formaldehyde
  await clickBond(page, "2,1", "3,1", { times: 2 });
  await expect(page.getByRole("img", { name: "Carbon 2,1: needs 2 more bonds" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Oxygen 3,1: complete" })).toHaveClass(/\bok\b/);
});
