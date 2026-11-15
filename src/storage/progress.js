// Progress, kept in the browser. Works without storage: then nothing is kept.
export const STORAGE_KEY = "molecuzzle-v2";

/** @param {Storage | undefined} storage */
export function loadProgress(storage) {
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

export function saveProgress(storage, progress) {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* no storage: keep nothing */ }
}

/** Marks a puzzle solved; returns the same Progress if it already was. */
export function markSolved(progress, id) {
  if (progress.puzzles[id] === "solved") return progress;
  return { ...progress, puzzles: { ...progress.puzzles, [id]: "solved" } };
}
