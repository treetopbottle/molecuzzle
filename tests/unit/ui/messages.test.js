import { expect, test } from "vitest";
import { statusText, reasonText } from "../../../src/ui/messages.js";

test("Messages.01 the status line says the text of each status", () => {
  const glycine = { name: "Glycine" }, serine = { name: "Serine" };
  expect(statusText({ kind: "empty" }, glycine)).toBe("Click a dotted line between two atoms to bond them.");
  expect(statusText({ kind: "open", few: 3, many: 0 }, glycine)).toBe("Not every atom has exactly its bonds yet.");
  expect(statusText({ kind: "open", few: 0, many: 1 }, glycine)).toBe("Not every atom has exactly its bonds yet.");
  expect(statusText({ kind: "pieces" }, glycine))
    .toBe("Every atom has its bonds, but they form more than one molecule. Everything must join up.");
  expect(statusText({ kind: "solved" }, glycine)).toBe("✓ Solved! It's Glycine.");
  expect(statusText({ kind: "revealed" }, serine)).toBe("Here is Serine. Reset and build it yourself to mark it solved.");
});

test("Messages.02 a Bond that isn't made says why: only that Bonds can't cross", () => {
  expect(reasonText({ changed: false, reason: "full", atom: 1 })).toBeNull();
  expect(reasonText({ changed: false, reason: "crossing" })).toBe("Bonds can't cross.");
  expect(reasonText({ changed: false })).toBeNull();
  expect(reasonText({ changed: true })).toBeNull();
});
