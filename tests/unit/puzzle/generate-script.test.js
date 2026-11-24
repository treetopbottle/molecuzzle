// scripts/generate.js, run as the developer runs it.
import { expect, test } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../../../scripts/generate.js", import.meta.url));
const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: "utf8" });

test("Generate.01 the script prints the layout of Acetonitrile, its Atoms with their hydrogens", () => {
  const { stdout, status } = run("CH3-C C#N", "2000", "3", "3", "1");
  expect(status).toBe(0);
  expect(stdout).toContain("rows: 1, cols: 3,");
  expect(stdout).toContain('atoms: [["N",0,0,0],["C",0,1,0],["C",0,2,3]],');
  expect(stdout).toContain("solution: [[0,1,3],[1,2,1]],");
  expect(stdout).toContain("rows: 1, cols: 3, // difficulty 2: 2 Dotted lines, 0 loops");
});

test("the script draws the layout with the Atoms' labels, every point as wide as the longest", () => {
  const { stdout, status } = run("CH3-C C=O C-OH", "2000", "3", "3", "1");
  expect(status).toBe(0);
  expect(stdout).toContain('atoms: [["O",0,1,0],["O",1,0,1],["C",1,1,0],["C",1,2,3]],');
  expect(stdout.split("\n").slice(0, 2)).toEqual([
    "  // ·   O   ·",
    "  // OH  C   CH₃",
  ]);
});

test("the script draws a layout with only one-letter labels, every point one character wide", () => {
  const { stdout, status } = run("O:a=O:b", "200", "3", "3", "1");
  expect(status).toBe(0);
  expect(stdout).toContain('atoms: [["O",0,0,0],["O",0,1,0]],');
  expect(stdout.split("\n").slice(0, 1)).toEqual([
    "  // O O",
  ]);
});

test("Generate.01 with no size given, the script looks for a Grid of at most 6 by 5", () => {
  const { stdout, status } = run("N:1-C:2 C:2=O:2 C:2-N:3 N:3-C:4 C:4=C:5 C:5-C:6 C:6=O:6 C:6-N:1 C:4-N:9 N:9=CH:8 CH:8-N:7 N:7-C:5 N:1-CH3:a N:3-CH3:b N:7-CH3:c");
  expect(status).toBe(0);
  const [, rows, cols] = stdout.match(/rows: (\d+), cols: (\d+)/).map(Number);
  expect(rows).toBeLessThanOrEqual(6);
  expect(cols).toBeLessThanOrEqual(5);
  expect([rows, cols]).toEqual([6, 5]); // Caffeine's layout uses the 6th row
});

test("Generate.02 the script stops at a Bond it can't read", () => {
  const { stderr, status } = run("CH3-C C~N");
  expect(stderr.trim()).toBe("can't read C~N");
  expect(status).not.toBe(0);
});

test("Generate.02 the script stops at a Bond with an Element the game doesn't have", () => {
  const { stderr, status } = run("CH3-Xx");
  expect(stderr.trim()).toBe("can't read CH3-Xx");
  expect(status).not.toBe(0);
});

test("Generate.02 the script says when no unique layout is found", () => {
  const { stderr, status } = run("CH3-C C#N", "100", "1", "1");
  expect(stderr.trim()).toBe("no unique layout found");
  expect(status).not.toBe(0);
});
