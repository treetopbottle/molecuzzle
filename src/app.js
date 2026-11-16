// The Glue: wires the Puzzles, the open game, Progress and the UI. No DOM:
// browser.js makes the dependencies and passes them in.
import { markSolved } from "./storage/progress.js";

/**
 * @param {{ puzzles: object[], createGame: Function,
 *   store: { load(): object, update(change: Function): object },
 *   createUi: (handlers: object) => { open(game): void, render(view): void, say(result): void } }} deps
 */
export function startApp({ puzzles, createGame, store, createUi }) {
  let progress = store.load();
  let index = Math.max(0, puzzles.findIndex(p => p.id === progress.current));
  let game;

  const ui = createUi({
    onChange(k, dir) {
      const result = game.change(k, dir);
      ui.say(result);
      if (result.changed) keep();
    },
    onOpen: open,
    onUndo() { if (game.undo()) keep(); },
    onReset() { if (game.reset()) keep(); },
    onSolve() { game.showSolution(); keep(); },
  });

  /** Keeps the open Puzzle's saved(), or its entry removed when it isn't in progress, and shows it. */
  function keep() {
    const id = puzzles[index].id, saved = game.saved();
    progress = store.update(p => {
      const { boards = {}, ...rest } = p;
      const { [id]: _, ...others } = boards;
      const next = saved ? { ...others, [id]: saved } : others;
      return Object.keys(next).length ? { ...rest, boards: next } : rest;
    });
    update();
  }

  function open(i) {
    index = i;
    game = createGame(puzzles[i], progress.boards?.[puzzles[i].id]);
    progress = store.update(p => ({ ...p, current: puzzles[i].id }));
    ui.open(game);
    update();
  }

  function update() {
    const puzzle = puzzles[index], status = game.status();
    if (status.kind === "solved" && progress.puzzles[puzzle.id] !== "solved")
      progress = store.update(p => markSolved(p, puzzle.id));
    ui.render({
      puzzles, index, progress, status,
      done: game.done(), canUndo: game.canUndo, hasBonds: game.order.some(Boolean),
    });
  }

  open(index);
}
