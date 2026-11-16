// The UI: owns the page. The Board, the panel, the Puzzles list, the status
// line, the message, the buttons and Ctrl+Z. What the Player does goes to
// the handlers; what to show comes in as a view.
import { createBoard } from "./board.js";
import { renderPanel } from "./panel.js";
import { renderPuzzleList } from "./puzzle-list.js";
import { statusText, reasonText } from "./messages.js";

const STATUS_CLASS = { solved: "good", revealed: "good", pieces: "warn" };

/**
 * @param {Document} doc
 * @param {{ onChange(k: number, dir: number): void, onOpen(index: number): void,
 *   onUndo(): void, onReset(): void, onSolve(): void }} handlers
 *   onSolve comes only after the Player confirms.
 * @param {{ confirm?: (question: string) => boolean }} [options]
 */
export function createUi(doc, handlers, { confirm = question => doc.defaultView.confirm(question) } = {}) {
  const $ = id => doc.getElementById(id);
  let game, board, toastTimer;

  $("info").addEventListener("click", e => {
    const button = e.target.closest("button[data-open]");
    if (button && !button.disabled) handlers.onOpen(Number(button.dataset.open));
  });
  $("btnUndo").addEventListener("click", () => handlers.onUndo());
  $("btnReset").addEventListener("click", () => handlers.onReset());
  $("btnSolve").addEventListener("click", () => { if (confirm("Show the solution?")) handlers.onSolve(); });
  doc.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); handlers.onUndo(); }
  });

  /** Shows a game's Board, for the Puzzle just opened. */
  function open(next) {
    game = next;
    board = createBoard($("board"), game, { onChange: handlers.onChange });
  }

  /**
   * @param {{ puzzles: object[], index: number, progress: {puzzles: Record<string,string>},
   *   status: {kind: string}, done: boolean, canUndo: boolean, hasBonds: boolean }} view
   */
  function render(view) {
    const { puzzles, index, progress, status } = view;
    board.render();
    renderPanel($("info"), view);
    const line = $("status");
    line.textContent = statusText(status, puzzles[index]);
    line.className = STATUS_CLASS[status.kind] ?? "";
    $("btnUndo").disabled = !view.canUndo;
    $("btnReset").disabled = !view.hasBonds;
    const solved = puzzles.filter(p => progress.puzzles[p.id] === "solved").length;
    $("score").textContent = `Solved ${solved} of ${puzzles.length}`;
    renderPuzzleList($("puzzles"), puzzles, progress, index, handlers.onOpen);
  }

  /** Shows for a moment why a change made no Bond, if it has a reason. */
  function say(result) {
    const text = reasonText(result, game.atoms);
    if (!text) return;
    const toast = $("toast");
    toast.textContent = text;
    toast.className = "show";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.className = ""), 1800);
  }

  return { open, render, say };
}
