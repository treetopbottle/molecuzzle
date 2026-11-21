// @vitest-environment happy-dom
import { beforeEach, expect, test, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createUi } from "../../../src/ui/ui.js";
import { createGame } from "../../../src/puzzle/game.js";
import { PUZZLES } from "../../../src/puzzle/puzzles.js";

// The page's body, from index.html, without its script.
const page = resolve(dirname(fileURLToPath(import.meta.url)), "../../../src/ui/index.html");
const body = readFileSync(page, "utf8")
  .match(/<body>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, "");

let handlers;
beforeEach(() => {
  document.body.innerHTML = body;
  handlers = { onChange: vi.fn(), onOpen: vi.fn(), onUndo: vi.fn(), onReset: vi.fn(), onSolve: vi.fn() };
});

const view = (index, game, progress = { puzzles: {}, current: PUZZLES[index].id }) => ({
  puzzles: PUZZLES, index, progress,
  status: game.status(), done: game.done(), canUndo: game.canUndo, hasBonds: game.order.some(Boolean),
});
function show(index, { progress, confirm } = {}) {
  const ui = createUi(document, handlers, { confirm: confirm ?? (() => true) });
  const game = createGame(PUZZLES[index]);
  ui.open(game);
  ui.render(view(index, game, progress));
  return { ui, game };
}
const button = name => document.querySelector(`button[aria-label="${name}"]`)
  ?? [...document.querySelectorAll("button")].find(b => b.textContent === name);
const key = init => document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));

test("Input.01, Input.02 the Board, the buttons and Ctrl+Z call their handlers", () => {
  const { ui, game } = show(1); // Ammonia
  game.change(0, 1);
  ui.render(view(1, game));
  document.querySelector(".edge").dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(handlers.onChange).toHaveBeenCalledWith(0, 1);
  button("Undo").click();
  key({ key: "z", ctrlKey: true });
  key({ key: "Z", metaKey: true });
  key({ key: "z" });
  expect(handlers.onUndo).toHaveBeenCalledTimes(3);
  button("Reset").click();
  expect(handlers.onReset).toHaveBeenCalledTimes(1);
});

test("Input.03 Undo is disabled with nothing to undo, Reset with no Bonds and nothing to undo", () => {
  const { ui, game } = show(1);
  expect(button("Undo").disabled).toBe(true);
  expect(button("Reset").disabled).toBe(true);
  expect(button("Show solution").disabled).toBe(false);
  game.change(0, 1);
  ui.render(view(1, game));
  expect(button("Undo").disabled).toBe(false);
  expect(button("Reset").disabled).toBe(false);
});

test("Input.03 Reset is enabled with no Bonds but something to undo", () => {
  const { ui, game } = show(1);
  game.change(0, 1);
  game.change(0, -1);
  ui.render(view(1, game));
  expect(button("Reset").disabled).toBe(false);
});

test("Input.04 Show solution asks first, and only after OK calls onSolve", () => {
  const answers = [false, true], confirm = vi.fn(() => answers.shift());
  show(8, { confirm });
  button("Show solution").click();
  expect(handlers.onSolve).not.toHaveBeenCalled();
  button("Show solution").click();
  expect(handlers.onSolve).toHaveBeenCalledTimes(1);
  expect(confirm.mock.calls).toEqual([["Show the solution?"], ["Show the solution?"]]);
});

test("Input.05 Reset asks first, and only after OK calls onReset", () => {
  const answers = [false, true], confirm = vi.fn(() => answers.shift());
  const { ui, game } = show(1, { confirm });
  game.change(0, 1);
  ui.render(view(1, game));
  button("Reset").click();
  expect(handlers.onReset).not.toHaveBeenCalled();
  button("Reset").click();
  expect(handlers.onReset).toHaveBeenCalledTimes(1);
  expect(confirm.mock.calls).toEqual(Array(2).fill(["Reset this puzzle? Its bonds and undo history are removed."]));
});

test("Messages.02 say words why a Bond isn't made, and says nothing without a reason", () => {
  const { ui } = show(4); // Methanol
  const message = () => document.querySelector('[role="alert"]');
  ui.say({ changed: false });
  ui.say({ changed: true });
  expect(message().textContent).toBe("");
  ui.say({ changed: false, reason: "full", atom: 4 });
  expect(message().textContent).toBe("Hydrogen already has all its bonds.");
});

test("Panel.01, Panel.03 ‹, › and Next puzzle → open their Puzzle", () => {
  const { ui, game } = show(1);
  button("Previous puzzle").click();
  button("Next puzzle").click();
  game.showSolution();
  ui.render(view(1, game));
  button("Next puzzle →").click();
  expect(handlers.onOpen.mock.calls).toEqual([[0], [2], [2]]);
});

test("Panel.01, List.02 a shown solution leaves the Puzzle unsolved", () => {
  const { ui, game } = show(8); // Urea
  game.showSolution();
  ui.render(view(8, game));
  expect(document.querySelector("nav").textContent).toContain("Unsolved");
  expect(document.querySelector("header").textContent).toContain("Solved 0 of 21");
});

test("List.01, List.02 a button per Puzzle opens it, and the header shows the score", () => {
  show(2, { progress: { puzzles: { water: "solved" }, current: "formaldehyde" } });
  const list = document.querySelector('[aria-label="Puzzles"]');
  expect([...list.querySelectorAll("button")].slice(0, 3).map(b => b.getAttribute("aria-label")))
    .toEqual(["Puzzle 1: Water, solved", "Puzzle 2", "Puzzle 3"]);
  expect(list.querySelector('[aria-current="true"]').getAttribute("aria-label")).toBe("Puzzle 3");
  expect(document.querySelector("header").textContent).toContain("Solved 1 of 21");
  button("Puzzle 13").click();
  expect(handlers.onOpen).toHaveBeenCalledWith(12);
});
