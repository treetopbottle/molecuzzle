// Progress, kept in the browser. Works without storage: then nothing is kept.
import type { BoardEntry, Bond, KeyValueStorage, Progress, Store } from "./api.ts";

export const STORAGE_KEY = "molecuzzle-v4";

const UNDO_MAX = 100;
const isObject = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const isIndex = (x: unknown): x is number => typeof x === "number" && Number.isInteger(x) && x >= 0;
const isBoard = (b: unknown): b is Bond[] => Array.isArray(b) &&
  b.every(bond => Array.isArray(bond) && bond.length === 3 && isIndex(bond[0]) && isIndex(bond[1]) && [1, 2, 3].includes(bond[2]));
/** An entry of boards, as the schema says: all three fields, of the right kinds. */
const isEntry = (e: unknown): e is BoardEntry => isObject(e) && isBoard(e.bonds) && typeof e.revealed === "boolean" &&
  Array.isArray(e.undo) && e.undo.length <= UNDO_MAX && e.undo.every(isBoard);

/**
 * What is stored, checked by hand as progress.schema.json says: a field, or a
 * Puzzle's entry, that doesn't fit is left out, and so are boards with no
 * entry left.
 */
function read(storage: KeyValueStorage | undefined): Progress {
  const empty: Progress = { puzzles: {}, current: null };
  try {
    const data: unknown = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    if (!isObject(data)) return empty;
    const puzzles: Progress["puzzles"] = {};
    for (const [id, state] of Object.entries(isObject(data.puzzles) ? data.puzzles : {}))
      if (state === "solved") puzzles[id] = state;
    const progress: Progress = { puzzles, current: typeof data.current === "string" ? data.current : null };
    const boards = Object.fromEntries(Object.entries(isObject(data.boards) ? data.boards : {})
      .filter((entry): entry is [string, BoardEntry] => isEntry(entry[1])));
    if (Object.keys(boards).length) progress.boards = boards;
    return progress;
  } catch {
    return empty;
  }
}

/**
 * The Progress in this storage (localStorage, or undefined for none).
 * load() reads it; update(change) saves change(progress) and returns it.
 */
export function createProgressStore(storage: KeyValueStorage | undefined): Store {
  let progress: Progress | undefined;
  function load() {
    progress = read(storage);
    return progress;
  }
  function update(change: (p: Progress) => Progress) {
    progress = change(progress ?? load());
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* no storage: keep nothing */ }
    return progress;
  }
  return { load, update };
}

/** Marks a puzzle solved; returns the same Progress if it already was. */
export function markSolved(progress: Progress, id: string): Progress {
  if (progress.puzzles[id] === "solved") return progress;
  return { ...progress, puzzles: { ...progress.puzzles, [id]: "solved" } };
}
