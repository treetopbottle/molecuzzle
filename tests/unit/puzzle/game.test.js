import { describe, expect, test } from "vitest";
import { createGame } from "../../../src/puzzle/game.js";
import { ELEMENTS } from "../../../src/puzzle/elements.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";
import { draw, click, build } from "../../helpers/draw.js";
import { schemaErrors } from "../../helpers/schemas.js";

const puzzle = id => PUZZLES.find(p => p.id === id);

// The Grid of the Grid.02 example, which isn't a Puzzle's: O at 1,2 and 3,2,
// and CH₂ at 2,1 and 2,3. Its two Dotted lines cross, so it has no solution.
const crossing = {
  id: "crossing", name: "Crossing", formula: "C2H4O2", fact: "Not a Puzzle.",
  rows: 3, cols: 3,
  atoms: [["O",0,1,0],["C",1,0,2],["C",1,2,2],["O",2,1,0]],
  solution: [],
};

describe("Puzzle", () => {
  test("Puzzle.01, Puzzle.02 Acetic acid starts with no Bonds, and its one solution is C═O, CH₃─C and C─OH", () => {
    const game = createGame(puzzle("acetic-acid"));
    expect(draw(game)).toBe(`
    O
    ·
CH₃·C
    ·
    OH
`);
    game.showSolution();
    expect(draw(game)).toBe(`
    O
    ║
CH₃─C
    │
    OH
`);
  });

  test("Puzzle.02 every Puzzle starts with no Bonds", () => {
    expect(PUZZLES.filter(p => createGame(p).order.some(Boolean))).toEqual([]);
  });

  test("Puzzle.03 Acetonitrile starts where it was left, and Undo goes back through its history", () => {
    const game = createGame(puzzle("acetonitrile"), { bonds: [[0, 1, 1]], revealed: false, undo: [[]] });
    expect(draw(game)).toBe(`
CH₃
│
C
·
N
`);
    expect(game.undo()).toBe(true);
    expect(game.board()).toEqual([]);
    expect(game.undo()).toBe(false);
  });

  test("Puzzle.03, Bond.10 it starts with the solution shown, if it was, and Undo still works", () => {
    const serine = puzzle("serine");
    const game = createGame(serine, { bonds: serine.solution, revealed: true, undo: [[]] });
    expect(game.status()).toEqual({ kind: "revealed" });
    expect(game.undo()).toBe(true);
    expect(game.board()).toEqual([]);
  });

  test("Help.01 with no Bonds, the solution doesn't count as shown, also after Undo", () => {
    const game = createGame(puzzle("acetic-acid"), { bonds: [], revealed: true, undo: [[[1, 2, 1]]] });
    game.undo();
    click(game, "1,2", "2,2", 2);
    click(game, "2,2", "3,2");
    expect(game.status()).toEqual({ kind: "solved" });
  });

  test("Bond.08, Bond.10 a solved Board starts with nothing to undo", () => {
    const acetonitrile = puzzle("acetonitrile");
    const game = createGame(acetonitrile, { bonds: acetonitrile.solution, revealed: false, undo: [[]] });
    expect(game.status()).toEqual({ kind: "solved" });
    expect(game.canUndo).toBe(false);
  });

  test.each([
    ["a Bond that isn't on a Dotted line, Acetonitrile's [[0, 2, 1]]", "acetonitrile", [[0, 2, 1]], [[]]],
    ["a pair of Atoms bonded twice", "acetonitrile", [[0, 1, 1], [0, 1, 1]], [[]]],
    ["such a Board in the undo history", "acetonitrile", [[0, 1, 1]], [[], [[0, 2, 1]]]],
  ])("Puzzle.03 with %s, it starts with no Bonds, nothing to undo and the solution not shown", (_, id, bonds, undo) => {
    const game = createGame(puzzle(id), { bonds, revealed: true, undo });
    expect(game.order.some(Boolean)).toBe(false);
    expect(game.canUndo).toBe(false);
    build(game);
    expect(game.status()).toEqual({ kind: "solved" });
  });

  test("Puzzle.03 with Bonds that cross, on the Grid of the Grid.02 example, it starts with no Bonds and nothing to undo", () => {
    const game = createGame(crossing, { bonds: [[0, 3, 1], [1, 2, 1]], revealed: true, undo: [[]] });
    expect(game.saved()).toBeNull();
    expect(game.status()).toEqual({ kind: "empty" });
  });
});

