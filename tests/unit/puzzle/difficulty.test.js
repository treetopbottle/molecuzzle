import { expect, test } from "vitest";
import { difficulty, dottedLines } from "../../../src/puzzle/difficulty.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";

const puzzle = id => PUZZLES.find(p => p.id === id);

// The spec's Glycine, Glycerol and Morpholine, with their hydrogens on their
// Atoms: made up until their Puzzles are in puzzles.js (plan 07, step 7).
const glycine = {
  rows: 3, cols: 2,
  atoms: [["O",0,0,1],["N",0,1,2],["C",1,0,0],["C",1,1,2],["O",2,0,0]],
  solution: [[0,2,1],[1,3,1],[2,3,1],[2,4,2]],
};
const glycerol = {
  rows: 3, cols: 2,
  atoms: [["O",0,0,1],["C",0,1,2],["C",1,0,2],["C",1,1,1],["O",2,0,1],["O",2,1,1]],
  solution: [[0,1,1],[1,3,1],[2,3,1],[2,4,1],[3,5,1]],
};
const morpholine = {
  rows: 3, cols: 2,
  atoms: [["N",0,0,1],["C",0,1,2],["C",1,0,2],["C",1,1,2],["C",2,0,2],["O",2,1,0]],
  solution: [[0,1,1],[0,2,1],[1,3,1],[2,4,1],[3,5,1],[4,5,1]],
};

test("Puzzle.05 Glycine, with 5 Atoms and 5 Dotted lines, has 5 − 5 + 1 = 1 loop: difficulty 5 + 2 × 1 = 7", () => {
  expect(dottedLines(glycine)).toEqual({ dotted: 5, loops: 1 });
  expect(difficulty(glycine)).toBe(7);
});

test("Puzzle.08 Glycerol, with 6 Atoms and 7 Dotted lines, has 7 − 6 + 1 = 2 loops", () => {
  expect(dottedLines(glycerol)).toEqual({ dotted: 7, loops: 2 });
  expect(difficulty(glycerol)).toBe(11);
});

test("Puzzle.05 Morpholine, a ring, has 2 loops though its solution leaves only 1 Dotted line empty: difficulty 7 + 2 × 2 = 11", () => {
  expect(dottedLines(morpholine)).toEqual({ dotted: 7, loops: 2 });
  expect(7 - morpholine.solution.length).toBe(1);
  expect(difficulty(morpholine)).toBe(11);
});

test("Puzzle.05 Water has 2 Dotted lines, both Bonds when solved: difficulty 2", () => {
  expect(difficulty(puzzle("water"))).toBe(2);
});
