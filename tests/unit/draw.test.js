// The Boards drawn as text, as the spec's README draws them.
import { expect, test } from "vitest";
import { createGame } from "../../src/puzzle/game.js";
import { PUZZLES } from "../../src/puzzle/puzzles.js";
import { draw } from "../helpers/draw.js";

const solved = puzzle => {
  const game = createGame(puzzle);
  game.showSolution();
  return game;
};

// The spec's Glycine, with its hydrogens on its Atoms: made up until its
// Puzzle is in puzzles.js (plan 07, step 7).
const glycineWithHydrogens = {
  id: "glycine", name: "Glycine", formula: "C2H5NO2", fact: "Glycine is the smallest amino acid.",
  rows: 3, cols: 2,
  atoms: [["O",0,0,1],["N",0,1,2],["C",1,0,0],["C",1,1,2],["O",2,0,0]],
  solution: [[0,2,1],[1,3,1],[2,3,1],[2,4,2]],
};

test("Atoms with hydrogens, by their labels as in a formula, every point as wide as the longest: Glycine, with no Bonds and solved", () => {
  expect(draw(createGame(glycineWithHydrogens))).toBe(`
OH··NH₂
·   ·
C···CH₂
·
O
`);
  expect(draw(solved(glycineWithHydrogens))).toBe(`
OH··NH₂
│   │
C───CH₂
║
O
`);
});

test("a Board with no hydrogens and only one-letter symbols: Glycine, with no Bonds and solved", () => {
  const glycine = PUZZLES.find(p => p.id === "glycine");
  expect(draw(createGame(glycine))).toBe(`
  O·C·O·H
  · · · ·
H···C···H
  · · ·
  · · ·
  · · ·
  H·N·H
`);
  expect(draw(solved(glycine))).toBe(`
  O═C─O─H
  · │ · ·
H───C───H
  · │ ·
  · │ ·
  · │ ·
  H─N─H
`);
});

test("a Board with no hydrogens and a two-letter symbol: Halothane, with no Bonds and solved", () => {
  const halothane = PUZZLES.find(p => p.id === "halothane");
  expect(draw(createGame(halothane))).toBe(`
   F··Cl
   ·  ·
F··C··C··H
   ·  ·
   F··Br
`);
  expect(draw(solved(halothane))).toBe(`
   F··Cl
   │  │
F──C──C──H
   │  │
   F··Br
`);
});
