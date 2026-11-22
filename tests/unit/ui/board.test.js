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

const aceticAcid = puzzle("acetic-acid");
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

  test("Board.01 each Element's colour: O red, N blue, C dark grey, S yellow, F light green, Cl green, Br dark red, I violet", () => {
    const color = el => rgb(LOOKS[el].color);
    const red = inHue(345, 15), green = inHue(90, 150);
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

  test("Board.01, Board.04 names the Board, each Atom with its hydrogens and no word on what it needs, and each dotted line", () => {
    createBoard(svg, createGame(aceticAcid), { onChange() {} });
    expect(svg.getAttribute("aria-label")).toBe("Board, 3 by 2");
    expect(labels(".atom")).toEqual([
      "Oxygen 1,2",
      "Carbon 2,1, with 3 hydrogens",
      "Carbon 2,2",
      "Oxygen 3,2, with 1 hydrogen",
    ]);
    expect(labels(".edge")).toEqual([
      "O 1,2 to C 2,2: no bond",
      "C 2,1 to C 2,2: no bond",
      "C 2,2 to O 3,2: no bond",
    ]);
    expect(svg.querySelectorAll(".edge .maybe")).toHaveLength(3);
  });

  /** Where each of the Board's hydrogens is: its Atom's place, and its centre in the svg. */
  const hydrogens = () => [...svg.querySelectorAll(".hydrogen")].map(h => {
    const at = g => g.getAttribute("transform").match(/translate\(([-\d.]+),([-\d.]+)\)/).slice(1).map(Number);
    const atom = h.closest(".atom"), [ax, ay] = at(atom), [dx, dy] = at(h);
    return { h, atom, x: ax + dx, y: ay + dy, dx, dy };
  });

  test("Board.01 an Atom's hydrogens are small white balls with an H, on thin lines on the diagonals below it and then above it on the left", () => {
    createBoard(svg, createGame(aceticAcid), { onChange() {} });
    const all = hydrogens();
    expect(all.map(({ atom }) => atom.getAttribute("aria-label").split(":")[0])).toEqual([
      "Carbon 2,1, with 3 hydrogens", "Carbon 2,1, with 3 hydrogens", "Carbon 2,1, with 3 hydrogens",
      "Oxygen 3,2, with 1 hydrogen",
    ]);
    expect(all.map(({ dx, dy }) => [Math.sign(dx), Math.sign(dy)])).toEqual([[-1, 1], [1, 1], [-1, -1], [-1, 1]]);
    for (const { h, atom } of all) {
      const ball = h.querySelector("circle");
      expect(Number(ball.getAttribute("r"))).toBe(8.5);
      expect(Number(ball.getAttribute("r"))).toBeLessThan(LOOKS.C.r / 2);
      expect(hue(rgb(ball.getAttribute("fill")))).toBeNull();
      expect(lightness(rgb(ball.getAttribute("fill")))).toBeGreaterThan(0.85);
      expect(h.querySelector("text").textContent).toBe("H");
      expect(ball.classList.contains("body")).toBe(false); // it doesn't pulse with its Atom
      expect(atom.querySelectorAll(".fixed")).toHaveLength(atom.querySelectorAll(".hydrogen").length);
    }
    expect(svg.querySelectorAll(".atom .fixed")).toHaveLength(4);
  });

  test("Board.01 on every Puzzle, the hydrogens can't be clicked: they aren't focusable, and are outside every Dotted line's hit area", () => {
    let checked = 0;
    for (const p of PUZZLES) {
      createBoard(svg, createGame(p), { onChange() {} });
      const hits = [...svg.querySelectorAll(".hit")].map(r => ["x", "y", "width", "height"].map(k => Number(r.getAttribute(k))));
      for (const { h, x, y } of hydrogens()) {
        checked++;
        expect(h.closest("[tabindex], [role=button], .edge")).toBeNull();
        const r = Number(h.querySelector("circle").getAttribute("r"));
        for (const [hx, hy, w, ht] of hits)
          expect(x + r <= hx || x - r >= hx + w || y + r <= hy || y - r >= hy + ht).toBe(true);
      }
    }
    expect(checked).toBe(PUZZLES.reduce((n, p) => n + p.atoms.reduce((m, a) => m + a[3], 0), 0));
  });

  test("Board.04 Acetic acid with C═O: its Atoms with their hydrogens, and its Dotted lines and Bonds", () => {
    const game = createGame(aceticAcid);
    const board = createBoard(svg, game, { onChange() {} });
    click(game, "1,2", "2,2", 2);
    board.render();
    expect(labels(".atom")).toEqual([
      "Oxygen 1,2",
      "Carbon 2,1, with 3 hydrogens",
      "Carbon 2,2",
      "Oxygen 3,2, with 1 hydrogen",
    ]);
    expect(labels(".edge")).toEqual([
      "O 1,2 to C 2,2: double bond",
      "C 2,1 to C 2,2: no bond",
      "C 2,2 to O 3,2: no bond",
    ]);
  });

  test("Input.01, Input.02 clicks, right-clicks and keys on a Bond go to onChange", () => {
    const onChange = vi.fn();
    createBoard(svg, createGame(puzzle("acetonitrile")), { onChange });
    const bond = edge("C 1,1 to C 2,1");
    bond.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    bond.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    for (const key of ["Enter", " ", "Backspace", "Delete", "-", "a"])
      bond.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    expect(onChange.mock.calls).toEqual([[0, 1], [0, -1], [0, 1], [0, 1], [0, -1], [0, -1], [0, -1]]);
    expect(bond.getAttribute("tabindex")).toBe("0");
    expect(bond.getAttribute("role")).toBe("button");
  });

  test("Board.01, Board.02, Board.04 render shows Bonds, and no badge or glow on an Atom, complete or not", () => {
    const game = createGame(aceticAcid);
    const board = createBoard(svg, game, { onChange() {} });
    game.change(0, 1);
    game.change(0, 1);
    board.render();
    expect(edge("O 1,2 to C 2,2").getAttribute("aria-label")).toBe("O 1,2 to C 2,2: double bond");
    expect(edge("O 1,2 to C 2,2").querySelectorAll(".vis")).toHaveLength(2);
    expect(labels(".atom")[0]).toBe("Oxygen 1,2"); // complete, and not said
    expect(svg.querySelectorAll(".atom.ok")).toHaveLength(0);
    expect(svg.querySelectorAll(".atom .badge")).toHaveLength(0);
    expect(svg.querySelectorAll(".atom .body")).toHaveLength(4); // the pulse of Board.03 stays
  });

  const classes = () => ["solved", "pulse"].filter(c => svg.classList.contains(c));

  test("Board.03 solving the Board marks it solved, and its Atoms pulse, also after another render", () => {
    const game = createGame(puzzle("acetonitrile"));
    const board = createBoard(svg, game, { onChange() {} });
    game.change(0, 1);
    board.render();
    expect(classes()).toEqual([]);
    for (let n = 0; n < 3; n++) game.change(1, 1);
    board.render();
    expect(classes()).toEqual(["solved", "pulse"]);
    board.render();
    expect(classes()).toEqual(["solved", "pulse"]);
  });

  test("Board.03 a Board created solved doesn't pulse, also on an svg that just pulsed; after Reset, neither, until it is solved again", () => {
    const first = createGame(puzzle("acetonitrile"));
    const board = createBoard(svg, first, { onChange() {} });
    build(first);
    board.render();
    expect(classes()).toEqual(["solved", "pulse"]);
    const solved = createGame(aceticAcid, { bonds: aceticAcid.solution, revealed: false, undo: [] });
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
