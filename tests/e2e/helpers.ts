import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { expect, type Locator, type Page } from "@playwright/test";
import type { Puzzle } from "../../src/puzzle/api.ts";
import type { Progress } from "../../src/storage/api.ts";
import { PUZZLES } from "../../src/puzzle/puzzles.js";
import { STORAGE_KEY } from "../../src/storage/progress.js";

export { PUZZLES, STORAGE_KEY };
export const GAME_URL = pathToFileURL(resolve("dist/index.html")).href;

/** Opens the game, with this Progress stored first, if given: also data that isn't one, as the tests of wrong data store. */
export async function start(page: Page, progress?: unknown): Promise<void> {
  await page.goto(GAME_URL);
  if (progress) {
    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify(progress)]);
    await page.reload();
  }
}

/** The Bond between the Atoms at two places, "row,col" counted from 1. */
export const bond = (page: Page, from: string, to: string): Locator =>
  page.getByRole("button", { name: new RegExp(`^[A-Z][a-z]? ${from} to [A-Z][a-z]? ${to}:`) });

/**
 * Clicks a Bond near its first Atom, half a cell along, where no other
 * Bond can cross it. With { tap: true } it taps instead.
 */
export async function clickBond(page: Page, from: string, to: string,
  { times = 1, button = "left", tap = false }: { times?: number; button?: "left" | "right"; tap?: boolean } = {}): Promise<void> {
  const loc = bond(page, from, to);
  const { width, height } = await box(loc);
  const [r1, c1] = from.split(",").map(Number), [r2, c2] = to.split(",").map(Number);
  const cells = Math.max(r2 - r1, c2 - c1);
  const position = r1 === r2
    ? { x: width * 0.5 / cells, y: height / 2 }
    : { x: width / 2, y: height * 0.5 / cells };
  for (let n = 0; n < times; n++) {
    if (tap) await loc.tap({ position });
    else await loc.click({ position, button });
  }
}

const place = (puzzle: Puzzle, i: number): string => `${puzzle.atoms[i][1] + 1},${puzzle.atoms[i][2] + 1}`;

/** Builds a puzzle's solution by clicking its Bonds. */
export async function build(page: Page, puzzle: Puzzle): Promise<void> {
  for (const [a, b, o] of puzzle.solution) await clickBond(page, place(puzzle, a), place(puzzle, b), { times: o });
}

export async function openPuzzle(page: Page, number: number): Promise<void> {
  await page.getByRole("list", { name: "Puzzles" }).getByRole("button", { name: new RegExp(`^Puzzle ${number}\\b`) }).click();
  await expect(page.locator("#counter")).toHaveText(`Puzzle ${number} of ${PUZZLES.length}`);
}

/** Where an element is on the page; it must be visible. */
export async function box(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const found = await locator.boundingBox();
  if (!found) throw new Error(`${locator} is not visible`);
  return found;
}

/** The size of the page's viewport, which every project sets. */
export function viewport(page: Page): { width: number; height: number } {
  const size = page.viewportSize();
  if (!size) throw new Error("no viewport");
  return size;
}

export const status = (page: Page): Locator => page.getByRole("status");

/** The Progress the page stored, or null for none. */
export const storedProgress = (page: Page): Promise<Progress | null> =>
  page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? "null"), STORAGE_KEY);

/** The text and border colours of an element, each as [r, g, b]. */
export const colors = (locator: Locator): Promise<number[][]> =>
  locator.evaluate(e => [getComputedStyle(e).color, getComputedStyle(e).borderTopColor])
    .then(css => css.map(c => {
      const digits = c.match(/\d+/g);
      if (!digits) throw new Error(`no colour in ${c}`);
      return digits.slice(0, 3).map(Number);
    }));

export { isGreen, isOrange } from "../helpers/colors.ts";