describe("Hydrogens", () => {
  test("Puzzle.07 Acetic acid's Atoms are an O with no hydrogens, a C with 3, a C with none and an O with 1, and no change touches them", () => {
    const game = createGame(puzzle("acetic-acid"));
    expect(game.atoms.map(a => `${a.el}${a.h}`).join(" ")).toBe("O0 C3 C0 O1");
    const needs = () => game.atoms.map((_, i) => game.remaining(i));
    expect(needs()).toEqual([2, 1, 4, 1]);
    click(game, "1,2", "2,2", 2);
    click(game, "2,1", "2,2");
    while (game.undo());
    expect(needs()).toEqual([2, 1, 4, 1]);
    game.showSolution();
    expect(needs()).toEqual([0, 0, 0, 0]);
    game.reset();
    expect(needs()).toEqual([2, 1, 4, 1]);
  });

  test("Puzzle.03 a Board with an Atom that has too many Bonds, CH₃═C, starts where it was left", () => {
    const game = createGame(puzzle("acetic-acid"), { bonds: [[1, 2, 2]], revealed: false, undo: [[]] });
    expect(game.board()).toEqual([[1, 2, 2]]);
    expect(game.canUndo).toBe(true);
    expect(game.counts()).toEqual({ used: 2, budget: 4, few: 3, many: 1 });
  });

  test("Puzzle.03 a Board whose Atoms have room for their Bonds next to their hydrogens starts where it was left", () => {
    const game = createGame(puzzle("acetic-acid"), { bonds: [[1, 2, 1]], revealed: false, undo: [[]] }); // CH₃─C
    expect(game.board()).toEqual([[1, 2, 1]]);
    expect(game.canUndo).toBe(true);
  });
});

