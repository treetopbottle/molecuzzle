// @vitest-environment happy-dom
import { beforeEach, expect, test } from "vitest";
import { renderPanel, formulaNodes } from "../../../src/ui/panel.ts";
import type { KeyElement } from "../../../src/ui/api.ts";
import { one } from "../../helpers/dom.ts";

const puzzles = Array.from({ length: 13 }, (_, i) => ({ id: `p${i + 1}`, name: `Molecule ${i + 1}`, formula: "H2O", fact: `Fact ${i + 1}.` }));
puzzles[10] = { id: "glycine", name: "Glycine", formula: "C2H5NO2", fact: "Glycine is the simplest amino acid." };

let panel: HTMLElement;
beforeEach(() => {
  document.body.innerHTML = '<div id="panel"></div>';
  panel = one(document, "#panel");
});

// What the Glue gives: each Element's number of Bonds, in the order of the key.
const elements: KeyElement[] = [{ symbol: "C", valence: 4 }, { symbol: "N", valence: 3 }, { symbol: "O", valence: 2 }, { symbol: "S", valence: 2 }];
const view = (index: number, { solved = [] as string[], done = false, difficulty = 7 } = {}) => ({
  puzzles, index, done, elements, difficulty,
  progress: { puzzles: Object.fromEntries(solved.map(id => [id, "solved"])), current: puzzles[index].id },
});
const button = (name: string) => {
  const found = panel.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`) ?? [...panel.querySelectorAll("button")].find(b => b.textContent === name);
  if (!found) throw new Error(`no button ${name}`);
  return found;
};
const shown = (el: HTMLElement | undefined) => el && !el.hidden;
const fact = () => [...panel.querySelectorAll("p")].find(p => p.textContent === "Glycine is the simplest amino acid.");

const nav = () => one(panel, "nav").textContent.replace(/\s+/g, " ").trim();

test("Panel.01 the open Puzzle between ‹ and ›, ‹ disabled on Puzzle 1 and › on Puzzle 13", () => {
  renderPanel(panel, view(0));
  expect(nav()).toBe("‹ Puzzle 1 of 13 › Unsolved");
  expect(button("Previous puzzle").disabled).toBe(true);
  expect(button("Next puzzle").disabled).toBe(false);
  expect(button("Next puzzle").dataset.open).toBe("1");

  const next = button("Next puzzle");
  renderPanel(panel, view(12));
  expect(button("Next puzzle")).toBe(next); // rendered in place, so focus stays
  expect(nav()).toBe("‹ Puzzle 13 of 13 › Unsolved");
  expect(button("Previous puzzle").disabled).toBe(false);
  expect(button("Previous puzzle").dataset.open).toBe("11");
  expect(button("Next puzzle").disabled).toBe(true);
});

test("Panel.01 under the nav, the open Puzzle's difficulty, changed in place", () => {
  renderPanel(panel, view(0, { difficulty: 2 }));
  const shown = one(panel, "nav").nextElementSibling;
  if (!shown) throw new Error("nothing after the nav");
  expect(shown.tagName).toBe("P");
  expect(shown.textContent).toBe("Difficulty 2");
  renderPanel(panel, view(12, { difficulty: 67 }));
  expect(one(panel, "nav").nextElementSibling).toBe(shown);
  expect(shown.textContent).toBe("Difficulty 67");
});

test("Panel.01 a solved Puzzle says so next to it", () => {
  renderPanel(panel, view(10, { solved: ["glycine"], done: true }));
  expect(nav()).toBe("‹ Puzzle 11 of 13 › ✓ Solved");
});

test("Panel.02 until it is solved, a mystery molecule", () => {
  renderPanel(panel, view(10));
  expect(panel.textContent).toContain("Mystery molecule");
  expect(one(panel, "h1").textContent).toBe("?");
  expect(panel.textContent).toContain("Bond every atom to find out what it is.");
  expect(shown(fact())).toBeFalsy();
  expect(shown(button("Next puzzle →"))).toBeFalsy();
});

test("Panel.03 once it is, its name, its formula with subscripts, its fact and Next puzzle", () => {
  renderPanel(panel, view(10, { solved: ["glycine"], done: true }));
  expect(one(panel, "h1").textContent).toBe("Glycine");
  expect(panel.textContent).not.toContain("Bond every atom to find out what it is.");
  expect(panel.innerHTML).toContain("C<sub>2</sub>H<sub>5</sub>NO<sub>2</sub>");
  expect(shown(fact())).toBe(true);
  expect(shown(button("Next puzzle →"))).toBe(true);
  expect(button("Next puzzle →").dataset.open).toBe("11");

  renderPanel(panel, view(12, { done: true }));
  expect(shown(button("Next puzzle →"))).toBeFalsy();
});

test("Panel.03 formulas show their numbers as subscripts", () => {
  const p = document.createElement("p");
  p.append(...formulaNodes(document, "C2H5NO2"));
  expect(p.innerHTML).toBe("C<sub>2</sub>H<sub>5</sub>NO<sub>2</sub>");
});

test("Panel.04 the rules of the game, the one on valence pointing to the key, and one on the counts under the Board", () => {
  renderPanel(panel, view(0));
  // The text of each rule itself, not of the key inside the rule on valence (Panel.05).
  const ownText = (li: Element) => [...li.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join("");
  expect([...panel.querySelectorAll("ol > li")].map(ownText)).toEqual([
    "Bonds run straight along a row or column, between atoms with nothing in between. The dotted lines show where they can go.",
    "Click a dotted line to bond. Click again for a double, then a triple bond; once more removes it. Right-click lowers it.",
    "Bonds can't cross.",
    "Each atom needs exactly its number of bonds, as in the key below. Its small hydrogens are already bonded and count.",
    "Under the board are the bonds you use, of the bonds the solution has. You may use more, but then it isn't solved.",
    "All atoms join into one molecule. There is exactly one solution.",
  ]);
});

test("Panel.05 the key, in the rule on valence: each Element as a ball with as many sticks as bonds, and the number", () => {
  renderPanel(panel, view(0));
  const key = panel.querySelectorAll("ol > li:nth-child(4) figure");
  expect([...key].map(f => f.getAttribute("aria-label"))).toEqual([
    "Carbon: 4 bonds", "Nitrogen: 3 bonds", "Oxygen: 2 bonds", "Sulfur: 2 bonds",
  ]);
  expect([...key].map(f => f.querySelectorAll(".stick").length)).toEqual([4, 3, 2, 2]);
  expect([...key].map(f => one(f, ".sym").textContent)).toEqual(["C", "N", "O", "S"]);
  expect([...key].map(f => one(f, ".valence").textContent)).toEqual(["4", "3", "2", "2"]);
  expect([...key].every(f => f.getAttribute("role") === "img")).toBe(true);
  expect(panel.querySelectorAll("figure")).toHaveLength(4); // only in that rule
});

test("Panel.05 the key is drawn once, and stays when the panel is rendered again", () => {
  renderPanel(panel, view(0));
  const first = panel.querySelector("figure");
  renderPanel(panel, view(1));
  expect(panel.querySelector("figure")).toBe(first);
  expect(panel.querySelectorAll("figure")).toHaveLength(4);
});
