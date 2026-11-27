// The Boards drawn as text, as the spec's README draws them.
import { expect, test } from "vitest";
import { createGame } from "../../src/puzzle/game.ts";
import { PUZZLES } from "../../src/puzzle/puzzles.js";
import type { Game, Puzzle } from "../../src/puzzle/api.ts";
import { draw } from "../helpers/draw.ts";

const solved = (puzzle: Puzzle): Game => {
  const game = createGame(puzzle);
  game.showSolution();
  return game;
};

test("Atoms by their labels as in a formula, every point as wide as the longest: Glycine, with no Bonds and solved", () => {
  const glycine = PUZZLES.find(p => p.id === "glycine");
  if (!glycine) throw new Error("no Glycine");
  expect(draw(createGame(glycine))).toBe(`
OH··NH₂
·   ·
C···CH₂
·
O
`);
  expect(draw(solved(glycine))).toBe(`
OH··NH₂
│   │
C───CH₂
║
O
`);
});

test("a Board with no hydrogens, only one-letter symbols, is drawn one character a point: carbon dioxide, made up", () => {
  const co2: Puzzle = {
    id: "carbon-dioxide", name: "Carbon dioxide", formula: "CO2", fact: "Not a Puzzle.",
    rows: 2, cols: 2, atoms: [["O",0,0,0],["C",0,1,0],["O",1,1,0]], solution: [[0,1,2],[1,2,2]],
  };
  expect(draw(createGame(co2))).toBe(`
O·C
  ·
  O
`);
  expect(draw(solved(co2))).toBe(`
O═C
  ║
  O
`);
});