describe("Bond", () => {
  test("Bond.01, Bond.02, Bond.03 C 2,1 to N 3,1 in Acetonitrile, made stronger 1 to 4 times, is a single, a double, a triple and no Bond", () => {
    const game = createGame(puzzle("acetonitrile"));
    const drawn = [];
    for (let n = 0; n < 4; n++) {
      expect(click(game, "2,1", "3,1")).toEqual({ changed: true });
      drawn.push(draw(game).split("\n")[4]);
    }
    expect(drawn).toEqual(["│", "║", "⦀", "·"]);
  });

  test("Bond.03 stronger on a Bond whose Atoms have no room goes on to a double and a triple Bond, and only then removes it: CH₃─C in Acetic acid", () => {
    const game = createGame(puzzle("acetic-acid"));
    const orders = [];
    for (let n = 0; n < 4; n++) { click(game, "2,1", "2,2"); orders.push(game.order.reduce((t, o) => t + o, 0)); }
    expect(orders).toEqual([1, 2, 3, 0]);
  });

  test("Bond.04 Glycine, with OH 1,1 to C 2,1: stronger on OH 1,1 to NH₂ 1,2 makes a Bond, and OH needs −1; three more make it double, triple and none", () => {
    const game = createGame(puzzle("glycine"));
    click(game, "1,1", "2,1");
    expect(click(game, "1,1", "1,2")).toEqual({ changed: true });
    expect(game.remaining(0)).toBe(-1);
    expect(draw(game)).toBe(`
OH──NH₂
│   ·
C···CH₂
·
O
`);
    const orders = [];
    for (let n = 0; n < 3; n++) { click(game, "1,1", "1,2"); orders.push(game.order[game.bonds.findIndex(e => e.a === 0 && e.b === 1)]); }
    expect(orders).toEqual([2, 3, 0]);
  });

  test("Bond.05 on the Grid of the Grid.02 example, with CH₂ 2,1 to CH₂ 2,3: stronger on O 1,2 to O 3,2 makes no Bond, with the reason crossing", () => {
    const game = createGame(crossing);
    click(game, "2,1", "2,3");
    expect(click(game, "1,2", "3,2")).toEqual({ changed: false, reason: "crossing" });
    expect(draw(game)).toBe(`
    O
    ·
CH₂─────CH₂
    ·
    O
`);
  });

  test("Bond.06 Acetonitrile, with a triple Bond C 2,1 to N 3,1, made weaker twice is a double, then a single Bond; on a Dotted line it does nothing", () => {
    const game = createGame(puzzle("acetonitrile"));
    click(game, "2,1", "3,1", 3);
    click(game, "2,1", "3,1", 1, -1);
    expect(game.board()).toEqual([[1, 2, 2]]);
    click(game, "2,1", "3,1", 1, -1);
    expect(game.board()).toEqual([[1, 2, 1]]);
    expect(click(game, "1,1", "2,1", 1, -1)).toEqual({ changed: false });
  });

  test("Bond.08 Acetonitrile, C 2,1 to N 3,1 made stronger 101 times: Undo goes back 100 times, to a single Bond, and then does nothing", () => {
    const game = createGame(puzzle("acetonitrile"));
    expect(game.canUndo).toBe(false);
    click(game, "2,1", "3,1", 101);
    let undone = 0;
    while (game.undo()) undone++;
    expect(undone).toBe(100);
    expect(game.board()).toEqual([[1, 2, 1]]);
    expect(game.undo()).toBe(false);
  });

  test("Bond.08, Bond.09 Acetic acid, with CH₃ 2,1 to C 2,2 and then C 2,2 to OH 3,2: Undo leaves only the first, Reset removes it and the undo history", () => {
    const game = createGame(puzzle("acetic-acid"));
    expect(game.reset()).toBe(false);
    click(game, "2,1", "2,2");
    click(game, "2,2", "3,2");
    game.undo();
    expect(draw(game)).toBe(`
    O
    ·
CH₃─C
    ·
    OH
`);
    expect(game.reset()).toBe(true);
    expect(game.order.some(Boolean)).toBe(false);
    expect(game.canUndo).toBe(false);
    expect(game.undo()).toBe(false);
  });

  test("Bond.09 reset works with no Bonds but something to undo", () => {
    const game = createGame(puzzle("acetic-acid"));
    click(game, "2,1", "2,2");
    click(game, "2,1", "2,2", 1, -1);
    expect(game.canUndo).toBe(true);
    expect(game.reset()).toBe(true);
    expect(game.canUndo).toBe(false);
    expect(game.reset()).toBe(false);
  });

  test("Bond.10 Acetonitrile, with CH₃ 1,1 to C 2,1: C 2,1 to N 3,1 made stronger three times solves it, with nothing to undo; it can't be changed, but Reset works", () => {
    const game = createGame(puzzle("acetonitrile"));
    click(game, "1,1", "2,1");
    click(game, "2,1", "3,1", 3);
    expect(game.status()).toEqual({ kind: "solved" });
    expect(game.canUndo).toBe(false);
    expect(game.undo()).toBe(false);
    expect(click(game, "1,1", "2,1")).toEqual({ changed: false });
    expect(game.reset()).toBe(true);
    expect(game.status()).toEqual({ kind: "empty" });
  });

  test("Bond.10 while the solution is shown, changes don't change Bonds, and Undo and Reset work", () => {
    const game = createGame(puzzle("acetonitrile"));
    click(game, "1,1", "2,1");
    game.showSolution();
    expect(click(game, "1,1", "2,1", 1, -1)).toEqual({ changed: false });
    expect(game.undo()).toBe(true);
    expect(game.board()).toEqual([[0, 1, 1]]);
    game.showSolution();
    expect(game.reset()).toBe(true);
    expect(game.status()).toEqual({ kind: "empty" });
  });

  test("Bond.11 Acetonitrile, with CH₃ 1,1 to C 2,1, has the Board [[0, 1, 1]]", () => {
    const game = createGame(puzzle("acetonitrile"));
    expect(game.board()).toEqual([]);
    click(game, "1,1", "2,1");
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
  test("Valence.03 Acetic acid, budget 4: no Bonds are 4 Atoms with too few; O≡C and C─OH are 1 too few, 1 too many and 4 used; more Bonds are over the budget", () => {
    const game = createGame(puzzle("acetic-acid"));
    expect(game.counts()).toEqual({ used: 0, budget: 4, few: 4, many: 0 });
    click(game, "1,2", "2,2", 3);
    click(game, "2,2", "3,2");
    expect(game.atoms.map((_, i) => game.remaining(i))).toEqual([-1, 1, 0, 0]);
    expect(game.counts()).toEqual({ used: 4, budget: 4, few: 1, many: 1 });
    click(game, "2,2", "3,2");
    click(game, "2,1", "2,2");
    expect(game.counts()).toEqual({ used: 6, budget: 4, few: 0, many: 3 });
  });

  test("Valence.01 each Element needs the Bonds of the table of valences", () => {
    const valences = Object.fromEntries(Object.entries(ELEMENTS).map(([el, e]) => [el, e.valence]));
    expect(valences).toEqual({ H: 1, F: 1, Cl: 1, Br: 1, I: 1, O: 2, S: 2, N: 3, C: 4 });
  });

  test("Valence.01, Valence.02 Acetic acid: O, CH₃, C and OH need 2, 1, 4 and 1; after C═O, C needs 2 and O is complete", () => {
    const game = createGame(puzzle("acetic-acid"));
    const label = a => a.el + (a.h ? "H" + (a.h > 1 ? a.h : "") : "");
    const needs = () => game.atoms.map((a, i) => `${label(a)} ${game.remaining(i)}`).join(", ");
    const complete = () => game.atoms.filter((_, i) => game.remaining(i) === 0).map(a => `${label(a)} ${a.r + 1},${a.c + 1}`);
    expect(needs()).toBe("O 2, CH3 1, C 4, OH 1");
    expect(complete()).toEqual([]);
    click(game, "1,2", "2,2", 2); // C═O
    expect(needs()).toBe("O 0, CH3 1, C 2, OH 1");
    expect(complete()).toEqual(["O 1,2"]);
  });
});

describe("Check", () => {
  test("Check.04 at the budget, Acetic acid isn't solved while an Atom has too many Bonds: O≡C and C─OH", () => {
    const game = createGame(puzzle("acetic-acid"));
    click(game, "1,2", "2,2", 3);
    click(game, "2,2", "3,2");
    expect(game.counts()).toEqual({ used: 4, budget: 4, few: 1, many: 1 });
    expect(game.status()).toEqual({ kind: "open", few: 1, many: 1 });
  });

  test("Check.01, Check.02 Acetic acid: empty with no Bonds; open, with 3 Atoms, after CH₃ 2,1 to C 2,2", () => {
    const game = createGame(puzzle("acetic-acid"));
    expect(game.status()).toEqual({ kind: "empty" });
    click(game, "2,1", "2,2");
    expect(game.status()).toEqual({ kind: "open", few: 3, many: 0 });
  });

  test("Check.03 Glycerol, with OH─OH built apart from the rest: pieces", () => {
    const game = createGame(puzzle("glycerol"));
    click(game, "1,1", "1,2");
    click(game, "1,2", "2,2");
    click(game, "2,1", "2,2", 2);
    click(game, "3,1", "3,2");
    expect(draw(game)).toBe(`
OH──CH₂
·   │
CH₂═CH
·   ·
OH──OH
`);
    expect(game.status()).toEqual({ kind: "pieces" });
  });

  test("Check.04 Glycine, built, is solved", () => {
    const game = createGame(puzzle("glycine"));
    build(game);
    expect(game.status()).toEqual({ kind: "solved" });
  });
});

describe("Saved", () => {
  test("Puzzle.03 saved() is the Board, whether the solution was shown, and the undo history", () => {
    const game = createGame(puzzle("acetonitrile"));
    expect(game.saved()).toBeNull();
    click(game, "1,1", "2,1");
    click(game, "2,1", "3,1");
    expect(game.saved()).toEqual({ bonds: [[0, 1, 1], [1, 2, 1]], revealed: false, undo: [[], [[0, 1, 1]]] });
    const again = createGame(puzzle("acetonitrile"), game.saved());
    expect(again.saved()).toEqual(game.saved());
  });

  test("Bond.09 saved() is null after Reset", () => {
    const game = createGame(puzzle("acetonitrile"));
    click(game, "1,1", "2,1");
    game.reset();
    expect(game.saved()).toBeNull();
  });

  test("Puzzle.03, Bond.10 saved() after solving is the solution, with nothing to undo, and starts solved", () => {
    const game = createGame(puzzle("acetonitrile"));
    build(game);
    expect(game.saved()).toEqual({ bonds: [[0, 1, 1], [1, 2, 3]], revealed: false, undo: [] });
    const again = createGame(puzzle("acetonitrile"), game.saved());
    expect(again.status()).toEqual({ kind: "solved" });
    expect(again.canUndo).toBe(false);
    expect(again.saved()).toEqual(game.saved());
  });

  test("Help.01 saved() keeps that the solution was shown, also after Undo", () => {
    const game = createGame(puzzle("serine"));
    click(game, "1,1", "2,1");
    game.showSolution();
    expect(game.saved()).toMatchObject({ bonds: puzzle("serine").solution, revealed: true });
    game.undo();
    expect(game.saved()).toEqual({ bonds: [[0, 2, 1]], revealed: true, undo: [[]] });
  });
});

describe("Help", () => {
  test("Help.01, Help.02 Serine: with the solution shown the status is revealed; reset and built, it is solved", () => {
    const game = createGame(puzzle("serine"));
    game.showSolution();
    expect(game.status()).toEqual({ kind: "revealed" });
    game.reset();
    build(game);
    expect(game.status()).toEqual({ kind: "solved" });
  });

  test("Help.01 show solution bonds the solution, marked as revealed, and Undo goes back to the Board before it", () => {
    const game = createGame(puzzle("serine"));
    click(game, "1,1", "2,1");
    game.showSolution();
    expect(game.status()).toEqual({ kind: "revealed" });
    expect(draw(game)).toBe(`
NH₂·OH
│   │
CH──CH₂
│   ·
C───OH
║
O
`);
    game.undo();
    expect(draw(game)).toBe(`
NH₂·OH
│   ·
CH··CH₂
·   ·
C···OH
·
O
`);
    expect(game.status()).toEqual({ kind: "open", few: 6, many: 0 });
  });

  test("Help.02 once the Board has no Bonds again, building it counts as solved", () => {
    const game = createGame(puzzle("acetonitrile"));
    click(game, "1,1", "2,1");
    game.showSolution();
    game.undo(); // back to one Bond: still revealed
    click(game, "2,1", "3,1", 3);
    expect(game.status().kind).toBe("revealed");
    game.reset();
    build(game);
    expect(game.status().kind).toBe("solved");
  });

  test("Help.01 showing the solution of a Board already solved keeps it solved", () => {
    const game = createGame(puzzle("acetonitrile"));
    build(game);
    game.showSolution();
    expect(game.status().kind).toBe("solved");
  });
});
