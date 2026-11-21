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

  test("Progress.03 kept under the key molecuzzle-v3", () => {
    const storage = memoryStorage();
    createProgressStore(storage).update(progress => markSolved(progress, "acetonitrile"));
    expect(STORAGE_KEY).toBe("molecuzzle-v3");
    expect(Object.keys(storage.data)).toEqual(["molecuzzle-v3"]);
  });

  test("Progress.03 what is stored under molecuzzle-v2, for the Puzzles with their hydrogens on the Grid, isn't read", () => {
    const storage = memoryStorage({ "molecuzzle-v2": '{"puzzles":{"water":"solved"},"current":"glycine","boards":{"glycine":{"bonds":[[0,1,1]],"revealed":false,"undo":[[]]}}}' });
    expect(load(storage)).toEqual({ puzzles: {}, current: null });
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

  test("Progress.03, Progress.05 load keeps the Boards of Puzzles in progress, and leaves out an entry that doesn't fit", () => {
    const kept = { bonds: [[0, 1, 1]], revealed: false, undo: [[]] };
    const boards = {
      "hydrogen-cyanide": kept,
      water: { bonds: [], revealed: false, undo: Array.from({ length: 101 }, () => []) },
      urea: { bonds: [[0, 1, 1]], revealed: "yes", undo: [] },
      methanol: { bonds: [[0, 1, 4]], revealed: false, undo: [] },
      glycine: { bonds: [[0, 1, 1]], revealed: false },
    };
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ puzzles: {}, current: "methanol", boards }) });
    expect(load(storage)).toEqual({ puzzles: {}, current: "methanol", boards: { "hydrogen-cyanide": kept } });
    expect(schemaErrors("progress.schema.json", load(storage))).toEqual([]);
  });

  test.each([
    ["a Bond of two numbers", { bonds: [[0, 1]], revealed: false, undo: [] }],
    ["a Bond of four numbers", { bonds: [[0, 1, 1, 1]], revealed: false, undo: [] }],
    ["a negative Atom", { bonds: [[-1, 1, 1]], revealed: false, undo: [] }],
    ["an Atom that isn't a whole number", { bonds: [[0.5, 1, 1]], revealed: false, undo: [] }],
    ["a Bond that isn't a list", { bonds: [5], revealed: false, undo: [] }],
    ["an undo Board that doesn't fit", { bonds: [], revealed: false, undo: [[[0, 1, 4]]] }],
    ["an undo that isn't a list", { bonds: [], revealed: false, undo: "x" }],
    ["an entry of null", null],
    ["an entry that is a list", []],
  ])("Progress.03 an entry with %s is left out, and the rest still loads", (_, entry) => {
    const stored = { puzzles: { water: "solved" }, current: "water", boards: { ammonia: entry } };
    expect(schemaErrors("progress.schema.json", stored)).not.toEqual([]);
    expect(load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(stored) }))).toEqual({ puzzles: { water: "solved" }, current: "water" });
  });

  test("Progress.03 puzzles that isn't an object is left out", () => {
    const stored = { puzzles: ["solved"], current: "water" };
    expect(schemaErrors("progress.schema.json", stored)).not.toEqual([]);
    expect(load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(stored) }))).toEqual({ puzzles: {}, current: "water" });
  });

  test("Progress.03 boards that don't fit, or have no entry left, are left out", () => {
    for (const boards of ["none", [], { water: { bonds: "x", revealed: false, undo: [] } }])
      expect(load(memoryStorage({ [STORAGE_KEY]: JSON.stringify({ puzzles: {}, current: "water", boards }) })))
        .toEqual({ puzzles: {}, current: "water" });
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
    expect(store.update(progress => ({ ...progress, current: "water" }))).toEqual({ puzzles: {}, current: "water" });
    expect(store.update(progress => markSolved(progress, "water"))).toEqual({ puzzles: { water: "solved" }, current: "water" });
    expect(load(undefined)).toEqual({ puzzles: {}, current: null });
    expect(() => createProgressStore(undefined).update(progress => progress)).not.toThrow();
  });
});
