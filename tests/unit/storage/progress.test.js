import { describe, expect, test } from "vitest";
import { loadProgress, saveProgress, markSolved, STORAGE_KEY } from "../../../src/storage/progress.js";
import { schemaErrors } from "../../helpers/schemas.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); } };
}

describe("Progress", () => {
  test("Progress.01, Progress.03 saved in the format of the schema, and read back", () => {
    const storage = memoryStorage();
    let progress = loadProgress(storage);
    progress = markSolved(progress, "water");
    saveProgress(storage, { ...progress, current: "formaldehyde" });
    expect(JSON.parse(storage.data[STORAGE_KEY])).toMatchInlineSnapshot(`
      {
        "current": "formaldehyde",
        "puzzles": {
          "water": "solved",
        },
      }
    `);
    expect(schemaErrors("progress.schema.json", JSON.parse(storage.data[STORAGE_KEY]))).toEqual([]);
    expect(loadProgress(storage)).toEqual({ puzzles: { water: "solved" }, current: "formaldehyde" });
  });

  test("Progress.03 wrong data is left out, and the rest still loads", () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{"puzzles":{"water":"solved","urea":"seen"},"current":7}' });
    expect(loadProgress(storage)).toEqual({ puzzles: { water: "solved" }, current: null });
  });

  test("Progress.03 unreadable or unknown values count as empty", () => {
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: "{not json" }))).toEqual({ puzzles: {}, current: null });
    expect(loadProgress(memoryStorage({ [STORAGE_KEY]: '{"puzzles":{"water":"maybe","ammonia":"revealed"},"current":3}' })))
      .toEqual({ puzzles: {}, current: null });
  });

  test("Progress.02 without storage, or when it throws, nothing is kept and nothing fails", () => {
    const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
    expect(loadProgress(broken)).toEqual({ puzzles: {}, current: null });
    expect(() => saveProgress(broken, { puzzles: {}, current: "water" })).not.toThrow();
    expect(loadProgress(undefined)).toEqual({ puzzles: {}, current: null });
  });
});
