import { describe, expect, test } from "vitest";
import { REMOVED } from "../../../src/puzzle/removed.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";

/** The Atoms of a formula, as counts per Element, so the order it is written in doesn't matter. */
const atomsOf = formula => JSON.stringify(Object.fromEntries(
  [...formula.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(([, el, n]) => [el, Number(n || 1)]).sort(([a], [b]) => a.localeCompare(b))));

// The removed Puzzles are kept as they were, some with their hydrogens as
// Atoms on the Grid, so only their ids and formulas are checked (decision 0023).
describe("Puzzle.06 the removed Puzzles", () => {
  test("are the 24 of the spec's table", () => {
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
    ]);
    expect(new Set(REMOVED.map(p => p.id)).size).toBe(24);
  });

  test("no Puzzle has the id of a removed one, or a formula with the same Atoms: no Puzzle is ammonia, or NH3", () => {
    const ids = new Set(REMOVED.map(p => p.id)), formulas = new Set(REMOVED.map(p => atomsOf(p.formula)));
    expect(PUZZLES.filter(p => ids.has(p.id) || formulas.has(atomsOf(p.formula))).map(p => p.name)).toEqual([]);
    expect(ids.has("ammonia") && formulas.has(atomsOf("H3N"))).toBe(true);
  });
});
