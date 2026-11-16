import { describe, expect, test } from "vitest";
import { createProgressStore, markSolved, STORAGE_KEY } from "../../../src/storage/progress.js";
import { schemaErrors } from "../../helpers/schemas.js";

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = String(v); } };
}
const load = storage => createProgressStore(storage).load();

describe("Progress", () => {
  test("Progress.01, Progress.03 saved in the format of the schema, and read back", () => {
    const storage = memoryStorage();
    const store = createProgressStore(storage);
    expect(store.load()).toEqual({ puzzles: {}, current: null });
    store.update(progress => markSolved(progress, "water"));
    store.update(progress => ({ ...progress, current: "formaldehyde" }));
    expect(JSON.parse(storage.data[STORAGE_KEY])).toMatchInlineSnapshot(`
      {
        "current": "formaldehyde",
        "puzzles": {
          "water": "solved",
        },
      }
    `);
    expect(schemaErrors("progress.schema.json", JSON.parse(storage.data[STORAGE_KEY]))).toEqual([]);
    expect(load(storage)).toEqual({ puzzles: { water: "solved" }, current: "formaldehyde" });
  });

  test("Progress.01 a Puzzle marked solved stays solved", () => {
    const progress = markSolved({ puzzles: {}, current: "water" }, "water");
    expect(progress).toEqual({ puzzles: { water: "solved" }, current: "water" });
    expect(markSolved(progress, "water")).toBe(progress);
  });

  test("Progress.03 wrong data is left out, and the rest still loads", () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{"puzzles":{"water":"solved","urea":"seen"},"current":7}' });
    expect(load(storage)).toEqual({ puzzles: { water: "solved" }, current: null });
  });

  test("Progress.03 unreadable or unknown values count as empty", () => {
    expect(load(memoryStorage({ [STORAGE_KEY]: "{not json" }))).toEqual({ puzzles: {}, current: null });
    expect(load(memoryStorage({ [STORAGE_KEY]: '{"puzzles":{"water":"maybe","ammonia":"revealed"},"current":3}' })))
      .toEqual({ puzzles: {}, current: null });
  });

  test("Progress.02 without storage, or when it throws, nothing is kept and nothing fails", () => {
    const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
    const store = createProgressStore(broken);
    expect(store.load()).toEqual({ puzzles: {}, current: null });
    expect(() => store.update(progress => ({ ...progress, current: "water" }))).not.toThrow();
    expect(load(undefined)).toEqual({ puzzles: {}, current: null });
    expect(() => createProgressStore(undefined).update(progress => progress)).not.toThrow();
  });
});
