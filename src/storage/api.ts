// Storage's interface: what it offers the Glue, and what it needs, the
// browser's storage, in its own terms (decision 0028).

/** A Bond on a Board: the indexes of its two Atoms, and its order. */
export type Bond = [number, number, 1 | 2 | 3];

/** A Puzzle's entry in boards: its Board, whether its solution was shown, and the Boards to undo, oldest first. */
export interface BoardEntry {
  bonds: Bond[];
  revealed: boolean;
  undo: Bond[][];
}

/** Which Puzzles are solved, by id; the open Puzzle; and the Boards of Puzzles in progress or solved. */
export interface Progress {
  puzzles: Record<string, "solved">;
  current: string | null;
  boards?: Record<string, BoardEntry>;
}

/** The Progress in a storage: load() reads it, update(change) saves change(progress) and returns it. */
export interface Store {
  load(): Progress;
  update(change: (p: Progress) => Progress): Progress;
}

/** What Storage needs to keep Progress in, which localStorage fits. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export { createProgressStore, markSolved } from "./progress.js";
