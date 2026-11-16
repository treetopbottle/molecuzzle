import { describe, expect, test } from "vitest";
import { createGame, UNDO_LIMIT } from "../../../src/puzzle/game.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { draw, click, build, bondIndex } from "../../helpers/draw.js";

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
    click(game, "2,1", "3,1"); // O–H
    click(game, "2,1", "2,2"); // C–O: O is full
    expect(click(game, "2,1", "3,1", 0)).toBeUndefined();
    click(game, "2,1", "3,1", 1, -1); // remove O–H
    click(game, "3,1", "3,2"); // H–H: both H are full
    expect(click(game, "2,1", "3,1")).toEqual({ changed: false, reason: "full", atom: 4 }); // H 3,1
    expect(draw(game)).toMatchInlineSnapshot(`
      "
        H
        ·
      O─C·H
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

  test(`Bond.08 undo goes back at most ${UNDO_LIMIT} changes`, () => {
    const game = createGame(puzzle("hydrogen-cyanide"));
    for (let n = 0; n < UNDO_LIMIT + 10; n++) click(game, "1,2", "1,3");
    let undone = 0;
    while (game.undo()) undone++;
    expect(undone).toBe(UNDO_LIMIT);
  });

  test("Bond.09 reset removes every Bond, and undo brings them back", () => {
    const game = createGame(puzzle("ammonia"));
    expect(game.reset()).toBe(false);
    click(game, "1,1", "2,1");
    click(game, "2,1", "3,1");
    game.reset();
    expect(game.order.some(Boolean)).toBe(false);
    game.undo();
    expect(draw(game)).toMatchInlineSnapshot(`
      "
      H
      │
      N·H
      │
      H
      "
    `);
  });

  test("Bond.10 a solved Board can't be changed until undo or reset", () => {
    const game = createGame(puzzle("water"));
    build(game);
    expect(click(game, "1,1", "1,2")).toEqual({ changed: false });
    game.undo();
    expect(click(game, "1,1", "1,2")).toEqual({ changed: true });
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
