// The imports in src/ keep decision 0028: a component names only files in its
// own folder, and the Glue only app.ts and the components' api.ts. Every file
// named must exist, as a JSDoc type from a path that doesn't becomes any.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const SRC = fileURLToPath(new URL("../../src/", import.meta.url));
const GLUE = ["app.ts", "browser.ts"];
const FOR_THE_GLUE = ["app.ts", "puzzle/api.ts", "storage/api.ts", "ui/api.ts"];

// The .js and .ts files of src/, as paths from it.
const files = readdirSync(SRC, { recursive: true })
  .map(f => f.split("\\").join("/"))
  .filter(f => /\.(js|ts)$/.test(f))
  .sort();

// import … from, export … from and a JSDoc @import … from; import(…); import "…".
const SPECIFIERS = /\b(?:import|export)\b[^"'`;]*?\bfrom\s*["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']\s*\)|\bimport\s+["']([^"']+)["']/g;

/** The files a file names by relative path, as paths from src/. */
function named(file) {
  const text = readFileSync(join(SRC, file), "utf8");
  return [...text.matchAll(SPECIFIERS)]
    .map(m => m[1] ?? m[2] ?? m[3])
    .filter(path => path.startsWith("."))
    .map(path => normalize(join(dirname(file), path)).split("\\").join("/"));
}

const edges = files.flatMap(file => named(file).map(to => ({ from: file, to })));
const show = ({ from, to }) => `${from} → ${to}`;

test("it finds each kind of import: a value, a type, a re-export and a JSDoc @import", () => {
  expect(named("app.ts")).toEqual(["storage/api.ts", "puzzle/api.ts", "ui/api.ts"]);
  expect(named("storage/api.ts")).toEqual(["storage/progress.js"]);
  expect(named("storage/progress.js")).toEqual(["storage/api.ts"]);
});

test("every file a file in src/ names exists", () => {
  expect(edges.filter(({ to }) => !existsSync(join(SRC, to))).map(show)).toEqual([]);
});

test("a component's files name only files in its own folder", () => {
  const inComponents = edges.filter(({ from }) => !GLUE.includes(from));
  expect(inComponents.length).toBeGreaterThan(0);
  expect(inComponents.filter(({ from, to }) => dirname(from) === "." || dirname(to) !== dirname(from)).map(show)).toEqual([]);
});

test("the Glue names only app.ts and the components' api.ts", () => {
  const glue = edges.filter(({ from }) => GLUE.includes(from));
  expect(glue.length).toBeGreaterThan(0);
  expect(glue.filter(({ to }) => !FOR_THE_GLUE.includes(to)).map(show)).toEqual([]);
});
