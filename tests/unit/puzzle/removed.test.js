import { describe, expect, test } from "vitest";
import { REMOVED } from "../../../src/puzzle/removed.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { solve } from "../../../src/puzzle/solver.js";
import { createGame } from "../../../src/puzzle/game.js";
import { schemaErrors } from "../../helpers/schemas.js";

/** The Atoms of a formula, as counts per Element, so the order it is written in doesn't matter. */
const atomsOf = formula => JSON.stringify(Object.fromEntries(
  [...formula.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(([, el, n]) => [el, Number(n || 1)]).sort(([a], [b]) => a.localeCompare(b))));

describe("Puzzle.06 the removed Puzzles", () => {
  test("are the eight of the spec's table", () => {
    expect(REMOVED.map(p => `${p.name} ${p.formula}`)).toEqual([
      "Ammonia NH3",
      "Carbon disulfide CS2",
      "Chloroform CHCl3",
      "Methanethiol CH4S",
      "Phosgene CCl2O",
      "Vinyl chloride C2H3Cl",
      "Tetrafluoroethylene C2F4",
      "Iodoethane C2H5I",
    ]);
  });

  test.each(REMOVED)("$name is kept as a Puzzle, with the Atoms of its formula and exactly one solution, its own", p => {
    expect(schemaErrors("puzzle.schema.json", p)).toEqual([]);
    const counts = p.atoms.reduce((m, [el]) => ({ ...m, [el]: (m[el] ?? 0) + 1 }), {});
    expect(atomsOf(Object.entries(counts).map(([el, n]) => el + n).join(""))).toBe(atomsOf(p.formula));
    const solutions = solve(p.atoms.map(([el, r, c]) => ({ el, r, c })), 2);
    expect(solutions).toHaveLength(1);
    const game = createGame(p);
    game.showSolution();
    expect(game.order).toEqual(solutions[0]);
  });

  test("no Puzzle has the id of a removed one, or a formula with the same Atoms: no Puzzle is ammonia, or NH3", () => {
    const ids = new Set(REMOVED.map(p => p.id)), formulas = new Set(REMOVED.map(p => atomsOf(p.formula)));
    expect(PUZZLES.filter(p => ids.has(p.id) || formulas.has(atomsOf(p.formula))).map(p => p.name)).toEqual([]);
    expect(ids.has("ammonia") && formulas.has(atomsOf("H3N"))).toBe(true);
  });
});
