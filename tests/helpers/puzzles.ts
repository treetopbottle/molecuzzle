// A Puzzle of the game by its id, and the symbols a Puzzle may use, for the tests.
import type { Puzzle } from "../../src/puzzle/api.ts";
import { ELEMENTS } from "../../src/puzzle/elements.ts";
import { PUZZLES } from "../../src/puzzle/puzzles.ts";

/** The symbols a Puzzle's Atom may have: every Element's but H. */
export const PUZZLE_SYMBOLS: string[] = Object.keys(ELEMENTS).filter(s => s !== "H");

/** The Puzzle with this id; it must be one of the game's. */
export function puzzle(id: string): Puzzle {
  const found = PUZZLES.find(p => p.id === id);
  if (!found) throw new Error(`no Puzzle ${id}`);
  return found;
}
