import { expect, test } from "vitest";
import { findLayout } from "../../../src/puzzle/generate.js";

test("Generate.01 finds the layout of Acetonitrile on which it is the only solution, its Atoms with their hydrogens", () => {
  expect(findLayout("CH3-C C#N", { tries: 2000, maxRows: 3, maxCols: 3, seed: 1 })).toEqual({
    rows: 3, cols: 1,
    atoms: [["C", 0, 0, 3], ["C", 1, 0, 0], ["N", 2, 0, 0]],
    solution: [[0, 1, 1], [1, 2, 3]],
  });
});

test("Generate.01 Atoms with the same label are told apart by a name after `:`", () => {
  const layout = findLayout("OH:a-CH2:a CH2:a-CH CH-OH:b CH-CH2:b CH2:b-OH:c", { tries: 2000, seed: 1 });
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
  ["CH3-C:", "a `:` with no name"],
  ["H-C", "H as an Element"],
  ["HH-C", "H as an Element, with a hydrogen"],
  ["CH4-C", "hydrogens that leave the Atom no room for a Bond"],
  ["C-OH2", "hydrogens that leave the Atom no room for a Bond, second"],
])("Generate.02 a Bond with %s, %s, stops it", bond => {
  expect(() => findLayout(bond)).toThrow(`can't read ${bond}`);
});

test("Generate.02 no layout with exactly one solution gives null", () => {
  expect(findLayout("CH3-C C#N", { tries: 100, maxRows: 1, maxCols: 1, seed: 1 })).toBeNull();
});
