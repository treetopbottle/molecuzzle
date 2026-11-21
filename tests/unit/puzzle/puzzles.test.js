import { describe, expect, test } from "vitest";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { ELEMENTS } from "../../../src/puzzle/elements.js";
import { solve } from "../../../src/puzzle/solver.js";
import { createGame } from "../../../src/puzzle/game.js";
import { difficulty, dottedLines } from "../../../src/puzzle/difficulty.js";
import { schemaErrors } from "../../helpers/schemas.js";

const formulaCount = f => Object.fromEntries([...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(([, el, n]) => [el, Number(n || 1)]));
/** A Puzzle's Atoms and their hydrogens, counted per Element, as in a formula. */
const atomCount = p => p.atoms.reduce((m, [el, , , h]) => {
  m[el] = (m[el] ?? 0) + 1;
  if (h) m.H = (m.H ?? 0) + h;
  return m;
}, {});

describe("Puzzle.01 the puzzles", () => {
  test("Puzzle.05 are the 15 of the spec's table, with their difficulty, in order of difficulty", () => {
    expect(PUZZLES.map(p => `${p.name} ${p.formula} ${difficulty(p)}`)).toEqual([
      "Acetonitrile C2H3N 2",
      "Acetic acid C2H4O2 3",
      "Glycine C2H5NO2 7",
      "Glycerol C3H8O3 11",
      "Morpholine C4H9NO 11",
      "Cyclohexene C6H10 11",
      "Serine C3H7NO3 12",
      "Cyclohexanol C6H12O 12",
      "Cyclohexane-1,4-dione C6H8O2 13",
      "1,4-Benzoquinone C6H4O2 13",
      "Malic acid C4H6O5 17",
      "Tartaric acid C4H6O6 21",
      "Glutamic acid C5H9NO4 21",
      "Glucose C6H12O6 26",
      "Citric acid C6H8O7 27",
    ]);
    const scores = PUZZLES.map(difficulty);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
    expect(new Set(PUZZLES.map(p => p.id)).size).toBe(PUZZLES.length);
  });

  describe.each(PUZZLES)("$name", p => {
    const atoms = p.atoms.map(([el, r, c, h]) => ({ el, r, c, h }));

    test("is a Puzzle, as its schema says", () => {
      expect(schemaErrors("puzzle.schema.json", p)).toEqual([]);
    });

    test("Puzzle.07 gives exactly the Atoms and hydrogens of its formula, each Atom on its own grid point, in reading order, with room for a Bond", () => {
      expect(atomCount(p)).toEqual(formulaCount(p.formula));
      expect(atoms.every(a => a.el in ELEMENTS && a.el !== "H" && a.r >= 0 && a.r < p.rows && a.c >= 0 && a.c < p.cols)).toBe(true);
      expect(atoms.every(a => ELEMENTS[a.el].valence - a.h >= 1)).toBe(true);
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

  test("Puzzle.04 Glucose and Citric acid have Grids of 3 rows and 5 columns, and 6 rows and 3 columns", () => {
    const [glucose, citric] = [PUZZLES[13], PUZZLES[14]];
    expect([glucose.name, glucose.rows, glucose.cols]).toEqual(["Glucose", 3, 5]);
    expect([citric.name, citric.rows, citric.cols]).toEqual(["Citric acid", 6, 3]);
  });

  test("Puzzle.07 Acetic acid's Atoms are an O with no hydrogens, a C with 3, a C with none and an O with 1", () => {
    expect(PUZZLES[1].atoms.map(([el, , , h]) => `${el} ${h}`)).toEqual(["O 0", "C 3", "C 0", "O 1"]);
  });

  test("Puzzle.08 every Puzzle after the first three has at least 2 loops", () => {
    expect(PUZZLES.slice(0, 3).map(p => dottedLines(p).loops)).toEqual([0, 0, 1]);
    expect(PUZZLES.slice(3).filter(p => dottedLines(p).loops < 2).map(p => p.name)).toEqual([]);
  });
});
