import { describe, expect, test } from "vitest";
import { candidateBonds, crosses, connected } from "../../../src/puzzle/grid.ts";
import { createGame } from "../../../src/puzzle/game.ts";
import type { ElementSymbol } from "../../../src/puzzle/api.ts";
import { draw } from "../../helpers/draw.ts";
import { puzzle } from "../../helpers/puzzles.ts";

const atoms = (list: [ElementSymbol, number, number, number?][]) => list.map(([el, r, c, h = 0]) => ({ el, r, c, h }));
const glycine = puzzle("glycine");

describe("Grid", () => {
  test("Grid.01 a Bond can go to the nearest Atom in the same row or column: Glycine", () => {
    expect(draw(createGame(glycine))).toBe(`
OH··NH₂
·   ·
C···CH₂
·
O
`);
  });

  test("Grid.01 an Atom in between blocks the Bond past it", () => {
    const row = atoms([["C", 0, 0, 3], ["O", 0, 1, 0], ["C", 0, 2, 3]]);
    expect(candidateBonds(row).map(e => [e.a, e.b])).toEqual([[0, 1], [1, 2]]);
  });

  test("Grid.02 on a Grid of 3 by 3, with O at 1,2 and 3,2 and CH₂ at 2,1 and 2,3, O 1,2 to O 3,2 crosses CH₂ 2,1 to CH₂ 2,3, at 2,2", () => {
    const plus = atoms([["O", 0, 1, 0], ["C", 1, 0, 2], ["C", 1, 2, 2], ["O", 2, 1, 0]]);
    const lines = candidateBonds(plus);
    expect(lines.map(e => [e.a, e.b, e.horizontal])).toEqual([[0, 3, false], [1, 2, true]]);
    expect(crosses(plus, lines[0], lines[1])).toBe(true);
  });

  test("Grid.02 in Glycine, OH 1,1 to NH₂ 1,2 and OH 1,1 to C 2,1 meet at OH 1,1, and don't cross", () => {
    const game = createGame(glycine);
    const at = (p: string) => game.atoms.findIndex(a => `${a.r + 1},${a.c + 1}` === p);
    const line = (x: string, y: string) => {
      const found = game.bonds.find(e => e.a === at(x) && e.b === at(y));
      if (!found) throw new Error(`no Dotted line ${x} to ${y}`);
      return found;
    };
    expect(crosses(game.atoms, line("1,1", "1,2"), line("1,1", "2,1"))).toBe(false);
    expect(crosses(game.atoms, line("1,2", "2,2"), line("2,1", "2,2"))).toBe(false);
  });

  test("Grid.02 Bonds that only meet at an Atom don't cross", () => {
    const corner = atoms([["C", 0, 0, 3], ["O", 0, 1, 0], ["C", 1, 1, 3]]);
    const [h, v] = candidateBonds(corner);
    expect(crosses(corner, h, v)).toBe(false);
  });

  test("connected tells one piece from two", () => {
    const four = atoms([["C", 0, 0, 3], ["C", 0, 1, 3], ["C", 1, 0, 3], ["C", 1, 1, 3]]);
    const bonds = candidateBonds(four); // 0-1, 0-2, 1-3, 2-3
    expect(connected(4, bonds, [1, 0, 0, 1])).toBe(false);
    expect(connected(4, bonds, [1, 1, 1, 0])).toBe(true);
  });
});
