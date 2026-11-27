import { expect, test } from "vitest";
import { statusText, reasonText } from "../../../src/ui/messages.ts";
import type { ChangeResult, Status } from "../../../src/puzzle/api.ts";

// What the Glue passes on: the game's status and change result, as the game gives them.
const status = (s: Status) => s, result = (r: ChangeResult) => r;

test("Messages.01 the status line says the text of each status", () => {
  const glycine = { name: "Glycine" }, serine = { name: "Serine" };
  expect(statusText({ kind: "empty" }, glycine)).toBe("Click a dotted line between two atoms to bond them.");
  expect(statusText(status({ kind: "open", few: 3, many: 0 }), glycine)).toBe("Not every atom has the right number of bonds yet.");
  expect(statusText(status({ kind: "open", few: 0, many: 1 }), glycine)).toBe("Not every atom has the right number of bonds yet.");
  expect(statusText({ kind: "pieces" }, glycine))
    .toBe("Every atom has its bonds, but they form more than one molecule. Everything must join up.");
  expect(statusText({ kind: "solved" }, glycine)).toBe("✓ Solved! It's Glycine.");
  expect(statusText({ kind: "revealed" }, serine)).toBe("Here is Serine. Reset and build it yourself to mark it solved.");
});

test("Messages.02 a Bond that isn't made says why: only that Bonds can't cross", () => {
  // @ts-expect-error a reason the game doesn't give, which the UI words as none
  expect(reasonText({ changed: false, reason: "full", atom: 1 })).toBeNull();
  expect(reasonText(result({ changed: false, reason: "crossing" }))).toBe("Bonds can't cross.");
  expect(reasonText(result({ changed: false }))).toBeNull();
  expect(reasonText(result({ changed: true }))).toBeNull();
});
