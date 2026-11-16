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
      if (result.changed) update();
    },
    onOpen: open,
    onUndo() { if (game.undo()) update(); },
    onReset() { if (game.reset()) update(); },
    onSolve() { game.showSolution(); update(); },
  });

  function open(i) {
    index = i;
    game = createGame(puzzles[i]);
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
  return { get game() { return game; }, open };
}
