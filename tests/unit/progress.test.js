import { describe, expect, test } from "vitest";
import { loadProgress, saveProgress, mark, STORAGE_KEY } from "../../src/progress.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); } };
}

describe("Progress", () => {
  test("Progress.01 saved in the format of the schema, and read back", () => {
    const storage = memoryStorage();
    let progress = loadProgress(storage);
    progress = mark(progress, "water", "solved");
    progress = mark(progress, "ammonia", "revealed");
    saveProgress(storage, { ...progress, current: "formaldehyde" });
    expect(JSON.parse(storage.data[STORAGE_KEY])).toMatchInlineSnapshot(`
      {
        "current": "formaldehyde",
        "puzzles": {
          "ammonia": "revealed",
          "water": "solved",
        },
      }
    `);
    expect(loadProgress(storage)).toEqual({ puzzles: { water: "solved", ammonia: "revealed" }, current: "formaldehyde" });
  });

  test("Progress.01 seeing the solution of a solved puzzle keeps it solved", () => {
    const progress = mark({ puzzles: { water: "solved" }, current: null }, "water", "revealed");
    expect(progress.puzzles.water).toBe("solved");
  });

  test("Progress.01 unreadable or unknown values count as empty", () => {
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: "{not json" }))).toEqual({ puzzles: {}, current: null });
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: '{"puzzles":{"water":"maybe"},"current":3}' })))
      .toEqual({ puzzles: {}, current: null });
  });

  test("Progress.02 without storage, or when it throws, nothing is kept and nothing fails", () => {
    const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
    expect(loadProgress(broken)).toEqual({ puzzles: {}, current: null });
    expect(() => saveProgress(broken, { puzzles: {}, current: "water" })).not.toThrow();
    expect(loadProgress(undefined)).toEqual({ puzzles: {}, current: null });
  });
});
