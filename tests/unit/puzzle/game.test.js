import { describe, expect, test } from "vitest";
import { createGame } from "../../../src/puzzle/game.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { draw, click, build, bondIndex } from "../../helpers/draw.js";
import { schemaErrors } from "../../helpers/schemas.js";

const puzzle = id => PUZZLES.find(p => p.id === id);

describe("Puzzle", () => {
  test("Puzzle.02 a Puzzle starts with no Bonds", () => {
    expect(draw(createGame(puzzle("formaldehyde")))).toMatchInlineSnapshot(`
      "
      H
      ·
      C·H
      ·
      O
      "
    `);
    expect(PUZZLES.filter(p => createGame(p).order.some(Boolean))).toEqual([]);
  });

  test("Puzzle.03 a Puzzle starts where it was left, and Undo goes back through its history", () => {
    const game = createGame(puzzle("hydrogen-cyanide"), { bonds: [[0, 1, 1]], revealed: false, undo: [[]] });
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H─C·N
      "
    `);
    expect(game.undo()).toBe(true);
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·C·N
      "
    `);
    expect(game.undo()).toBe(false);
  });

  test("Puzzle.03, Bond.10 it starts with the solution shown, if it was, and Undo still works", () => {
    const urea = puzzle("urea");
    const game = createGame(urea, { bonds: urea.solution, revealed: true, undo: [[]] });
    expect(game.status()).toEqual({ kind: "revealed" });
    expect(game.undo()).toBe(true);
    expect(game.board()).toEqual([]);
  });

  test("Help.01 with no Bonds, the solution doesn't count as shown, also after Undo", () => {
    const game = createGame(puzzle("water"), { bonds: [], revealed: true, undo: [[[0, 1, 1]]] });
    game.undo();
    click(game, "1,2", "2,2");
    expect(game.status()).toEqual({ kind: "solved" });
  });

  test("Bond.08, Bond.10 a solved Board starts with nothing to undo", () => {
    const water = puzzle("water");
    const game = createGame(water, { bonds: water.solution, revealed: false, undo: [[]] });
    expect(game.status()).toEqual({ kind: "solved" });
    expect(game.canUndo).toBe(false);
  });

  test.each([
    ["a Bond that isn't on a Dotted line", "hydrogen-cyanide", [[0, 2, 1]], [[]]],
    ["a pair of Atoms bonded twice", "hydrogen-cyanide", [[0, 1, 1], [0, 1, 1]], [[]]],
    ["Bonds that cross", "glycine", [[0, 7, 1], [4, 5, 1]], [[]]],
    ["an Atom with more Bonds than its valence", "water", [[0, 1, 2]], [[]]],
    ["such a Board in the undo history", "hydrogen-cyanide", [[0, 1, 1]], [[], [[0, 2, 1]]]],
  ])("Puzzle.03 with %s, it starts with no Bonds, nothing to undo and the solution not shown", (_, id, bonds, undo) => {
    const p = puzzle(id);
    const game = createGame(p, { bonds, revealed: true, undo });
    expect(game.order.some(Boolean)).toBe(false);
    expect(game.canUndo).toBe(false);
    build(game);
    expect(game.status()).toEqual({ kind: "solved" });
  });
});

