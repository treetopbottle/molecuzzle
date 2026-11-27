import { describe, expect, test } from "vitest";
import { startApp } from "../../src/app.ts";
import { createGame } from "../../src/puzzle/game.js";
import { PUZZLES } from "../../src/puzzle/puzzles.js";
import type { Game, Saved } from "../../src/puzzle/api.ts";
import type { BoardEntry, Progress, Store } from "../../src/storage/api.ts";
import type { Handlers, SayResult, Ui, View } from "../../src/ui/api.ts";

/** The last of a list, which must have one. */
function last<T>(list: T[]): T {
  const item = list.at(-1);
  if (item === undefined) throw new Error("none yet");
  return item;
}

/**
 * A store in memory, and a UI that records what it is asked to do. Both are
 * typed as what startApp is given, so tsc checks they fit, as the real ones
 * must; the UI's open keeps the Game it is given, which a method allows.
 */
function start(stored: Progress = { puzzles: {}, current: null }) {
  const store: Store & { saved: Progress } = {
    saved: stored,
    load: () => store.saved,
    update(change) { store.saved = change(store.saved); return store.saved; },
  };
  const opened: Game[] = [], views: View[] = [], said: SayResult[] = [];
  const created: [string, Partial<Saved> | undefined][] = [];
  let handlers: Handlers | undefined;
  startApp({
    puzzles: PUZZLES, store,
    createGame(puzzle, saved) { created.push([puzzle.id, saved]); return createGame(puzzle, saved); },
    createUi(given) {
      handlers = given;
      const ui: Ui = {
        open(game: Game) { opened.push(game); },
        render(view) { views.push(view); },
        say(result) { said.push(result); },
      };
      return ui;
    },
  });
  if (!handlers) throw new Error("startApp made no UI");
  const ui = { handlers, opened, views, said, created, view: () => last(views), game: () => last(opened) };
  return { store, ui };
}

test("Progress.01 it opens the stored Puzzle, or Puzzle 1 if that is missing or unknown", () => {
  expect(start({ puzzles: {}, current: "1-4-benzoquinone" }).ui.view().index).toBe(6);
  expect(start({ puzzles: {}, current: "1-4-benzoquinone" }).ui.game().puzzle.id).toBe("1-4-benzoquinone");
  expect(start({ puzzles: {}, current: null }).ui.view().index).toBe(0);
  expect(start({ puzzles: {}, current: "no-such-puzzle" }).ui.view().index).toBe(0);
});

test("Panel.01 the view has the open Puzzle's difficulty", () => {
  const { ui } = start();
  expect(ui.view().difficulty).toBe(2); // Acetonitrile
  ui.handlers.onOpen(29);
  expect(ui.view().difficulty).toBe(67); // Prostaglandin E2
});

test("Progress.01 the open Puzzle is saved", () => {
  const { store, ui } = start();
  expect(store.saved.current).toBe("acetonitrile");
  ui.handlers.onOpen(1);
  expect(store.saved).toEqual({ puzzles: {}, current: "acetic-acid" });
  expect(ui.game().puzzle.id).toBe("acetic-acid");
  expect(ui.view()).toMatchObject({ index: 1, progress: store.saved });
});

test("Progress.01 a solved Puzzle is marked solved, and the UI shows it", () => {
  const { store, ui } = start();
  const k = (a: number, b: number) => ui.game().bonds.findIndex(e => e.a === a && e.b === b);
  ui.handlers.onChange(k(0, 1), 1);
  for (let n = 0; n < 3; n++) ui.handlers.onChange(k(1, 2), 1);
  expect(store.saved).toEqual({
    puzzles: { acetonitrile: "solved" }, current: "acetonitrile",
    boards: { acetonitrile: { bonds: [[0, 1, 1], [1, 2, 3]], revealed: false, undo: [] } },
  });
  expect(ui.view()).toMatchObject({ status: { kind: "solved" }, done: true, progress: store.saved });
});

test("Progress.01 a Puzzle not yet solved isn't marked", () => {
  const { store, ui } = start();
  ui.handlers.onChange(0, 1);
  ui.handlers.onChange(1, 1);
  expect(store.saved.puzzles).toEqual({});
});

