import { expect, test } from "vitest";
import { solve } from "../../src/solver.js";

const atoms = list => list.map(([el, r, c]) => ({ el, r, c }));

test("finds the one way to bond water", () => {
  expect(solve(atoms([["H", 0, 0], ["O", 0, 1], ["H", 0, 2]]))).toEqual([[1, 1]]);
});

test("finds both ways when there are two", () => {
  // Cyclobutadiene: a ring of four C, each with one H, and the double Bonds
  // on either pair of opposite sides.
  const ring = atoms([
    ["H", 0, 1], ["H", 0, 2],
    ["C", 1, 1], ["C", 1, 2],
    ["C", 2, 1], ["C", 2, 2],
    ["H", 3, 1], ["H", 3, 2],
  ]);
  expect(solve(ring, 5)).toHaveLength(2);
});

test("finds none when the Atoms can't all be bonded", () => {
  expect(solve(atoms([["H", 0, 0], ["H", 0, 1], ["H", 0, 2]]))).toEqual([]);
});

test("rejects solutions in more than one piece", () => {
  expect(solve(atoms([["H", 0, 0], ["H", 0, 1], ["H", 1, 0], ["H", 1, 1]]))).toEqual([]);
});

test("rejects crossing Bonds", () => {
  // An O on each side of a plus: the only bonding is the two crossing O=O.
  expect(solve(atoms([["O", 0, 1], ["O", 1, 0], ["O", 1, 2], ["O", 2, 1]]))).toEqual([]);
});
