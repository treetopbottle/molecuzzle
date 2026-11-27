import { expect, test } from "vitest";
import { difficulty, dottedLines } from "../../../src/puzzle/difficulty.ts";
import { puzzle } from "../../helpers/puzzles.ts";

test("Puzzle.05 Glycine, with 5 Atoms and 5 Dotted lines, has 5 − 5 + 1 = 1 loop: difficulty 5 + 2 × 1 = 7", () => {
  expect([puzzle("glycine").atoms.length, dottedLines(puzzle("glycine"))]).toEqual([5, { dotted: 5, loops: 1 }]);
  expect(difficulty(puzzle("glycine"))).toBe(7);
});

test("Puzzle.08 Glycerol, with 6 Atoms and 7 Dotted lines, has 7 − 6 + 1 = 2 loops", () => {
  expect([puzzle("glycerol").atoms.length, dottedLines(puzzle("glycerol"))]).toEqual([6, { dotted: 7, loops: 2 }]);
});

test("Puzzle.05 Morpholine, a ring, has 2 loops, but its solution leaves only 1 Dotted line empty, and that is what counts: difficulty 7 + 2 × 1 = 9", () => {
  const morpholine = puzzle("morpholine");
  expect(dottedLines(morpholine)).toEqual({ dotted: 7, loops: 2 });
  expect(morpholine.solution).toHaveLength(6);
  expect(difficulty(morpholine)).toBe(9);
});
