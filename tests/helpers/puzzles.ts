// A Puzzle of the game by its id, for the tests.
import type { Puzzle } from "../../src/puzzle/api.ts";
import { PUZZLES } from "../../src/puzzle/puzzles.js";

/** The Puzzle with this id; it must be one of the game's. */
export function puzzle(id: string): Puzzle {
  const found = PUZZLES.find(p => p.id === id);
  if (!found) throw new Error(`no Puzzle ${id}`);
  return found;
}
