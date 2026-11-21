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

test("a Board with only one-letter symbols: Glycine, with no Bonds and solved", () => {
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

test("a Board with a two-letter symbol: Chloroform, with no Bonds and solved", () => {
  const chloroform = PUZZLES.find(p => p.id === "chloroform");
  expect(draw(createGame(chloroform))).toBe(`
   Cl
   ·
H··C··Cl
   ·
   Cl
`);
  expect(draw(solved(chloroform))).toBe(`
   Cl
   │
H──C──Cl
   │
   Cl
`);
});
