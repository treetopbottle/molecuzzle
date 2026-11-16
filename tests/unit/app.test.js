import { expect, test } from "vitest";
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
  const ui = { opened: [], views: [], said: [] };
  startApp({
    puzzles: PUZZLES, createGame, store,
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
  expect(start({ puzzles: {}, current: "urea" }).ui.view().index).toBe(8);
  expect(start({ puzzles: {}, current: "urea" }).ui.game().puzzle.id).toBe("urea");
  expect(start({ puzzles: {}, current: null }).ui.view().index).toBe(0);
  expect(start({ puzzles: {}, current: "no-such-puzzle" }).ui.view().index).toBe(0);
});

test("Progress.01 the open Puzzle is saved", () => {
  const { store, ui } = start();
  expect(store.saved.current).toBe("water");
  ui.handlers.onOpen(3);
  expect(store.saved).toEqual({ puzzles: {}, current: "hydrogen-cyanide" });
  expect(ui.game().puzzle.id).toBe("hydrogen-cyanide");
  expect(ui.view()).toMatchObject({ index: 3, progress: store.saved });
});

test("Progress.01 a solved Puzzle is marked solved, and the UI shows it", () => {
  const { store, ui } = start();
  const k = (a, b) => ui.game().bonds.findIndex(e => e.a === a && e.b === b);
  ui.handlers.onChange(k(0, 1), 1);
  expect(store.saved.puzzles).toEqual({});
  ui.handlers.onChange(k(1, 2), 1);
  expect(store.saved).toEqual({ puzzles: { water: "solved" }, current: "water" });
  expect(ui.view()).toMatchObject({ status: { kind: "solved" }, done: true, progress: store.saved });
});

test("Input.01, Input.03 changes, Undo, Reset and Show solution go to the game, and the UI shows the result", () => {
  const { ui } = start({ puzzles: {}, current: "ammonia" });
  ui.handlers.onChange(0, 1);
  expect(ui.said.at(-1)).toEqual({ changed: true });
  expect(ui.view()).toMatchObject({ status: { kind: "open", open: 3 }, canUndo: true, hasBonds: true });
  ui.handlers.onUndo();
  expect(ui.view()).toMatchObject({ status: { kind: "empty" }, canUndo: false, hasBonds: false });
  ui.handlers.onSolve();
  expect(ui.view()).toMatchObject({ status: { kind: "revealed" }, done: true });
  ui.handlers.onReset();
  expect(ui.view()).toMatchObject({ status: { kind: "empty" }, hasBonds: false });
});
