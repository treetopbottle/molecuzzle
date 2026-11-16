// Progress, kept in the browser. Works without storage: then nothing is kept.
export const STORAGE_KEY = "molecuzzle-v2";

/** What is stored, checked by hand: a field that doesn't fit is left out. */
function read(storage) {
  const empty = { puzzles: {}, current: null };
  try {
    const data = JSON.parse(storage?.getItem(STORAGE_KEY) ?? "null");
    if (!data || typeof data !== "object") return empty;
    const puzzles = {};
    for (const [id, state] of Object.entries(data.puzzles ?? {}))
      if (state === "solved") puzzles[id] = state;
    return { puzzles, current: typeof data.current === "string" ? data.current : null };
  } catch {
    return empty;
  }
}

/**
 * The Progress in this storage (localStorage, or undefined for none).
 * load() reads it; update(change) saves change(progress) and returns it.
 * @param {Storage | undefined} storage
 */
export function createProgressStore(storage) {
  let progress;
  function load() {
    progress = read(storage);
    return progress;
  }
  function update(change) {
    progress = change(progress ?? load());
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* no storage: keep nothing */ }
    return progress;
  }
  return { load, update };
}

/** Marks a puzzle solved; returns the same Progress if it already was. */
export function markSolved(progress, id) {
  if (progress.puzzles[id] === "solved") return progress;
  return { ...progress, puzzles: { ...progress.puzzles, [id]: "solved" } };
}
