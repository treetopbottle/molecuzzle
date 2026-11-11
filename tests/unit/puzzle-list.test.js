// @vitest-environment happy-dom
import { expect, test, vi } from "vitest";
import { renderPuzzleList, formulaNodes } from "../../src/puzzle-list.js";

const puzzles = [{ id: "water", name: "Water" }, { id: "ammonia", name: "Ammonia" }, { id: "urea", name: "Urea" }];

test("Puzzle.04 one button per puzzle, with its state, the open one marked", () => {
  document.body.innerHTML = "<ol></ol>";
  const list = document.querySelector("ol"), onPick = vi.fn();
  renderPuzzleList(list, puzzles, { puzzles: { water: "solved", ammonia: "revealed" } }, 2, onPick);
  const buttons = [...list.querySelectorAll("button")];
  expect(buttons.map(b => `${b.textContent} | ${b.getAttribute("aria-label")} | ${b.getAttribute("aria-current")}`))
    .toMatchInlineSnapshot(`
      [
        "1 ✓ | Puzzle 1: Water, solved | null",
        "2 👁 | Puzzle 2: Ammonia, solution seen | null",
        "3 | Puzzle 3 | true",
      ]
    `);
  buttons[1].click();
  expect(onPick).toHaveBeenCalledWith(1);
});

test("Check.04 formulas show their numbers as subscripts", () => {
  const p = document.createElement("p");
  p.append(...formulaNodes(document, "C2H5NO2"));
  expect(p.innerHTML).toBe("C<sub>2</sub>H<sub>5</sub>NO<sub>2</sub>");
});