test("Input.01, Input.03 changes, Undo, Reset and Show solution go to the game, and the UI shows the result", () => {
  const { store, ui } = start({ puzzles: {}, current: "acetic-acid" });
  ui.handlers.onChange(1, 1); // CH₃─C
  expect(ui.said.at(-1)).toEqual({ changed: true });
  expect(ui.view()).toMatchObject({ status: { kind: "open", few: 3, many: 0 }, canUndo: true, hasBonds: true });
  expect(ui.view().counts).toEqual({ used: 1, budget: 4, few: 3, many: 0 }); // Board.05
  ui.handlers.onUndo();
  expect(ui.view()).toMatchObject({ status: { kind: "empty" }, canUndo: false, hasBonds: false });
  ui.handlers.onSolve();
  expect(ui.view()).toMatchObject({ status: { kind: "revealed" }, done: true });
  expect(store.saved.puzzles).toEqual({});
  ui.handlers.onReset();
  expect(ui.view()).toMatchObject({ status: { kind: "empty" }, hasBonds: false });
});

describe("Progress.05, Progress.06", () => {
  const entry = (id: string) => (store: { saved: Progress }) => store.saved.boards?.[id];

  test("Progress.05 a change, Undo and Show solution keep the open Puzzle's Board, its undo history and whether the solution was shown", () => {
    const { store, ui } = start({ puzzles: {}, current: "acetic-acid" });
    const aceticAcid = entry("acetic-acid");
    ui.handlers.onChange(1, 1);
    expect(aceticAcid(store)).toEqual({ bonds: [[1, 2, 1]], revealed: false, undo: [[]] });
    ui.handlers.onChange(2, 1);
    ui.handlers.onUndo();
    expect(aceticAcid(store)).toEqual({ bonds: [[1, 2, 1]], revealed: false, undo: [[]] });
    ui.handlers.onSolve();
    expect(aceticAcid(store)).toEqual({ bonds: PUZZLES[1].solution, revealed: true, undo: [[], [[1, 2, 1]]] }); // Puzzle 2, Acetic acid
  });

  test("Progress.05 Reset removes what was kept, and no boards are left", () => {
    const { store, ui } = start({ puzzles: {}, current: "acetonitrile" });
    ui.handlers.onChange(0, 1);
    expect(entry("acetonitrile")(store)).toBeDefined();
    ui.handlers.onReset();
    expect(store.saved).toEqual({ puzzles: {}, current: "acetonitrile" });
  });

  test("Progress.06 solving keeps the solved Board, it opens again solved, and Reset removes it", () => {
    const { store, ui } = start({ puzzles: {}, current: "acetonitrile" });
    const solved = { bonds: [[0, 1, 1], [1, 2, 3]], revealed: false, undo: [] };
    ui.handlers.onChange(0, 1);
    for (let n = 0; n < 3; n++) ui.handlers.onChange(1, 1);
    expect(store.saved).toEqual({ puzzles: { acetonitrile: "solved" }, current: "acetonitrile", boards: { acetonitrile: solved } });
    ui.handlers.onOpen(1);
    ui.handlers.onOpen(0);
    expect(ui.created.at(-1)).toEqual(["acetonitrile", solved]);
    expect(ui.view()).toMatchObject({ status: { kind: "solved" }, done: true, canUndo: false, hasBonds: true });
    ui.handlers.onReset();
    expect(store.saved).toEqual({ puzzles: { acetonitrile: "solved" }, current: "acetonitrile" });
    expect(ui.view()).toMatchObject({ status: { kind: "empty" }, hasBonds: false });
  });

  test("Progress.05 an entry whose Board can't be on the Grid is removed when its Puzzle opens", () => {
    const { store } = start({ puzzles: {}, current: "acetonitrile", boards: { acetonitrile: { bonds: [[0, 2, 1]], revealed: false, undo: [] } } });
    expect(store.saved).toEqual({ puzzles: {}, current: "acetonitrile" });
  });

  test("Progress.05 opening a Puzzle goes on where it was left, and another Puzzle's Board stays kept", () => {
    const kept: BoardEntry = { bonds: [[1, 2, 1]], revealed: false, undo: [[]] };
    const { store, ui } = start({ puzzles: {}, current: "glycine", boards: { "acetic-acid": kept } });
    expect(ui.created).toEqual([["glycine", undefined]]);
    ui.handlers.onOpen(1);
    expect(ui.created.at(-1)).toEqual(["acetic-acid", kept]);
    expect(ui.game().board()).toEqual([[1, 2, 1]]);
    expect(ui.view().canUndo).toBe(true);
    ui.handlers.onOpen(0);
    ui.handlers.onChange(0, 1);
    expect(store.saved.boards).toEqual({ "acetic-acid": kept, acetonitrile: { bonds: [[0, 1, 1]], revealed: false, undo: [[]] } });
  });
});
