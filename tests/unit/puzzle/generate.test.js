import { expect, test } from "vitest";
import { findLayout } from "../../../src/puzzle/generate.js";

test("Generate.01 finds the layout of water on which it is the only solution", () => {
  expect(findLayout("H1-O1 O1-H2", { tries: 2000, maxRows: 3, maxCols: 3, seed: 1 })).toEqual({
    rows: 3, cols: 1,
    atoms: [["H", 0, 0], ["O", 1, 0], ["H", 2, 0]],
    solution: [[0, 1, 1], [1, 2, 1]],
  });
});

test("Generate.01 the same seed gives the same layout", () => {
  const options = { tries: 300, maxRows: 4, maxCols: 4, seed: 7 };
  const layout = findLayout("H1-C1 C1-H2 C1=O1", options);
  expect(layout).not.toBeNull();
  expect(findLayout("H1-C1 C1-H2 C1=O1", options)).toEqual(layout);
});

test("Generate.02 a Bond it can't read stops it", () => {
  expect(() => findLayout("H1-O1 O1~H2")).toThrow("can't read O1~H2");
});

test("Generate.02 a Bond with an Element the game doesn't have stops it", () => {
  expect(() => findLayout("H1-Xx1")).toThrow("can't read H1-Xx1");
  expect(() => findLayout("H1-constructor1")).toThrow("can't read H1-constructor1");
});

test("Generate.02 no layout with exactly one solution gives null", () => {
  expect(findLayout("H1-O1 O1-H2", { tries: 100, maxRows: 1, maxCols: 1, seed: 1 })).toBeNull();
});
