// @vitest-environment happy-dom
import { beforeEach, expect, test } from "vitest";
import { renderPanel, formulaNodes } from "../../../src/ui/panel.js";

const puzzles = Array.from({ length: 13 }, (_, i) => ({ id: `p${i + 1}`, name: `Molecule ${i + 1}`, formula: "H2O", fact: `Fact ${i + 1}.` }));
puzzles[10] = { id: "glycine", name: "Glycine", formula: "C2H5NO2", fact: "Glycine is the simplest amino acid." };

let panel;
beforeEach(() => {
  document.body.innerHTML = '<div id="panel"></div>';
  panel = document.getElementById("panel");
});

// What the Glue gives: each Element's number of Bonds, in the order of the key.
const elements = Object.entries({ C: 4, N: 3, O: 2, S: 2, F: 1, Cl: 1, Br: 1, I: 1 }).map(([symbol, valence]) => ({ symbol, valence }));
const view = (index, { solved = [], done = false } = {}) => ({
  puzzles, index, done, elements,
  progress: { puzzles: Object.fromEntries(solved.map(id => [id, "solved"])), current: puzzles[index].id },
});
const button = name => panel.querySelector(`button[aria-label="${name}"]`) ?? [...panel.querySelectorAll("button")].find(b => b.textContent === name);
const shown = el => el && !el.hidden;
const fact = () => [...panel.querySelectorAll("p")].find(p => p.textContent === "Glycine is the simplest amino acid.");

const nav = () => panel.querySelector("nav").textContent.replace(/\s+/g, " ").trim();

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

test("Panel.01 a solved Puzzle says so next to it", () => {
  renderPanel(panel, view(10, { solved: ["glycine"], done: true }));
  expect(nav()).toBe("‹ Puzzle 11 of 13 › ✓ Solved");
});

test("Panel.02 until it is solved, a mystery molecule", () => {
  renderPanel(panel, view(10));
  expect(panel.textContent).toContain("Mystery molecule");
  expect(panel.querySelector("h1").textContent).toBe("?");
  expect(panel.textContent).toContain("Bond every atom to find out what it is.");
  expect(shown(fact())).toBeFalsy();
  expect(shown(button("Next puzzle →"))).toBeFalsy();
});

test("Panel.03 once it is, its name, its formula with subscripts, its fact and Next puzzle", () => {
  renderPanel(panel, view(10, { solved: ["glycine"], done: true }));
  expect(panel.querySelector("h1").textContent).toBe("Glycine");
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
  const ownText = li => [...li.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join("");
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
    "Fluorine: 1 bond", "Chlorine: 1 bond", "Bromine: 1 bond", "Iodine: 1 bond",
  ]);
  expect([...key].map(f => f.querySelectorAll(".stick").length)).toEqual([4, 3, 2, 2, 1, 1, 1, 1]);
  expect([...key].map(f => f.querySelector(".sym").textContent)).toEqual(["C", "N", "O", "S", "F", "Cl", "Br", "I"]);
  expect([...key].map(f => f.querySelector(".valence").textContent)).toEqual(["4", "3", "2", "2", "1", "1", "1", "1"]);
  expect([...key].every(f => f.getAttribute("role") === "img")).toBe(true);
  expect(panel.querySelectorAll("figure")).toHaveLength(8); // only in that rule
});

test("Panel.05 the key is drawn once, and stays when the panel is rendered again", () => {
  renderPanel(panel, view(0));
  const first = panel.querySelector("figure");
  renderPanel(panel, view(1));
  expect(panel.querySelector("figure")).toBe(first);
  expect(panel.querySelectorAll("figure")).toHaveLength(8);
});
