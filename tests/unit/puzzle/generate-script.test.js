// scripts/generate.js, run as the developer runs it.
import { expect, test } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../../../scripts/generate.js", import.meta.url));
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

test("Generate.01 the script prints the layout of water", () => {
  const { stdout, status } = run("H1-O1 O1-H2", "2000", "3", "3", "1");
  expect(status).toBe(0);
  expect(stdout).toContain("rows: 3, cols: 1,");
  expect(stdout).toContain('atoms: [["H",0,0],["O",1,0],["H",2,0]],');
  expect(stdout).toContain("solution: [[0,1,1],[1,2,1]],");
});

test("the script draws a layout with only one-letter symbols, every point one character wide", () => {
  const { stdout } = run("C1-H1 C1-H2 C1-H3 C1-O1 O1-H4", "200", "3", "3", "1");
  expect(stdout).toContain('atoms: [["H",0,0],["H",0,1],["O",1,0],["C",1,1],["H",1,2],["H",2,1]],');
  expect(stdout.split("\n").slice(0, 3)).toEqual([
    "  // H H ·",
    "  // O C H",
    "  // · H ·",
  ]);
});

test("the script draws the layout, every point two characters wide with a two-letter symbol", () => {
  const { stdout, status } = run("C1-H1 C1-H2 C1-H3 C1-Cl1", "200", "3", "3", "1");
  expect(status).toBe(0);
  expect(stdout).toContain('atoms: [["H",0,1],["H",1,0],["C",1,1],["H",1,2],["Cl",2,1]],');
  expect(stdout.split("\n").slice(0, 3)).toEqual([
    "  // ·  H  ·",
    "  // H  C  H",
    "  // ·  Cl ·",
  ]);
});

test("Generate.02 the script stops at a Bond it can't read", () => {
  const { stderr, status } = run("H1-O1 O1~H2");
  expect(stderr.trim()).toBe("can't read O1~H2");
  expect(status).not.toBe(0);
});

test("Generate.02 the script stops at a Bond with an Element the game doesn't have", () => {
  const { stderr, status } = run("H1-Xx1");
  expect(stderr.trim()).toBe("can't read H1-Xx1");
  expect(status).not.toBe(0);
});

test("Generate.02 the script says when no unique layout is found", () => {
  const { stderr, status } = run("H1-O1 O1-H2", "100", "1", "1");
  expect(stderr.trim()).toBe("no unique layout found");
  expect(status).not.toBe(0);
});
