// The UI: owns the page. The Board, the panel, the Puzzles list, the status
// line, the message, the buttons and Ctrl+Z. What the Player does goes to
// the handlers; what to show comes in as a view.
import type { BoardModel, Counts, Handlers, SayResult, Ui, UiOptions, View } from "./api.ts";
import { createBoard } from "./board.ts";
import { renderPanel } from "./panel.ts";
import { renderPuzzleList } from "./puzzle-list.ts";
import { statusText, reasonText } from "./messages.ts";

const STATUS_CLASS: Partial<Record<string, string>> = { solved: "good", revealed: "good", pieces: "warn" };

/** The counts line of Board.05: the Bonds used of the budget; not which Atoms are right. */
function renderCounts(line: HTMLElement, { used, budget }: Counts): void {
  const span = line.ownerDocument.createElement("span");
  span.textContent = `Bonds ${used} of ${budget}`;
  span.setAttribute("role", "img");
  span.setAttribute("aria-label", `Bonds used, of the budget: ${used} of ${budget}`);
  span.classList.toggle("warn", used > budget);
  line.replaceChildren(span);
}

export function createUi(doc: Document, handlers: Handlers, options: UiOptions = {}): Ui {
  /** The page's window, for its dialogs, timers and classes. */
  function win(): Window & typeof globalThis {
    const view = doc.defaultView;
    if (!view) throw new Error("the page has no window");
    return view;
  }
  const { confirm = (question: string) => win().confirm(question), elements = [] } = options;
  /** The page's element with this id, of the kind it is; for the developer, it throws if the page has none. */
  function $<E extends Element = HTMLElement>(id: string): E {
    const e = doc.querySelector<E>(`#${id}`);
    if (!e) throw new Error(`no #${id} in the page`);
    return e;
  }
  let board: { render(): void } | undefined, toastTimer: number | undefined;

  $("info").addEventListener("click", e => {
    if (!(e.target instanceof win().Element)) return;
    const button = e.target.closest<HTMLButtonElement>("button[data-open]");
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
  function open(game: BoardModel): void {
    board = createBoard($<SVGSVGElement>("board"), game, { onChange: handlers.onChange });
  }

  function render(view: View): void {
    const { puzzles, index, progress, status } = view;
    if (!board) throw new Error("render before open");
    board.render();
    renderPanel($("info"), { ...view, elements });
    renderCounts($("counts"), view.counts);
    $("status").textContent = statusText(status, puzzles[index]);
    $("note").className = STATUS_CLASS[status.kind] ?? "";
    $<HTMLButtonElement>("btnUndo").disabled = !view.canUndo;
    $<HTMLButtonElement>("btnReset").disabled = !view.hasBonds && !view.canUndo;
    const solved = puzzles.filter(p => progress.puzzles[p.id] === "solved").length;
    $("score").textContent = `Solved ${solved} of ${puzzles.length}`;
    renderPuzzleList($<HTMLOListElement>("puzzles"), puzzles, progress, index, handlers.onOpen);
  }

  /** Shows for a moment why a change made no Bond, if it has a reason. */
  function say(result: SayResult): void {
    const text = reasonText(result);
    if (!text) return;
    const toast = $("toast");
    toast.textContent = text;
    toast.className = "show";
    win().clearTimeout(toastTimer);
    toastTimer = win().setTimeout(() => (toast.className = ""), 1800);
  }

  return { open, render, say };
}
