import { expect, test } from "vitest";
import { difficulty, dottedLines } from "../../../src/puzzle/difficulty.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";

const puzzle = id => PUZZLES.find(p => p.id === id);

test("Puzzle.05 Glycine, with 5 Atoms and 5 Dotted lines, has 5 − 5 + 1 = 1 loop: difficulty 5 + 2 × 1 = 7", () => {
  expect([puzzle("glycine").atoms.length, dottedLines(puzzle("glycine"))]).toEqual([5, { dotted: 5, loops: 1 }]);
  expect(difficulty(puzzle("glycine"))).toBe(7);
});

test("Puzzle.08 Glycerol, with 6 Atoms and 7 Dotted lines, has 7 − 6 + 1 = 2 loops", () => {
  expect([puzzle("glycerol").atoms.length, dottedLines(puzzle("glycerol"))]).toEqual([6, { dotted: 7, loops: 2 }]);
});

test("Puzzle.05 Morpholine, a ring, has 2 loops, though its solution leaves only 1 Dotted line empty: difficulty 7 + 2 × 2 = 11", () => {
  const morpholine = puzzle("morpholine");
  expect(dottedLines(morpholine)).toEqual({ dotted: 7, loops: 2 });
  expect(morpholine.solution).toHaveLength(6);
  expect(difficulty(morpholine)).toBe(11);
});
