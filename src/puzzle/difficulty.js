// How hard a Puzzle is: its Dotted lines, plus twice those its solution
// leaves empty, as each is a Bond to rule out (decisions 0021, 0024). For the
// tests and the generator; the game doesn't use it.
import { candidateBonds } from "./grid.js";

/**
 * The Puzzle's Dotted lines, and its loops: Dotted lines minus Atoms plus 1,
 * as the Dotted lines join all its Atoms.
 * @param {{ atoms: [string, number, number, number?][] }} puzzle
 */
export function dottedLines({ atoms }) {
  const dotted = candidateBonds(atoms.map(([el, r, c]) => ({ el, r, c }))).length;
  return { dotted, loops: dotted - atoms.length + 1 };
}

/** @param {{ atoms: [string, number, number, number?][], solution: unknown[] }} puzzle */
export function difficulty(puzzle) {
  const { dotted } = dottedLines(puzzle);
  return dotted + 2 * (dotted - puzzle.solution.length);
}