describe("Bond", () => {
  test("Bond.01, Bond.02 clicking a dotted line bonds, again makes it stronger", () => {
    const game = createGame(puzzle("hydrogen-cyanide"));
    click(game, "1,2", "1,3");
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·C─N
      "
    `);
    click(game, "1,2", "1,3", 2);
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·C≡N
      "
    `);
  });

  test("Bond.03 clicking a triple Bond removes it", () => {
    const game = createGame(puzzle("hydrogen-cyanide"));
    expect(click(game, "1,2", "1,3", 4)).toEqual({ changed: true });
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·C·N
      "
    `);
  });

  test("Bond.03 clicking a Bond that an Atom has no room to strengthen removes it", () => {
    const game = createGame(puzzle("water"));
    click(game, "1,1", "1,2", 2);
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·O
        ·
        H
      "
    `);
  });

  test("Bond.04 an Atom with all its bonds takes no new Bond, with the reason full and that Atom", () => {
    const game = createGame(puzzle("methanol"));
    click(game, "3,1", "3,2"); // H–H: both H are full
    expect(click(game, "2,1", "3,1")).toEqual({ changed: false, reason: "full", atom: 4 }); // H 3,1
    expect(draw(game)).toMatchInlineSnapshot(`
      "
        H
        ·
      O·C·H
      · ·
      H─H
      "
    `);
  });

  test("Bond.05 a dotted line that crosses a Bond can't be bonded, with the reason crossing", () => {
    const game = createGame(puzzle("glycine"));
    click(game, "2,1", "2,3"); // H–C across the middle
    expect(click(game, "1,2", "4,2")).toEqual({ changed: false, reason: "crossing" });
    expect(draw(game)).toMatchInlineSnapshot(`
      "
        O·C·O·H
        · · · ·
      H───C···H
        · · ·
        · · ·
        · · ·
        H·N·H
      "
    `);
  });

  test("Bond.06 lowering makes a Bond one weaker, and does nothing to a dotted line", () => {
    const game = createGame(puzzle("hydrogen-cyanide"));
    click(game, "1,2", "1,3", 3);
    click(game, "1,2", "1,3", 1, -1);
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·C═N
      "
    `);
    click(game, "1,2", "1,3", 1, -1);
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·C─N
      "
    `);
    expect(click(game, "1,1", "1,2", 1, -1)).toEqual({ changed: false });
  });

  test("Bond.08 undo restores the Bonds before the last change", () => {
    const game = createGame(puzzle("ammonia"));
    expect(game.canUndo).toBe(false);
    click(game, "1,1", "2,1");
    click(game, "2,1", "2,2");
    game.undo();
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H
      │
      N·H
      ·
      H
      "
    `);
    game.undo();
    expect(game.canUndo).toBe(false);
    expect(game.undo()).toBe(false);
  });

  test("Bond.08 undo goes back 100 changes, to the Board after the first, and then does nothing", () => {
    const game = createGame(puzzle("hydrogen-cyanide"));
    click(game, "1,2", "1,3", 101);
    let undone = 0;
    while (game.undo()) undone++;
    expect(undone).toBe(100);
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H·C─N
      "
    `);
  });

  test("Bond.08, Bond.09 reset removes every Bond and the undo history", () => {
    const game = createGame(puzzle("ammonia"));
    expect(game.reset()).toBe(false);
    click(game, "1,1", "2,1");
    click(game, "2,1", "3,1");
    game.undo();
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H
      │
      N·H
      ·
      H
      "
    `);
    expect(game.reset()).toBe(true);
    expect(game.order.some(Boolean)).toBe(false);
    expect(game.canUndo).toBe(false);
    expect(game.undo()).toBe(false);
  });

  test("Bond.09 reset works with no Bonds but something to undo", () => {
    const game = createGame(puzzle("ammonia"));
    click(game, "1,1", "2,1");
    click(game, "1,1", "2,1", 1, -1);
    expect(game.canUndo).toBe(true);
    expect(game.reset()).toBe(true);
    expect(game.canUndo).toBe(false);
    expect(game.reset()).toBe(false);
  });

  test("Bond.10 solving removes the undo history; a solved Board can't be changed, but Reset works", () => {
    const game = createGame(puzzle("water"));
    click(game, "1,1", "1,2");
    click(game, "1,2", "2,2");
    expect(game.status()).toEqual({ kind: "solved" });
    expect(game.canUndo).toBe(false);
    expect(game.undo()).toBe(false);
    expect(click(game, "1,1", "1,2")).toEqual({ changed: false });
    expect(game.reset()).toBe(true);
    expect(game.status()).toEqual({ kind: "empty" });
  });

  test("Bond.10 while the solution is shown, changes don't change Bonds, and Undo and Reset work", () => {
    const game = createGame(puzzle("water"));
    click(game, "1,1", "1,2");
    game.showSolution();
    expect(click(game, "1,1", "1,2", 1, -1)).toEqual({ changed: false });
    expect(game.undo()).toBe(true);
    expect(game.board()).toEqual([[0, 1, 1]]);
    game.showSolution();
    expect(game.reset()).toBe(true);
    expect(game.status()).toEqual({ kind: "empty" });
  });

  test("Bond.11 the Bonds are a Board", () => {
    const game = createGame(puzzle("water"));
    expect(game.board()).toEqual([]);
    click(game, "1,1", "1,2");
    expect(game.board()).toEqual([[0, 1, 1]]);
    expect(schemaErrors("board.schema.json", game.board())).toEqual([]);
  });

  test.each(PUZZLES)("Bond.11 after Show solution, the Board of $name is its solution", p => {
    const game = createGame(p);
    game.showSolution();
    const board = game.board();
    expect(schemaErrors("board.schema.json", board)).toEqual([]);
    expect(board.every(([a, b]) => a < b)).toBe(true);
    expect(board.every(([a, b], i) => i === 0 || a > board[i - 1][0] || (a === board[i - 1][0] && b > board[i - 1][1]))).toBe(true);
    expect(board).toEqual(p.solution);
  });
});

describe("Valence", () => {
  test("Valence.01 each Atom needs its valence minus its bond count", () => {
    const game = createGame(puzzle("formaldehyde"));
    const needs = () => game.atoms.map((a, i) => `${a.el}${game.remaining(i)}`).join(" ");
    expect(needs()).toBe("H1 C4 H1 O2");
    click(game, "2,1", "3,1", 2);
    expect(needs()).toBe("H1 C2 H1 O0");
  });

  test("Valence.02 an Atom that needs no more Bonds is complete", () => {
    const game = createGame(puzzle("formaldehyde"));
    const complete = () => game.atoms.filter((_, i) => game.remaining(i) === 0).map(a => `${a.el} ${a.r + 1},${a.c + 1}`);
    expect(complete()).toEqual([]);
    click(game, "2,1", "3,1", 2);
    expect(complete()).toEqual(["O 3,1"]);
    expect(game.status()).toEqual({ kind: "open", open: 3 });
  });
});

describe("Check", () => {
  test("Check.01 no Bonds", () => {
    expect(createGame(puzzle("ammonia")).status()).toEqual({ kind: "empty" });
  });

  test("Check.02 Atoms that still need Bonds", () => {
    const game = createGame(puzzle("ammonia"));
    click(game, "1,1", "2,1");
    expect(game.status()).toEqual({ kind: "open", open: 3 });
  });

  test("Check.03 every Atom complete, but in more than one piece", () => {
    const game = createGame(puzzle("methanol"));
    click(game, "3,1", "3,2"); // H–H
    click(game, "2,1", "2,2", 2); // O=C
    click(game, "1,2", "2,2"); // C–H
    click(game, "2,2", "2,3"); // C–H
    expect(draw(game)).toMatchInlineSnapshot(`
      "
        H
        │
      O═C─H
      · ·
      H─H
      "
    `);
    expect(game.status()).toEqual({ kind: "pieces" });
  });

  test("Check.04 the target is built", () => {
    const game = createGame(puzzle("glycine"));
    build(game);
    expect(game.status()).toEqual({ kind: "solved" });
  });
});

describe("Saved", () => {
  test("Puzzle.03 saved() is the Board, whether the solution was shown, and the undo history", () => {
    const game = createGame(puzzle("hydrogen-cyanide"));
    expect(game.saved()).toBeNull();
    click(game, "1,1", "1,2");
    click(game, "1,2", "1,3");
    expect(game.saved()).toEqual({ bonds: [[0, 1, 1], [1, 2, 1]], revealed: false, undo: [[], [[0, 1, 1]]] });
    const again = createGame(puzzle("hydrogen-cyanide"), game.saved());
    expect(again.saved()).toEqual(game.saved());
  });

  test("Bond.09 saved() is null after Reset", () => {
    const game = createGame(puzzle("water"));
    click(game, "1,1", "1,2");
    game.reset();
    expect(game.saved()).toBeNull();
  });

  test("Puzzle.03, Bond.10 saved() after solving is the solution, with nothing to undo, and starts solved", () => {
    const game = createGame(puzzle("water"));
    build(game);
    expect(game.saved()).toEqual({ bonds: [[0, 1, 1], [1, 2, 1]], revealed: false, undo: [] });
    const again = createGame(puzzle("water"), game.saved());
    expect(again.status()).toEqual({ kind: "solved" });
    expect(again.canUndo).toBe(false);
    expect(again.saved()).toEqual(game.saved());
  });

  test("Help.01 saved() keeps that the solution was shown, also after Undo", () => {
    const game = createGame(puzzle("urea"));
    click(game, "1,1", "1,2");
    game.showSolution();
    expect(game.saved()).toMatchObject({ bonds: puzzle("urea").solution, revealed: true });
    game.undo();
    expect(game.saved()).toEqual({ bonds: [[0, 1, 1]], revealed: true, undo: [[]] });
  });
});

describe("Help", () => {
  test("Help.01 show solution bonds the solution, marked as revealed", () => {
    const game = createGame(puzzle("urea"));
    click(game, "1,1", "1,2");
    game.showSolution();
    expect(game.status()).toEqual({ kind: "revealed" });
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H─N─H
      · │ ·
      · C═══O
      · │ ·
      H─N─H
      "
    `);
    game.undo();
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H─N·H
      · · ·
      · C···O
      · · ·
      H·N·H
      "
    `);
    expect(game.status()).toEqual({ kind: "open", open: 7 });
  });

  test("Help.02 once the Board has no Bonds again, building it counts as solved", () => {
    const game = createGame(puzzle("water"));
    click(game, "1,1", "1,2");
    game.showSolution();
    game.undo(); // back to one Bond: still revealed
    click(game, "1,2", "2,2");
    expect(game.status().kind).toBe("revealed");
    game.reset();
    build(game);
    expect(game.status().kind).toBe("solved");
  });

  test("Help.01 showing the solution of a Board already solved keeps it solved", () => {
    const game = createGame(puzzle("water"));
    build(game);
    game.showSolution();
    expect(game.status().kind).toBe("solved");
  });
});
