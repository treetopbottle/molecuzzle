// @ts-nocheck
import { describe, expect, test } from "vitest";
import { REMOVED } from "../../../src/puzzle/removed.ts";
import { PUZZLES } from "../../../src/puzzle/puzzles.ts";
import { ELEMENTS } from "../../../src/puzzle/elements.ts";
import { solve } from "../../../src/puzzle/solver.ts";
import { createGame } from "../../../src/puzzle/game.ts";
import { schemaErrors } from "../../helpers/schemas.ts";
import { atomCount, formulaCount } from "../../helpers/formula.ts";

/** The Atoms of a formula, as counts per Element, so the order it is written in doesn't matter. */
const atomsOf = formula => JSON.stringify(Object.entries(formulaCount(formula)).sort(([a], [b]) => a.localeCompare(b)));

describe("Puzzle.06 the removed Puzzles", () => {
  test("are the 26 of the spec's table", () => {
    expect(REMOVED.map(p => `${p.name} ${p.formula}`)).toEqual([
      "Ammonia NH3",
      "Carbon disulfide CS2",
      "Chloroform CHCl3",
      "Methanethiol CH4S",
      "Phosgene CCl2O",
      "Vinyl chloride C2H3Cl",
      "Tetrafluoroethylene C2F4",
      "Iodoethane C2H5I",
      "Water H2O",
      "Hydrogen cyanide HCN",
      "Formaldehyde CH2O",
      "Methanol CH4O",
      "Ethylene C2H4",
      "Acrylonitrile C3H3N",
      "Urea CH4N2O",
      "Acetone C3H6O",
      "Ethanol C2H6O",
      "Halothane C2HBrClF3",
      "Lactic acid C3H6O3",
      "Ethyl acetate C4H8O2",
      "Alanine C3H7NO2",
      "Cysteine C3H7NO2S",
      "Threonine C4H9NO3",
      "Valine C5H11NO2",
      "Cyclohexanol C6H12O",
      "Cyclohexane-1,4-dione C6H8O2",
    ]);
    expect(new Set(REMOVED.map(p => p.id)).size).toBe(26);
  });

  test("no Puzzle has the id of a removed one, or a formula with the same Atoms: no Puzzle is ammonia, or NH3", () => {
    const ids = new Set(REMOVED.map(p => p.id)), formulas = new Set(REMOVED.map(p => atomsOf(p.formula)));
    expect(PUZZLES.filter(p => ids.has(p.id) || formulas.has(atomsOf(p.formula))).map(p => p.name)).toEqual([]);
    expect(ids.has("ammonia") && formulas.has(atomsOf("H3N"))).toBe(true);
  });

  test("Ammonia's Grid is 1 by 1, with one N with 3 hydrogens, and its solution has no Bonds", () => {
    const ammonia = REMOVED[0];
    expect([ammonia.name, ammonia.rows, ammonia.cols, ammonia.atoms, ammonia.solution]).toEqual(["Ammonia", 1, 1, [["N", 0, 0, 3]], []]);
  });

  test("only Ammonia and Water are one Atom", () => {
    expect(REMOVED.filter(p => p.atoms.length === 1).map(p => p.name)).toEqual(["Ammonia", "Water"]);
  });

  describe.each(REMOVED)("$name", p => {
    const atoms = p.atoms.map(([el, r, c, h]) => ({ el, r, c, h }));

    test("is a Puzzle, as its schema says", () => {
      expect(schemaErrors("puzzle.schema.json", p)).toEqual([]);
    });

    test("Puzzle.07 gives exactly the Atoms and hydrogens of its formula, each Atom on its own grid point, in reading order, with room for a Bond unless it is the only one", () => {
      expect(atomCount(p)).toEqual(formulaCount(p.formula));
      expect(atoms.every(a => a.el in ELEMENTS && a.el !== "H" && a.r >= 0 && a.r < p.rows && a.c >= 0 && a.c < p.cols)).toBe(true);
      expect(atoms.length === 1 || atoms.every(a => ELEMENTS[a.el].valence - a.h >= 1)).toBe(true);
      expect(new Set(atoms.map(a => `${a.r},${a.c}`)).size).toBe(atoms.length);
      expect(atoms.every((a, i) => i === 0 || a.r > atoms[i - 1].r || (a.r === atoms[i - 1].r && a.c > atoms[i - 1].c))).toBe(true);
    });

    test("Puzzle.04 has a Grid of at most 6 rows and 5 columns", () => {
      expect(p.rows).toBeLessThanOrEqual(6);
      expect(p.cols).toBeLessThanOrEqual(5);
    });

    test("has exactly one solution, with its hydrogens, the one it shows", () => {
      const solutions = solve(atoms, 2);
      expect(solutions).toHaveLength(1);
      const game = createGame(p);
      game.showSolution();
      expect(game.order).toEqual(solutions[0]);
    });
  });
});
