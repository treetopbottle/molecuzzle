import { describe, expect, test } from "vitest";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { ELEMENTS } from "../../../src/puzzle/elements.js";
import { solve } from "../../../src/puzzle/solver.js";
import { createGame } from "../../../src/puzzle/game.js";
import { draw } from "../../helpers/draw.js";
import { schemaErrors } from "../../helpers/schemas.js";

const count = list => list.reduce((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {});
const formulaCount = f => Object.fromEntries([...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(([, el, n]) => [el, Number(n || 1)]));

describe("Puzzle.01 the puzzles", () => {
  test("are these, in this order", () => {
    expect(PUZZLES.map(p => `${p.name} ${p.formula}`)).toMatchInlineSnapshot(`
      [
        "Water H2O",
        "Ammonia NH3",
        "Formaldehyde CH2O",
        "Hydrogen cyanide HCN",
        "Methanol CH4O",
        "Ethylene C2H4",
        "Acrylonitrile C3H3N",
        "Acetic acid C2H4O2",
        "Urea CH4N2O",
        "Ethanol C2H6O",
        "Glycine C2H5NO2",
        "Acetone C3H6O",
        "Alanine C3H7NO2",
        "Carbon disulfide CS2",
        "Chloroform CHCl3",
        "Methanethiol CH4S",
        "Phosgene CCl2O",
        "Vinyl chloride C2H3Cl",
        "Tetrafluoroethylene C2F4",
        "Iodoethane C2H5I",
        "Halothane C2HBrClF3",
      ]
    `);
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

    test("has exactly one solution, the one it shows", () => {
      const solutions = solve(atoms, 2);
      expect(solutions).toHaveLength(1);
      const game = createGame(p);
      game.showSolution();
      expect(game.order).toEqual(solutions[0]);
    });
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
