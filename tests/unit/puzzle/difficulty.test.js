import { expect, test } from "vitest";
import { difficulty, dottedLines } from "../../../src/puzzle/difficulty.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";

const puzzle = id => PUZZLES.find(p => p.id === id);

test("Puzzle.05 Glycine has 12 Dotted lines, 3 of them empty when solved: difficulty 12 + 2 × 3 = 18", () => {
  expect(dottedLines(puzzle("glycine"))).toEqual({ dotted: 12, empty: 3 });
  expect(difficulty(puzzle("glycine"))).toBe(18);
});

test("Puzzle.05 Water has 2 Dotted lines, both Bonds when solved: difficulty 2", () => {
  expect(difficulty(puzzle("water"))).toBe(2);
});
