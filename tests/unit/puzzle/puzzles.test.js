import { describe, expect, test } from "vitest";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { ELEMENTS } from "../../../src/puzzle/elements.js";
import { solve } from "../../../src/puzzle/solver.js";
import { createGame } from "../../../src/puzzle/game.js";
import { difficulty, dottedLines } from "../../../src/puzzle/difficulty.js";
import { schemaErrors } from "../../helpers/schemas.ts";
import { atomCount, formulaCount } from "../../helpers/formula.ts";

describe("Puzzle.01 the puzzles", () => {
  test("Puzzle.09 each budget is the Bonds of its solution, and half of what its Atoms need", () => {
    const budgets = PUZZLES.map(p => {
      const game = createGame(p), needs = game.atoms.reduce((t, _, i) => t + game.remaining(i), 0);
      expect(game.budget).toBe(p.solution.reduce((t, [, , n]) => t + n, 0));
      expect(game.budget * 2).toBe(needs);
      return game.budget;
    });
    expect(budgets[1]).toBe(4); // Acetic acid
    expect(budgets).toHaveLength(30);
  });

  test("Puzzle.05 are the 30 of the spec's table, with their difficulty, in order of difficulty", () => {
    expect(PUZZLES.map(p => `${p.name} ${p.formula} ${difficulty(p)}`)).toEqual([
      "Acetonitrile C2H3N 2",
      "Acetic acid C2H4O2 3",
      "Glycine C2H5NO2 7",
      "Morpholine C4H9NO 9",
      "Cyclohexene C6H10 9",
      "Glycerol C3H8O3 11",
      "1,4-Benzoquinone C6H4O2 11",
      "Serine C3H7NO3 12",
      "Malic acid C4H6O5 17",
      "Tartaric acid C4H6O6 21",
      "Glutamic acid C5H9NO4 21",
      "Glucose C6H12O6 24",
      "Citric acid C6H8O7 27",
      "Biotin C10H16N2O3S 32",
      "N-Acetylglucosamine C8H15NO6 33",
      "Cystine C6H12N2O4S2 34",
      "Pantothenic acid C9H17NO5 35",
      "Uridine C9H12N2O6 36",
      "Carnosine C9H14N4O3 37",
      "Streptozotocin C8H15N3O7 42",
      "Tetraglycine C8H14N4O5 43",
      "Abscisic acid C15H20O4 43",
      "N-Acetylneuraminic acid C11H19NO9 51",
      "Retinol C20H30O 51",
      "Glutathione C10H17N3O6S 52",
      "Domoic acid C15H21NO6 55",
      "Sucrose C12H22O11 57",
      "Picrocrocin C16H26O7 57",
      "Mugineic acid C12H20N2O8 58",
      "Prostaglandin E2 C20H32O5 67",
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

  test("Puzzle.04 Glucose, Citric acid, N-Acetylglucosamine and N-Acetylneuraminic acid have Grids of 3 rows and 5 columns, 6 rows and 3 columns, 5 rows and 5 columns, and 6 rows and 5 columns", () => {
    const [glucose, citric, glcnac, neuraminic] = [PUZZLES[11], PUZZLES[12], PUZZLES[14], PUZZLES[22]];
    expect([glucose.name, glucose.rows, glucose.cols]).toEqual(["Glucose", 3, 5]);
    expect([citric.name, citric.rows, citric.cols]).toEqual(["Citric acid", 6, 3]);
    expect([glcnac.name, glcnac.rows, glcnac.cols]).toEqual(["N-Acetylglucosamine", 5, 5]);
    expect([neuraminic.name, neuraminic.rows, neuraminic.cols]).toEqual(["N-Acetylneuraminic acid", 6, 5]);
  });

  test("Puzzle.07 Acetic acid's Atoms are an O with no hydrogens, a C with 3, a C with none and an O with 1", () => {
    expect(PUZZLES[1].atoms.map(([el, , , h]) => `${el} ${h}`)).toEqual(["O 0", "C 3", "C 0", "O 1"]);
  });

  test("Puzzle.08 every Puzzle after the first three has at least 2 loops", () => {
    expect(PUZZLES.slice(0, 3).map(p => dottedLines(p).loops)).toEqual([0, 0, 1]);
    expect(PUZZLES.slice(3).filter(p => dottedLines(p).loops < 2).map(p => p.name)).toEqual([]);
  });
});
