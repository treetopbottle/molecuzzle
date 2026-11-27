import { expect, test } from "vitest";
import { findLayout } from "../../../src/puzzle/generate.ts";
import { candidateBonds } from "../../../src/puzzle/grid.ts";
import { solve } from "../../../src/puzzle/solver.ts";

test("Generate.01 finds the layout of Acetonitrile on which it is the only solution, its Atoms with their hydrogens", () => {
  expect(findLayout("CH3-C C#N", { tries: 2000, maxRows: 3, maxCols: 3, seed: 1 })).toEqual({
    rows: 1, cols: 3,
    atoms: [["N", 0, 0, 0], ["C", 0, 1, 0], ["C", 0, 2, 3]],
    solution: [[0, 1, 3], [1, 2, 1]],
  });
});

test("Generate.03 finds a layout of Caffeine, with its two rings, in 200 tries: at most 6 by 5, and its one solution is these Bonds", () => {
  const layout = findLayout("N:1-C:2 C:2=O:2 C:2-N:3 N:3-C:4 C:4=C:5 C:5-C:6 C:6=O:6 C:6-N:1 C:4-N:9 N:9=CH:8 CH:8-N:7 N:7-C:5 N:1-CH3:a N:3-CH3:b N:7-CH3:c", { tries: 200, seed: 1 });
  if (!layout) throw new Error("no layout of Caffeine");
  expect(layout.rows).toBeLessThanOrEqual(6);
  expect(layout.cols).toBeLessThanOrEqual(5);
  const atoms = layout.atoms.map(([el, r, c, h]) => ({ el, r, c, h }));
  const bonds = candidateBonds(atoms), solutions = solve(atoms, 2);
  expect(solutions).toHaveLength(1);
  const made = bonds.flatMap((e, k) => (solutions[0][k] ? [[e.a, e.b, solutions[0][k]].join()] : []));
  expect(made.sort()).toEqual(layout.solution.map(String).sort());
  expect(atoms.map(a => a.el + a.h).sort()).toEqual(["C0", "C0", "C0", "C0", "C1", "C3", "C3", "C3", "N0", "N0", "N0", "N0", "O0", "O0"]);
});

test("Generate.01 Atoms with the same label are told apart by a name after `:`", () => {
  const layout = findLayout("OH:a-CH2:a CH2:a-CH CH-OH:b CH-CH2:b CH2:b-OH:c", { tries: 2000, seed: 1 });
  if (!layout) throw new Error("no layout");
  expect(layout.atoms.map(([el, , , h]) => el + h).sort()).toEqual(["C1", "C2", "C2", "O1", "O1", "O1"]);
  expect(layout.solution).toHaveLength(5);
});

test("Generate.01 the same seed gives the same layout", () => {
  const options = { tries: 300, maxRows: 4, maxCols: 4, seed: 7 };
  const layout = findLayout("CH3-C C=O C-OH", options);
  expect(layout).not.toBeNull();
  expect(findLayout("CH3-C C=O C-OH", options)).toEqual(layout);
});

test("Generate.02 a Bond it can't read stops it: CH3-C C~N", () => {
  expect(() => findLayout("CH3-C C~N")).toThrow("can't read C~N");
  expect(() => findLayout("CH3-C C-")).toThrow("can't read C-");
});

test.each([
  ["CH3-Xx", "an Element the game doesn't have"],
  ["Xx-CH3", "an Element the game doesn't have, first"],
  ["CH3-constructor", "a label that isn't one"],
  ["C2-O", "a count with no H"],
  ["CH1-C", "a count of 1, which a formula doesn't write"],
  ["CH3-C:", "a `:` with no name"],
  ["H-C", "H as an Element"],
  ["HH-C", "H as an Element, with a hydrogen"],
  ["CH4-C", "hydrogens that leave the Atom no room for a Bond"],
  ["C-OH2", "hydrogens that leave the Atom no room for a Bond, second"],
])("Generate.02 a Bond with %s, %s, stops it", bond => {
  expect(() => findLayout(bond)).toThrow(`can't read ${bond}`);
});

test("Generate.02 Bonds that don't give each Atom its valence give no layout: C─O in Acetic acid, or a second Bond on its OH", () => {
  expect(findLayout("CH3-C C-O C-OH", { tries: 2000, maxRows: 3, maxCols: 3, seed: 1 })).toBeNull();
  expect(findLayout("CH3-C C=O C=OH", { tries: 2000, maxRows: 3, maxCols: 3, seed: 1 })).toBeNull();
});

test("Generate.02 no layout with exactly one solution gives null", () => {
  expect(findLayout("CH3-C C#N", { tries: 100, maxRows: 1, maxCols: 1, seed: 1 })).toBeNull();
});
