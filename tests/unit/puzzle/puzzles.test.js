import { describe, expect, test } from "vitest";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { ELEMENTS } from "../../../src/puzzle/elements.js";
import { solve } from "../../../src/puzzle/solver.js";
import { createGame } from "../../../src/puzzle/game.js";
import { draw } from "../../helpers/draw.js";
import { difficulty } from "../../../src/puzzle/difficulty.js";
import { schemaErrors } from "../../helpers/schemas.js";

const count = list => list.reduce((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {});
const formulaCount = f => Object.fromEntries([...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(([, el, n]) => [el, Number(n || 1)]));

describe("Puzzle.01 the puzzles", () => {
  test("Puzzle.05 are these, with their difficulty, in order of difficulty", () => {
    expect(PUZZLES.map(p => `${p.name} ${p.formula} ${difficulty(p)}`)).toEqual([
      "Water H2O 2",
      "Hydrogen cyanide HCN 2",
      "Formaldehyde CH2O 3",
      "Methanol CH4O 8",
      "Acetic acid C2H4O2 10",
      "Ethylene C2H4 11",
      "Acrylonitrile C3H3N 12",
      "Urea CH4N2O 13",
      "Halothane C2HBrClF3 13",
      "Acetone C3H6O 15",
      "Ethanol C2H6O 17",
      "Glycine C2H5NO2 18",
      "Lactic acid C3H6O3 26",
      "Ethyl acetate C4H8O2 28",
      "Alanine C3H7NO2 30",
      "Glycerol C3H8O3 31",
      "Serine C3H7NO3 31",
      "Cysteine C3H7NO2S 31",
      "Threonine C4H9NO3 37",
      "Valine C5H11NO2 45",
    ]);
    const scores = PUZZLES.map(difficulty);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
    expect(new Set(PUZZLES.map(p => p.id)).size).toBe(PUZZLES.length);
  });

  describe.each(PUZZLES)("$name", p => {
    const atoms = p.atoms.map(([el, r, c]) => ({ el, r, c }));

    test("is a Puzzle, as its schema says", () => {
      expect(schemaErrors("puzzle.schema.json", p)).toEqual([]);
    });

    test("gives exactly the Atoms of its formula, each on its own grid point, in reading order", () => {
      expect(count(atoms.map(a => a.el))).toEqual(formulaCount(p.formula));
      expect(atoms.every(a => a.el in ELEMENTS && a.r >= 0 && a.r < p.rows && a.c >= 0 && a.c < p.cols)).toBe(true);
      expect(new Set(atoms.map(a => `${a.r},${a.c}`)).size).toBe(atoms.length);
      expect(atoms.every((a, i) => i === 0 || a.r > atoms[i - 1].r || (a.r === atoms[i - 1].r && a.c > atoms[i - 1].c))).toBe(true);
    });

    test("Puzzle.04 has a Grid of at most 6 rows and 5 columns", () => {
      expect(p.rows).toBeLessThanOrEqual(6);
      expect(p.cols).toBeLessThanOrEqual(5);
    });

    test("has exactly one solution, the one it shows", () => {
      const solutions = solve(atoms, 2);
      expect(solutions).toHaveLength(1);
      const game = createGame(p);
      game.showSolution();
      expect(game.order).toEqual(solutions[0]);
    });
  });

  test("Puzzle.04 Valine, with 19 Atoms, has a Grid of 6 rows and 5 columns", () => {
    const valine = PUZZLES[19];
    expect([valine.name, valine.atoms.length, valine.rows, valine.cols]).toEqual(["Valine", 19, 6, 5]);
  });

  test("Acrylonitrile, solved", () => {
    const game = createGame(PUZZLES.find(p => p.id === "acrylonitrile"));
    game.showSolution();
    expect(draw(game)).toMatchInlineSnapshot(`
      "
        N
        ⦀
      H·C
      │ │
      C═C
      │ │
      H·H
      "
    `);
  });
});
