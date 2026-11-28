// @vitest-environment happy-dom
import { beforeEach, expect, test, vi, type Mock } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createUi } from "../../../src/ui/ui.ts";
import { createGame } from "../../../src/puzzle/game.ts";
import { difficulty } from "../../../src/puzzle/difficulty.ts";
import { PUZZLES } from "../../../src/puzzle/puzzles.ts";
import type { ChangeResult, Game, Puzzle } from "../../../src/puzzle/api.ts";
import type { Progress } from "../../../src/storage/api.ts";
import type { Handlers } from "../../../src/ui/api.ts";
import { attr, one } from "../../helpers/dom.ts";

// The page's body, from index.html, without its script.
const page = resolve(dirname(fileURLToPath(import.meta.url)), "../../../src/ui/index.html");
const html = readFileSync(page, "utf8").match(/<body>([\s\S]*)<\/body>/);
if (!html) throw new Error("index.html has no body");
const body = html[1].replace(/<script[\s\S]*?<\/script>/g, "");

let handlers: Record<keyof Handlers, Mock>;
beforeEach(() => {
  document.body.innerHTML = body;
  handlers = { onChange: vi.fn(), onOpen: vi.fn(), onUndo: vi.fn(), onReset: vi.fn(), onSolve: vi.fn() };
});

const view = (index: number, game: Game, progress: Progress = { puzzles: {}, current: PUZZLES[index].id }) => ({
  puzzles: PUZZLES, index, progress, difficulty: difficulty(PUZZLES[index]),
  status: game.status(), counts: game.counts(), done: game.done(), canUndo: game.canUndo, hasBonds: game.order.some(Boolean),
});
function show(index: number, { progress, confirm }: { progress?: Progress; confirm?: () => boolean } = {}) {
  const ui = createUi(document, handlers, { confirm: confirm ?? (() => true) });
  const game = createGame(PUZZLES[index]);
  ui.open(game);
  ui.render(view(index, game, progress));
  return { ui, game };
}
const button = (name: string) => {
  const found = document.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)
    ?? [...document.querySelectorAll("button")].find(b => b.textContent === name);
  if (!found) throw new Error(`no button ${name}`);
  return found;
};
const key = (init: KeyboardEventInit) => document.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));

test("Input.01, Input.02 the Board, the buttons and Ctrl+Z call their handlers", () => {
  const { ui, game } = show(1); // Acetic acid
  game.change(0, 1);
  ui.render(view(1, game));
  one(document, ".edge").dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
  const answers = [false, true], confirm = vi.fn(() => answers.shift() ?? false);
  show(8, { confirm });
  button("Show solution").click();
  expect(handlers.onSolve).not.toHaveBeenCalled();
  button("Show solution").click();
  expect(handlers.onSolve).toHaveBeenCalledTimes(1);
  expect(confirm.mock.calls).toEqual([["Show the solution?"], ["Show the solution?"]]);
});

test("Input.04 with no confirm of its own, createUi asks with the page's window", () => {
  const confirm = vi.fn(() => true);
  vi.stubGlobal("confirm", confirm); // happy-dom's window has none
  try {
    const ui = createUi(document, handlers);
    const game = createGame(PUZZLES[8]);
    ui.open(game);
    ui.render(view(8, game));
    button("Show solution").click();
    expect(confirm.mock.calls).toEqual([["Show the solution?"]]);
    expect(handlers.onSolve).toHaveBeenCalledTimes(1);
  } finally {
    vi.unstubAllGlobals();
  }
});

test("Input.05 Reset asks first, and only after OK calls onReset", () => {
  const answers = [false, true], confirm = vi.fn(() => answers.shift() ?? false);
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
  // The Grid of the Grid.02 example, which isn't a Puzzle's: its two Dotted lines cross.
  const crossing: Puzzle = {
    id: "crossing", name: "Crossing", formula: "C2H4O2", fact: "Not a Puzzle.", rows: 3, cols: 3,
    atoms: [["O", 0, 1, 0], ["C", 1, 0, 2], ["C", 1, 2, 2], ["O", 2, 1, 0]], solution: [],
  };
  const ui = createUi(document, handlers, { confirm: () => true });
  const game = createGame(crossing);
  ui.open(game);
  const message = () => one(document, '[role="alert"]');
  const result = (r: ChangeResult) => r; // as the game gives it
  game.change(game.bonds.findIndex(e => e.horizontal), 1); // CH₂ 2,1 to CH₂ 2,3
  ui.say(result({ changed: false }));
  ui.say(result({ changed: true }));
  expect(message().textContent).toBe("");
  ui.say(game.change(game.bonds.findIndex(e => !e.horizontal), 1)); // O 1,2 to O 3,2
  expect(message().textContent).toBe("Bonds can't cross.");
  // @ts-expect-error a reason the game doesn't give, which the UI words as none
  ui.say({ changed: false, reason: "full", atom: 0 });
  expect(message().textContent).toBe("Bonds can't cross."); // no reason to give: the message stays as it was
});

