import { describe, expect, test } from "vitest";
import { candidateBonds, crosses, connected } from "../../src/grid.js";
import { createGame } from "../../src/game.js";
import { PUZZLES } from "../../src/puzzles.js";
import { draw } from "../helpers/draw.js";

const atoms = list => list.map(([el, r, c]) => ({ el, r, c }));
const glycine = PUZZLES.find(p => p.id === "glycine");

describe("Grid", () => {
  test("Grid.01 a Bond can go to the nearest Atom in the same row or column", () => {
    expect(draw(createGame(glycine))).toMatchInlineSnapshot(`
      "
        O·C·O·H
        · · · ·
      H···C···H
        · · ·
        · · ·
        · · ·
        H·N·H
      "
    `);
  });

  test("Grid.01 an Atom in between blocks the Bond past it", () => {
    const row = atoms([["H", 0, 0], ["O", 0, 1], ["H", 0, 2]]);
    expect(candidateBonds(row).map(e => [e.a, e.b])).toEqual([[0, 1], [1, 2]]);
  });

  test("Grid.02 a row and a column Bond cross where they meet between their Atoms", () => {
    const plus = atoms([["O", 0, 1], ["H", 1, 0], ["H", 1, 2], ["O", 2, 1]]);
    const [h, v] = [candidateBonds(plus).find(e => e.horizontal), candidateBonds(plus).find(e => !e.horizontal)];
    expect(crosses(plus, h, v)).toBe(true);
  });

  test("Grid.02 in Glycine, H 2,1 to C 2,3 crosses O 1,2 to H 4,2, but not C 1,3 to C 2,3", () => {
    const game = createGame(glycine);
    const at = p => game.atoms.findIndex(a => `${a.r + 1},${a.c + 1}` === p);
    const line = (x, y) => game.bonds.find(e => e.a === at(x) && e.b === at(y));
    expect(crosses(game.atoms, line("2,1", "2,3"), line("1,2", "4,2"))).toBe(true);
    expect(crosses(game.atoms, line("2,1", "2,3"), line("1,3", "2,3"))).toBe(false);
  });

  test("Grid.02 Bonds that only meet at an Atom don't cross", () => {
    const corner = atoms([["H", 0, 0], ["O", 0, 1], ["H", 1, 1]]);
    const [h, v] = candidateBonds(corner);
    expect(crosses(corner, h, v)).toBe(false);
  });

  test("connected tells one piece from two", () => {
    const four = atoms([["H", 0, 0], ["H", 0, 1], ["H", 1, 0], ["H", 1, 1]]);
    const bonds = candidateBonds(four); // 0-1, 0-2, 1-3, 2-3
    expect(connected(4, bonds, [1, 0, 0, 1])).toBe(false);
    expect(connected(4, bonds, [1, 1, 1, 0])).toBe(true);
  });
});
