// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createBoard } from "../../../src/ui/board.js";
import { createGame } from "../../../src/puzzle/game.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { ELEMENTS as VALENCES } from "../../../src/puzzle/elements.js";
import { ELEMENTS as LOOKS } from "../../../src/ui/elements.js";
import { click, build } from "../../helpers/draw.js";
import { rgb, hue, lightness, inHue } from "../../helpers/colors.js";

const puzzle = id => PUZZLES.find(p => p.id === id);
let svg;
beforeEach(() => {
  document.body.innerHTML = '<svg id="board"></svg>';
  svg = document.getElementById("board");
});

const labels = selector => [...svg.querySelectorAll(selector)].map(e => e.getAttribute("aria-label"));
const edge = name => [...svg.querySelectorAll(".edge")].find(e => e.getAttribute("aria-label").startsWith(name));

describe("Board", () => {
  test("Board.01, Board.04 every Element of the Puzzles has a look and a name", () => {
    expect(Object.keys(LOOKS).sort()).toEqual(Object.keys(VALENCES).sort());
  });

  test("Board.04 each Element's name", () => {
    expect(Object.fromEntries(Object.entries(LOOKS).map(([el, look]) => [el, look.name]))).toEqual({
      H: "Hydrogen", O: "Oxygen", N: "Nitrogen", C: "Carbon",
      S: "Sulfur", F: "Fluorine", Cl: "Chlorine", Br: "Bromine", I: "Iodine",
    });
  });

  test("Board.01 each Element's colour: H white, O red, N blue, C dark grey, S yellow, F light green, Cl green, Br dark red, I violet", () => {
    const color = el => rgb(LOOKS[el].color);
    const red = inHue(345, 15), green = inHue(90, 150);
    expect(hue(color("H"))).toBeNull();
    expect(lightness(color("H"))).toBeGreaterThan(0.85);
    expect(red(color("O"))).toBe(true);
    expect(inHue(200, 240)(color("N"))).toBe(true);
    expect(hue(color("C"))).toBeNull();
    expect(lightness(color("C"))).toBeLessThan(0.4);
    expect(inHue(52, 65)(color("S"))).toBe(true); // away from the orange of the badge
    expect(lightness(color("S"))).toBeGreaterThanOrEqual(0.5);
    expect(green(color("F")) && green(color("Cl"))).toBe(true);
    expect(lightness(color("F"))).toBeGreaterThan(lightness(color("Cl")) + 0.1);
    expect(red(color("Br"))).toBe(true);
    expect(lightness(color("Br"))).toBeLessThan(lightness(color("O")) - 0.1);
    expect(inHue(260, 300)(color("I"))).toBe(true);
  });

  test("Board.01, Board.04 names each Atom with what it needs, and each dotted line", () => {
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

  test("Board.04 names the Board, its Atoms, and its Dotted lines and Bonds", () => {
    const game = createGame(puzzle("formaldehyde"));
    const board = createBoard(svg, game, { onChange() {} });
    click(game, "2,1", "3,1", 2);
    board.render();
    expect(svg.getAttribute("aria-label")).toBe("Board, 3 by 2");
    expect(labels(".atom")).toEqual([
      "Hydrogen 1,1: needs 1 more bond",
      "Carbon 2,1: needs 2 more bonds",
      "Hydrogen 2,2: needs 1 more bond",
      "Oxygen 3,1: complete",
    ]);
    expect(labels(".edge")).toEqual([
      "H 1,1 to C 2,1: no bond",
      "C 2,1 to H 2,2: no bond",
      "C 2,1 to O 3,1: double bond",
    ]);
  });

  test("Input.01, Input.02 clicks, right-clicks and keys on a Bond go to onChange", () => {
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

  test("Board.01, Board.02, Board.04 render shows Bonds, what Atoms still need, and complete Atoms", () => {
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

  const classes = () => ["solved", "pulse"].filter(c => svg.classList.contains(c));

  test("Board.03 solving the Board marks it solved, and its Atoms pulse, also after another render", () => {
    const game = createGame(puzzle("water"));
    const board = createBoard(svg, game, { onChange() {} });
    game.change(0, 1);
    board.render();
    expect(classes()).toEqual([]);
    game.change(1, 1);
    board.render();
    expect(classes()).toEqual(["solved", "pulse"]);
    board.render();
    expect(classes()).toEqual(["solved", "pulse"]);
  });

  test("Board.03 a Board created solved doesn't pulse, also on an svg that just pulsed; after Reset, neither, until it is solved again", () => {
    const first = createGame(puzzle("water"));
    const board = createBoard(svg, first, { onChange() {} });
    build(first);
    board.render();
    expect(classes()).toEqual(["solved", "pulse"]);
    const solved = createGame(puzzle("hydrogen-cyanide"), { bonds: puzzle("hydrogen-cyanide").solution, revealed: false, undo: [] });
    const again = createBoard(svg, solved, { onChange() {} });
    expect(classes()).toEqual(["solved"]);
    again.render();
    expect(classes()).toEqual(["solved"]);
    solved.reset();
    again.render();
    expect(classes()).toEqual([]);
    build(solved);
    again.render();
    expect(classes()).toEqual(["solved", "pulse"]);
  });
});
