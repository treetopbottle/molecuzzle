import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, bond } from "./helpers.js";

test("Input.05 Reset asks first, and only after OK resets", async ({ page }) => {
  const reset = page.getByRole("button", { name: "Reset" }), undo = page.getByRole("button", { name: "Undo" });
  await start(page);
  await openPuzzle(page, 3); // Formaldehyde
  await clickBond(page, "1,1", "2,1");

  const questions = [];
  page.once("dialog", dialog => { questions.push(dialog.message()); dialog.dismiss(); });
  await reset.click();
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("H 1,1 to C 2,1: single bond");
  await expect(undo).toBeEnabled();

  page.once("dialog", dialog => { questions.push(dialog.message()); dialog.accept(); });
  await reset.click();
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("H 1,1 to C 2,1: no bond");
  await expect(undo).toBeDisabled();
  expect(questions).toEqual(Array(2).fill("Reset this puzzle? Its bonds and undo history are removed."));
});
