// Wires the page together: the open puzzle, its Board, the panel, the
// puzzle list and Progress.
import { PUZZLES } from "./puzzles.js";
import { createGame, statusText } from "./game.js";
import { createBoard } from "./board.js";
import { renderPuzzleList, formulaNodes } from "./puzzle-list.js";
import { loadProgress, saveProgress, mark } from "./progress.js";

const BADGES = { solved: "✓ Solved", revealed: "Solution seen" };

/**
 * @param {Document} doc
 * @param {{ storage?: Storage, puzzles?: typeof PUZZLES, confirm?: (q: string) => boolean }} [options]
 */
export function startApp(doc, { storage, puzzles = PUZZLES, confirm = q => doc.defaultView.confirm(q) } = {}) {
  const $ = id => doc.getElementById(id);
  let progress = loadProgress(storage);
  let index = Math.max(0, puzzles.findIndex(p => p.id === progress.current));
  let game, board, toastTimer;

  function toast(text) {
    const t = $("toast");
    t.textContent = text;
    t.className = "show";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.className = ""), 1800);
  }

  function open(i) {
    index = i;
    game = createGame(puzzles[i]);
    board = createBoard($("board"), game, { onChange });
    progress = { ...progress, current: puzzles[i].id };
    saveProgress(storage, progress);
    update();
  }

  function onChange(k, dir) {
    const result = game.change(k, dir);
    if (result.message) toast(result.message);
    if (result.changed) update();
  }

  function update() {
    const puzzle = puzzles[index], status = game.status(), done = game.done();
    if (done) {
      const next = mark(progress, puzzle.id, status.kind);
      if (next !== progress) { progress = next; saveProgress(storage, progress); }
    }
    board.render();

    $("counter").textContent = `Puzzle ${index + 1} of ${puzzles.length}`;
    $("prev").disabled = index === 0;
    $("next").disabled = index === puzzles.length - 1;
    const state = progress.puzzles[puzzle.id];
    $("badge").textContent = BADGES[state] ?? "Unsolved";
    $("badge").className = `badge ${state ?? ""}`;
    $("title").textContent = done ? puzzle.name : "?";
    if (done) $("formula").replaceChildren(...formulaNodes(doc, puzzle.formula));
    else $("formula").textContent = "Bond every atom to find out what it is.";
    $("fact").textContent = puzzle.fact;
    $("fact").hidden = !done;
    $("nextPuzzle").hidden = !done || index === puzzles.length - 1;

    const line = $("status");
    line.textContent = statusText(status, puzzle);
    line.className = { solved: "good", revealed: "good", pieces: "warn" }[status.kind] ?? "";
    $("btnUndo").disabled = !game.canUndo;
    $("btnReset").disabled = !game.order.some(Boolean);

    const solvedCount = puzzles.filter(p => progress.puzzles[p.id] === "solved").length;
    $("score").textContent = `Solved ${solvedCount} of ${puzzles.length}`;
    renderPuzzleList($("puzzles"), puzzles, progress, index, open);
  }

  $("prev").addEventListener("click", () => index > 0 && open(index - 1));
  $("next").addEventListener("click", () => index < puzzles.length - 1 && open(index + 1));
  $("nextPuzzle").addEventListener("click", () => index < puzzles.length - 1 && open(index + 1));
  $("btnUndo").addEventListener("click", () => game.undo() && update());
  $("btnReset").addEventListener("click", () => game.reset() && update());
  $("btnSolve").addEventListener("click", () => {
    if (!confirm("Show the solution?")) return;
    game.showSolution();
    update();
  });
  doc.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (game.undo()) update(); }
  });

  open(index);
  return { get game() { return game; }, open };
}