test("Panel.05 createUi gives the Elements it was made with to the key", () => {
  const ui = createUi(document, handlers, { confirm: () => true, elements: [{ symbol: "C", valence: 4 }, { symbol: "O", valence: 2 }] });
  const game = createGame(PUZZLES[1]);
  ui.open(game);
  ui.render(view(1, game));
  expect([...document.querySelectorAll("#info figure")].map(f => f.getAttribute("aria-label"))).toEqual(["Carbon: 4 bonds", "Oxygen: 2 bonds"]);
});

test("Board.05 the counts line: the Bonds used of the budget, and nothing on which Atoms are right", () => {
  const { ui, game } = show(1, {}); // Acetic acid, budget 4
  const line = () => one(document, "#counts");
  const render = () => ui.render(view(1, game));
  const make = (k: number, times: number) => { for (let n = 0; n < times; n++) game.change(k, 1); render(); };
  const bond = (a: number, b: number) => game.bonds.findIndex(e => e.a === a && e.b === b); // O 0, CH₃ 1, C 2, OH 3
  expect(line().textContent).toBe("Bonds 0 of 4");
  make(bond(0, 2), 3); // O≡C
  make(bond(2, 3), 1); // C─OH
  expect(line().textContent).toBe("Bonds 4 of 4");
  expect(line().querySelector(".warn")).toBeNull();
  make(bond(2, 3), 1); // C═OH
  make(bond(1, 2), 1); // CH₃─C
  expect(line().textContent).toBe("Bonds 6 of 4");
  expect(one(line(), ".warn").textContent).toBe("Bonds 6 of 4");
  const parts = [...line().querySelectorAll("[aria-label]")];
  expect(parts.map(e => e.getAttribute("aria-label"))).toEqual(["Bonds used, of the budget: 6 of 4"]);
  expect(parts.every(e => e.getAttribute("role") === "img")).toBe(true);
  expect(line().textContent).not.toMatch(/few|many/i); // it doesn't say whether a Bond is right
  expect(line().getAttribute("role")).toBeNull(); // the status line is the page's one status
});

test("Board.05 the line is the same when the Puzzle is solved", () => {
  const game = createGame(PUZZLES[1]);
  const ui = createUi(document, handlers, { confirm: () => true });
  ui.open(game);
  game.showSolution();
  ui.render(view(1, game));
  expect(game.status().kind).toBe("revealed");
  expect(one(document, "#counts").textContent).toBe("Bonds 4 of 4");
  expect(document.querySelector("#counts .warn")).toBeNull();
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
  const { ui, game } = show(6); // 1,4-Benzoquinone
  game.showSolution();
  ui.render(view(7, game));
  expect(one(document, "nav").textContent).toContain("Unsolved");
  expect(one(document, "header").textContent).toContain("Solved 0 of 30");
});

test("List.01, List.02 a button per Puzzle opens it, and the header shows the score", () => {
  show(2, { progress: { puzzles: { acetonitrile: "solved" }, current: "glycine" } });
  const list = one(document, '[aria-label="Puzzles"]');
  expect([...list.querySelectorAll("button")].slice(0, 3).map(b => b.getAttribute("aria-label")))
    .toEqual(["Puzzle 1: Acetonitrile, solved", "Puzzle 2", "Puzzle 3"]);
  expect(list.querySelectorAll("button")).toHaveLength(30);
  expect(attr(one(list, '[aria-current="true"]'), "aria-label")).toBe("Puzzle 3");
  expect(one(document, "header").textContent).toContain("Solved 1 of 30");
  button("Puzzle 13").click();
  expect(handlers.onOpen).toHaveBeenCalledWith(12);
});
