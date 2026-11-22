// The UI: owns the page. The Board, the panel, the Puzzles list, the status
// line, the message, the buttons and Ctrl+Z. What the Player does goes to
// the handlers; what to show comes in as a view.
import { createBoard } from "./board.js";
import { renderPanel } from "./panel.js";
import { renderPuzzleList } from "./puzzle-list.js";
import { statusText, reasonText } from "./messages.js";

const STATUS_CLASS = { solved: "good", revealed: "good", pieces: "warn" };

/** The counts line of Board.05: the Bonds used of the budget, and the Atoms with too few and too many. */
function renderCounts(line, { used, budget, few, many }) {
  const part = (text, label, warn = false) => {
    const span = line.ownerDocument.createElement("span");
    span.textContent = text;
    span.setAttribute("aria-label", label);
    span.classList.toggle("warn", warn);
    return span;
  };
  const sep = () => line.ownerDocument.createTextNode(" · ");
  line.replaceChildren(
    part(`Bonds ${used} of ${budget}`, `Bonds used, of the budget: ${used} of ${budget}`, used > budget), sep(),
    part(`Too few: ${few}`, `Atoms with too few bonds: ${few}`), sep(),
    part(`Too many: ${many}`, `Atoms with too many bonds: ${many}`));
}

/**
 * @param {Document} doc
 * @param {{ onChange(k: number, dir: number): void, onOpen(index: number): void,
 *   onUndo(): void, onReset(): void, onSolve(): void }} handlers
 *   onSolve and onReset come only after the Player confirms.
 * @param {{ confirm?: (question: string) => boolean, elements?: {symbol: string, valence: number}[] }} [options]
 *   elements: each Element's number of bonds, for the key of the panel, in its order.
 */
export function createUi(doc, handlers, { confirm = question => doc.defaultView.confirm(question), elements = [] } = {}) {
  const $ = id => doc.getElementById(id);
  let game, board, toastTimer;

  $("info").addEventListener("click", e => {
    const button = e.target.closest("button[data-open]");
    if (button && !button.disabled) handlers.onOpen(Number(button.dataset.open));
  });
  $("btnUndo").addEventListener("click", () => handlers.onUndo());
  $("btnReset").addEventListener("click", () => {
    if (confirm("Reset this puzzle? Its bonds and undo history are removed.")) handlers.onReset();
  });
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
   *   status: {kind: string}, counts: {used: number, budget: number, few: number, many: number}, done: boolean, canUndo: boolean, hasBonds: boolean }} view
   */
  function render(view) {
    const { puzzles, index, progress, status } = view;
    board.render();
    renderPanel($("info"), { ...view, elements });
    renderCounts($("counts"), view.counts);
    const line = $("status");
    line.textContent = statusText(status, puzzles[index]);
    line.className = STATUS_CLASS[status.kind] ?? "";
    $("btnUndo").disabled = !view.canUndo;
    $("btnReset").disabled = !view.hasBonds && !view.canUndo;
    const solved = puzzles.filter(p => progress.puzzles[p.id] === "solved").length;
    $("score").textContent = `Solved ${solved} of ${puzzles.length}`;
    renderPuzzleList($("puzzles"), puzzles, progress, index, handlers.onOpen);
  }

  /** Shows for a moment why a change made no Bond, if it has a reason. */
  function say(result) {
    const text = reasonText(result);
    if (!text) return;
    const toast = $("toast");
    toast.textContent = text;
    toast.className = "show";
    doc.defaultView.clearTimeout(toastTimer);
    toastTimer = doc.defaultView.setTimeout(() => (toast.className = ""), 1800);
  }

  return { open, render, say };
}
