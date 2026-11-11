import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { expect } from "@playwright/test";
import { PUZZLES } from "../../src/puzzles.js";
import { STORAGE_KEY } from "../../src/progress.js";

export { PUZZLES, STORAGE_KEY };
export const GAME_URL = pathToFileURL(resolve("dist/index.html")).href;

/** Opens the game, with this Progress stored first, if given. */
export async function start(page, progress) {
  await page.goto(GAME_URL);
  if (progress) {
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify(progress)]);
    await page.reload();
  }
}

/** The Bond between the Atoms at two places, "row,col" counted from 1. */
export const bond = (page, from, to) =>
  page.getByRole("button", { name: new RegExp(`^[A-Z] ${from} to [A-Z] ${to}:`) });

/**
 * Clicks a Bond near its first Atom, half a cell along, where no other
 * Bond can cross it. With { tap: true } it taps instead.
 */
export async function clickBond(page, from, to, { times = 1, button = "left", tap = false } = {}) {
  const loc = bond(page, from, to);
  const box = await loc.boundingBox();
  const [r1, c1] = from.split(",").map(Number), [r2, c2] = to.split(",").map(Number);
  const cells = Math.max(r2 - r1, c2 - c1);
  const position = r1 === r2
    ? { x: box.width * 0.5 / cells, y: box.height / 2 }
    : { x: box.width / 2, y: box.height * 0.5 / cells };
  for (let n = 0; n < times; n++) {
    if (tap) await loc.tap({ position });
    else await loc.click({ position, button });
  }
}

const place = (puzzle, i) => `${puzzle.atoms[i][1] + 1},${puzzle.atoms[i][2] + 1}`;

/** Builds a puzzle's solution by clicking its Bonds. */
export async function build(page, puzzle) {
  for (const [a, b, o] of puzzle.solution) await clickBond(page, place(puzzle, a), place(puzzle, b), { times: o });
}

export async function openPuzzle(page, number) {
  await page.getByRole("list", { name: "Puzzles" }).getByRole("button", { name: new RegExp(`^Puzzle ${number}\\b`) }).click();
  await expect(page.locator("#counter")).toHaveText(`Puzzle ${number} of ${PUZZLES.length}`);
}

export const status = page => page.getByRole("status");

export const storedProgress = page =>
  page.evaluate(key => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
