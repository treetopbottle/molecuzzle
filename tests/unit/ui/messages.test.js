import { expect, test } from "vitest";
import { statusText, reasonText } from "../../../src/ui/messages.js";

test("Messages.01 the status line says the text of each status", () => {
  const glycine = { name: "Glycine" }, urea = { name: "Urea" };
  expect(statusText({ kind: "empty" }, glycine)).toBe("Click a dotted line between two atoms to bond them.");
  expect(statusText({ kind: "open", open: 3 }, glycine)).toBe("3 atoms still need bonds.");
  expect(statusText({ kind: "open", open: 1 }, glycine)).toBe("1 atom still needs bonds.");
  expect(statusText({ kind: "pieces" }, glycine))
    .toBe("Every atom has its bonds, but they form more than one molecule. Everything must join up.");
  expect(statusText({ kind: "solved" }, glycine)).toBe("✓ Solved! It's Glycine.");
  expect(statusText({ kind: "revealed" }, urea)).toBe("Here is Urea. Reset and build it yourself to mark it solved.");
});

test("Messages.02 a Bond that isn't made says why, with the Element's name", () => {
  const atoms = ["H", "O", "N", "C"].map(el => ({ el, r: 0, c: 0 }));
  const full = atom => reasonText({ changed: false, reason: "full", atom }, atoms);
  expect([0, 1, 2, 3].map(full)).toEqual([
    "Hydrogen already has all its bonds.",
    "Oxygen already has all its bonds.",
    "Nitrogen already has all its bonds.",
    "Carbon already has all its bonds.",
  ]);
  expect(reasonText({ changed: false, reason: "crossing" }, atoms)).toBe("Bonds can't cross.");
  expect(reasonText({ changed: false }, atoms)).toBeNull();
  expect(reasonText({ changed: true }, atoms)).toBeNull();
});
