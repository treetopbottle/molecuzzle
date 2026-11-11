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
      if (state === "solved" || state === "revealed") puzzles[id] = state;
    return { puzzles, current: typeof data.current === "string" ? data.current : null };
  } catch {
    return empty;
  }
}

export function saveProgress(storage, progress) {
  try { storage?.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* no storage: keep nothing */ }
}

/** Marks a puzzle solved, or revealed unless it was solved already. */
export function mark(progress, id, state) {
  if (state === "revealed" && progress.puzzles[id] === "solved") return progress;
  return { ...progress, puzzles: { ...progress.puzzles, [id]: state } };
}
