import { describe, expect, test } from "vitest";
import { startApp } from "../../src/app.js";
import { createGame } from "../../src/puzzle/game.js";
import { PUZZLES } from "../../src/puzzle/puzzles.js";

/** A store in memory, and a UI that records what it is asked to do. */
function start(stored = { puzzles: {}, current: null }) {
  const store = {
    saved: stored,
    load: () => store.saved,
    update(change) { store.saved = change(store.saved); return store.saved; },
  };
  const ui = { opened: [], views: [], said: [], created: [] };
  startApp({
    puzzles: PUZZLES, store,
    createGame(puzzle, saved) { ui.created.push([puzzle.id, saved]); return createGame(puzzle, saved); },
    createUi(handlers) {
      ui.handlers = handlers;
      return { open: game => ui.opened.push(game), render: view => ui.views.push(view), say: result => ui.said.push(result) };
    },
  });
  ui.view = () => ui.views.at(-1);
  ui.game = () => ui.opened.at(-1);
  return { store, ui };
}

test("Progress.01 it opens the stored Puzzle, or Puzzle 1 if that is missing or unknown", () => {
  expect(start({ puzzles: {}, current: "urea" }).ui.view().index).toBe(7);
  expect(start({ puzzles: {}, current: "urea" }).ui.game().puzzle.id).toBe("urea");
  expect(start({ puzzles: {}, current: null }).ui.view().index).toBe(0);
  expect(start({ puzzles: {}, current: "no-such-puzzle" }).ui.view().index).toBe(0);
});

test("Progress.01 the open Puzzle is saved", () => {
  const { store, ui } = start();
  expect(store.saved.current).toBe("water");
  ui.handlers.onOpen(1);
  expect(store.saved).toEqual({ puzzles: {}, current: "hydrogen-cyanide" });
  expect(ui.game().puzzle.id).toBe("hydrogen-cyanide");
  expect(ui.view()).toMatchObject({ index: 1, progress: store.saved });
});

test("Progress.01 a solved Puzzle is marked solved, and the UI shows it", () => {
  const { store, ui } = start();
  const k = (a, b) => ui.game().bonds.findIndex(e => e.a === a && e.b === b);
  ui.handlers.onChange(k(0, 1), 1);
  expect(store.saved.puzzles).toEqual({});
  ui.handlers.onChange(k(1, 2), 1);
  expect(store.saved).toEqual({
    puzzles: { water: "solved" }, current: "water",
    boards: { water: { bonds: [[0, 1, 1], [1, 2, 1]], revealed: false, undo: [] } },
  });
  expect(ui.view()).toMatchObject({ status: { kind: "solved" }, done: true, progress: store.saved });
});

test("Input.01, Input.03 changes, Undo, Reset and Show solution go to the game, and the UI shows the result", () => {
  const { store, ui } = start({ puzzles: {}, current: "formaldehyde" });
  ui.handlers.onChange(0, 1);
  expect(ui.said.at(-1)).toEqual({ changed: true });
  expect(ui.view()).toMatchObject({ status: { kind: "open", open: 3 }, canUndo: true, hasBonds: true });
  ui.handlers.onUndo();
  expect(ui.view()).toMatchObject({ status: { kind: "empty" }, canUndo: false, hasBonds: false });
  ui.handlers.onSolve();
  expect(ui.view()).toMatchObject({ status: { kind: "revealed" }, done: true });
  expect(store.saved.puzzles).toEqual({});
  ui.handlers.onReset();
  expect(ui.view()).toMatchObject({ status: { kind: "empty" }, hasBonds: false });
});

describe("Progress.05, Progress.06", () => {
  const entry = id => store => store.saved.boards?.[id];

  test("Progress.05 a change, Undo and Show solution keep the open Puzzle's Board, its undo history and whether the solution was shown", () => {
    const { store, ui } = start({ puzzles: {}, current: "formaldehyde" });
    const formaldehyde = entry("formaldehyde");
    ui.handlers.onChange(0, 1);
    expect(formaldehyde(store)).toEqual({ bonds: [[0, 1, 1]], revealed: false, undo: [[]] });
    ui.handlers.onChange(1, 1);
    ui.handlers.onUndo();
    expect(formaldehyde(store)).toEqual({ bonds: [[0, 1, 1]], revealed: false, undo: [[]] });
    ui.handlers.onSolve();
    expect(formaldehyde(store)).toEqual({ bonds: PUZZLES.find(p => p.id === "formaldehyde").solution, revealed: true, undo: [[], [[0, 1, 1]]] });
  });

  test("Progress.05 Reset removes what was kept, and no boards are left", () => {
    const { store, ui } = start({ puzzles: {}, current: "water" });
    ui.handlers.onChange(0, 1);
    expect(entry("water")(store)).toBeDefined();
    ui.handlers.onReset();
    expect(store.saved).toEqual({ puzzles: {}, current: "water" });
  });

  test("Progress.06 solving keeps the solved Board, it opens again solved, and Reset removes it", () => {
    const { store, ui } = start({ puzzles: {}, current: "water" });
    const solved = { bonds: [[0, 1, 1], [1, 2, 1]], revealed: false, undo: [] };
    ui.handlers.onChange(0, 1);
    ui.handlers.onChange(1, 1);
    expect(store.saved).toEqual({ puzzles: { water: "solved" }, current: "water", boards: { water: solved } });
    ui.handlers.onOpen(1);
    ui.handlers.onOpen(0);
    expect(ui.created.at(-1)).toEqual(["water", solved]);
    expect(ui.view()).toMatchObject({ status: { kind: "solved" }, done: true, canUndo: false, hasBonds: true });
    ui.handlers.onReset();
    expect(store.saved).toEqual({ puzzles: { water: "solved" }, current: "water" });
    expect(ui.view()).toMatchObject({ status: { kind: "empty" }, hasBonds: false });
  });

  test("Progress.05 an entry whose Board can't be on the Grid is removed when its Puzzle opens", () => {
    const { store } = start({ puzzles: {}, current: "hydrogen-cyanide", boards: { "hydrogen-cyanide": { bonds: [[0, 2, 1]], revealed: false, undo: [] } } });
    expect(store.saved).toEqual({ puzzles: {}, current: "hydrogen-cyanide" });
  });

  test("Progress.05 opening a Puzzle goes on where it was left, and another Puzzle's Board stays kept", () => {
    const kept = { bonds: [[0, 1, 1]], revealed: false, undo: [[]] };
    const { store, ui } = start({ puzzles: {}, current: "methanol", boards: { "hydrogen-cyanide": kept } });
    expect(ui.created).toEqual([["methanol", undefined]]);
    ui.handlers.onOpen(1);
    expect(ui.created.at(-1)).toEqual(["hydrogen-cyanide", kept]);
    expect(ui.game().board()).toEqual([[0, 1, 1]]);
    expect(ui.view().canUndo).toBe(true);
    ui.handlers.onOpen(0);
    ui.handlers.onChange(0, 1);
    expect(store.saved.boards).toEqual({ "hydrogen-cyanide": kept, water: { bonds: [[0, 1, 1]], revealed: false, undo: [[]] } });
  });
});
