// @ts-nocheck
// How hard a Puzzle is: its Dotted lines, plus twice those its solution
// leaves empty, as each is a Bond to rule out (decisions 0021, 0024). The
// panel shows it (decision 0027); the tests and the generator use it too.
import type { Puzzle } from "./api.ts";
import { candidateBonds } from "./grid.ts";

/**
 * The Puzzle's Dotted lines, and its loops: Dotted lines minus Atoms plus 1,
 * as the Dotted lines join all its Atoms.
 */
export function dottedLines({ atoms }: Pick<Puzzle, "atoms">): { dotted: number; loops: number } {
  const dotted = candidateBonds(atoms.map(([el, r, c]) => ({ el, r, c }))).length;
  return { dotted, loops: dotted - atoms.length + 1 };
}

export function difficulty(puzzle: Pick<Puzzle, "atoms" | "solution">): number {
  const { dotted } = dottedLines(puzzle);
  return dotted + 2 * (dotted - puzzle.solution.length);
}
