// How hard a Puzzle is: its Dotted lines, plus twice those its solution
// leaves empty, as each of those is also a Bond to rule out (decision 0021).
// For the tests and the generator; the game doesn't use it.
import { candidateBonds } from "./grid.js";

/** @param {{ atoms: [string, number, number][], solution: number[][] }} puzzle */
export function difficulty({ atoms, solution }) {
  const dotted = candidateBonds(atoms.map(([el, r, c]) => ({ el, r, c }))).length;
  return dotted + 2 * (dotted - solution.length);
}
