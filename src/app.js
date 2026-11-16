// Wires the page together: the open puzzle, its Board, the panel, the
// puzzle list and Progress.
import { PUZZLES } from "./puzzle/puzzles.js";
import { createGame } from "./puzzle/game.js";
import { createBoard } from "./ui/board.js";
import { statusText, reasonText } from "./ui/messages.js";
import { renderPuzzleList } from "./ui/puzzle-list.js";
import { renderPanel } from "./ui/panel.js";
import { createProgressStore, markSolved } from "./storage/progress.js";

/**
 * @param {Document} doc
 * @param {{ storage?: Storage, puzzles?: typeof PUZZLES, confirm?: (q: string) => boolean }} [options]
 */
export function startApp(doc, { storage, puzzles = PUZZLES, confirm = q => doc.defaultView.confirm(q) } = {}) {
  const $ = id => doc.getElementById(id);
  const store = createProgressStore(storage);
  let progress = store.load();
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
    progress = store.update(p => ({ ...p, current: puzzles[i].id }));
    update();
  }

  function onChange(k, dir) {
    const result = game.change(k, dir);
    const reason = reasonText(result, game.atoms);
    if (reason) toast(reason);
    if (result.changed) update();
  }

  function update() {
    const puzzle = puzzles[index], status = game.status(), done = game.done();
    if (status.kind === "solved") {
      if (progress.puzzles[puzzle.id] !== "solved") progress = store.update(p => markSolved(p, puzzle.id));
    }
    board.render();

    renderPanel($("info"), { puzzles, index, progress, done });

    const line = $("status");
    line.textContent = statusText(status, puzzle);
    line.className = { solved: "good", revealed: "good", pieces: "warn" }[status.kind] ?? "";
    $("btnUndo").disabled = !game.canUndo;
    $("btnReset").disabled = !game.order.some(Boolean);

    const solvedCount = puzzles.filter(p => progress.puzzles[p.id] === "solved").length;
    $("score").textContent = `Solved ${solvedCount} of ${puzzles.length}`;
    renderPuzzleList($("puzzles"), puzzles, progress, index, open);
  }

  $("info").addEventListener("click", e => {
    const button = e.target.closest("button[data-open]");
    if (button && !button.disabled) open(Number(button.dataset.open));
  });
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
