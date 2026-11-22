import { test, expect } from "@playwright/test";
import { start, openPuzzle, clickBond, bond, build, status, storedProgress, PUZZLES } from "./helpers.js";
import { schemaErrors } from "../helpers/schemas.js";

test("Progress.05 a Puzzle in progress, Undo included, is kept after the browser closes", async ({ page, context }) => {
  await start(page);
  await clickBond(page, "1,1", "2,1");
  await openPuzzle(page, 2);
  expect(await storedProgress(page)).toEqual({
    puzzles: {}, current: "acetic-acid",
    boards: { acetonitrile: { bonds: [[0, 1, 1]], revealed: false, undo: [[]] } },
  });
  await page.close();

  const again = await context.newPage();
  await start(again);
  await openPuzzle(again, 1);
  await expect(bond(again, "1,1", "2,1")).toHaveAccessibleName("C 1,1 to C 2,1: single bond");
  await expect(bond(again, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: no bond");
  await again.getByRole("button", { name: "Undo" }).click();
  await expect(bond(again, "1,1", "2,1")).toHaveAccessibleName("C 1,1 to C 2,1: no bond");
  await expect(bond(again, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: no bond");
});

test("Progress.05 a shown solution is still unsolved after a reload", async ({ page }) => {
  await start(page);
  await openPuzzle(page, 7);
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Show solution" }).click();
  await page.reload();
  await expect(status(page)).toHaveText("Here is 1,4-Benzoquinone. Reset and build it yourself to mark it solved.");
  await expect(page.locator("#badge")).toHaveText("Unsolved");
  await expect(page.locator("#score")).toHaveText("Solved 0 of 15");
});

test("Progress.03, Progress.05, Progress.06 what is stored is a Progress", async ({ page }) => {
  await start(page);
  await openPuzzle(page, 2);
  await clickBond(page, "2,1", "2,2");
  await clickBond(page, "2,2", "3,2");
  await page.getByRole("button", { name: "Undo" }).click();
  await openPuzzle(page, 1);
  await build(page, PUZZLES[0]);
  const stored = await storedProgress(page);
  expect(stored.boards).toEqual({
    "acetic-acid": { bonds: [[1, 2, 1]], revealed: false, undo: [[]] },
    acetonitrile: { bonds: [[0, 1, 1], [1, 2, 3]], revealed: false, undo: [] },
  });
  expect(schemaErrors("progress.schema.json", stored)).toEqual([]);
});

test("Progress.06 a solved Puzzle opens again solved, until it is reset", async ({ page }) => {
  await start(page);
  await build(page, PUZZLES[0]);
  await openPuzzle(page, 2);
  await page.reload();
  await openPuzzle(page, 1);
  await expect(status(page)).toHaveText("✓ Solved! It's Acetonitrile.");
  await expect(bond(page, "1,1", "2,1")).toHaveAccessibleName("C 1,1 to C 2,1: single bond");
  await expect(bond(page, "2,1", "3,1")).toHaveAccessibleName("C 2,1 to N 3,1: triple bond");
  await expect(page.getByRole("button", { name: "Undo" })).toBeDisabled();

  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "Reset" }).click();
  await openPuzzle(page, 2);
  await openPuzzle(page, 1);
  await expect(status(page)).toHaveText("Click a dotted line between two atoms to bond them.");
  await expect(page.locator("#badge")).toHaveText("✓ Solved");
  expect(await storedProgress(page)).toEqual({ puzzles: { acetonitrile: "solved" }, current: "acetonitrile" });
});
