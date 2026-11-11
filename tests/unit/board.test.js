// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createBoard } from "../../src/board.js";
import { createGame } from "../../src/game.js";
import { PUZZLES } from "../../src/puzzles.js";

const puzzle = id => PUZZLES.find(p => p.id === id);
let svg;
beforeEach(() => {
  document.body.innerHTML = '<svg id="board"></svg>';
  svg = document.getElementById("board");
});

const labels = selector => [...svg.querySelectorAll(selector)].map(e => e.getAttribute("aria-label"));
const edge = name => [...svg.querySelectorAll(".edge")].find(e => e.getAttribute("aria-label").startsWith(name));

describe("Board", () => {
  test("Grid.01, Valence.01 names each Atom with what it needs, and each dotted line", () => {
    createBoard(svg, createGame(puzzle("formaldehyde")), { onChange() {} });
    expect(svg.getAttribute("aria-label")).toBe("Board, 3 by 2");
    expect(labels(".atom")).toMatchInlineSnapshot(`
      [
        "Hydrogen 1,1: needs 1 more bond",
        "Carbon 2,1: needs 4 more bonds",
        "Hydrogen 2,2: needs 1 more bond",
        "Oxygen 3,1: needs 2 more bonds",
      ]
    `);
    expect(labels(".edge")).toMatchInlineSnapshot(`
      [
        "H 1,1 to C 2,1: no bond",
        "C 2,1 to H 2,2: no bond",
        "C 2,1 to O 3,1: no bond",
      ]
    `);
    expect(svg.querySelectorAll(".edge .maybe")).toHaveLength(3);
  });

  test("Bond.01, Bond.06, Bond.07 clicks, right-clicks and keys on a Bond go to onChange", () => {
    const onChange = vi.fn();
    createBoard(svg, createGame(puzzle("water")), { onChange });
    const bond = edge("H 1,1 to O 1,2");
    bond.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    bond.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    for (const key of ["Enter", " ", "Backspace", "Delete", "-", "a"])
      bond.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    expect(onChange.mock.calls).toEqual([[0, 1], [0, -1], [0, 1], [0, 1], [0, -1], [0, -1], [0, -1]]);
    expect(bond.getAttribute("tabindex")).toBe("0");
    expect(bond.getAttribute("role")).toBe("button");
  });

  test("Valence.01, Valence.02 render shows Bonds, what Atoms still need, and complete Atoms", () => {
    const game = createGame(puzzle("formaldehyde"));
    const board = createBoard(svg, game, { onChange() {} });
    game.change(2, 1);
    game.change(2, 1);
    board.render();
    expect(edge("C 2,1 to O 3,1").getAttribute("aria-label")).toBe("C 2,1 to O 3,1: double bond");
    expect(edge("C 2,1 to O 3,1").querySelectorAll(".vis")).toHaveLength(2);
    expect(labels(".atom")[3]).toBe("Oxygen 3,1: complete");
    expect(svg.querySelectorAll(".atom.ok")).toHaveLength(1);
    expect(svg.querySelectorAll(".atom .badge text")[1].textContent).toBe("2");
  });

  test("Check.04 a solved Board is marked solved, so its Atoms pulse", () => {
    const game = createGame(puzzle("water"));
    const board = createBoard(svg, game, { onChange() {} });
    game.change(0, 1);
    game.change(1, 1);
    board.render();
    expect(svg.classList.contains("solved")).toBe(true);
  });
});
