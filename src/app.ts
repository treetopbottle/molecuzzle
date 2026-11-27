// Wires the Puzzles, the open game, Progress and the UI. No DOM:
// browser.ts makes the dependencies and passes them in.
import { markSolved, type Progress, type Store } from "./storage/api.ts";
import { difficulty, type CreateGame, type Game, type Puzzle } from "./puzzle/api.ts";
import type { createUi } from "./ui/ui.js";

type Handlers = Parameters<typeof createUi>[1];

/** What the Glue is given: the Puzzles, and each component's part. */
export interface AppDeps {
  puzzles: Puzzle[];
  createGame: CreateGame;
  store: Store;
  createUi: (handlers: Handlers) => ReturnType<typeof createUi>;
}

export function startApp({ puzzles, createGame, store, createUi }: AppDeps): void {
  let progress = store.load();
  let index = Math.max(0, puzzles.findIndex(p => p.id === progress.current));
  let game: Game;

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

  /** Progress with the open Puzzle's saved() in boards, or without its entry when that is null. */
  function withEntry(p: Progress): Progress {
    const id = puzzles[index].id, saved = game.saved();
    const { boards = {}, ...rest } = p;
    const { [id]: _, ...others } = boards;
    const next = saved ? { ...others, [id]: saved } : others;
    return Object.keys(next).length ? { ...rest, boards: next } : rest;
  }

  /** Keeps the open Puzzle as it is now, and shows it. */
  function keep() {
    progress = store.update(withEntry);
    update();
  }

  /** Opens a Puzzle where it was left, and saves its entry again as saved() gives it, so one createGame couldn't use is removed. */
  function open(i: number): void {
    index = i;
    game = createGame(puzzles[i], progress.boards?.[puzzles[i].id]);
    progress = store.update(p => withEntry({ ...p, current: puzzles[i].id }));
    ui.open(game);
    update();
  }

  function update() {
    const puzzle = puzzles[index], status = game.status();
    if (status.kind === "solved" && progress.puzzles[puzzle.id] !== "solved")
      progress = store.update(p => markSolved(p, puzzle.id));
    ui.render({
      puzzles, index, progress, status, counts: game.counts(), difficulty: difficulty(puzzle),
      done: game.done(), canUndo: game.canUndo, hasBonds: game.order.some(Boolean),
    });
  }

  open(index);
}
