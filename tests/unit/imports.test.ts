// @ts-nocheck
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

// What an import or export binds: a type, braces (which may hold comments), a namespace or a default.
const BINDINGS = String.raw`(?:type\s+)?(?:\{[^}]*\}|\*(?:\s+as\s+[\w$]+)?|[\w$]+(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+[\w$]+))?)`;
const QUOTED = String.raw`["'\`]([^"'\`]+)["'\`]`;
const KINDS = [
  new RegExp(String.raw`\b(?:import|export)\b\s*${BINDINGS}\s*from\s*${QUOTED}`, "g"), // and a JSDoc @import
  new RegExp(String.raw`\bimport\b\s*\(\s*(?:/\*[\s\S]*?\*/\s*)*${QUOTED}`, "g"), // import(…), also in a JSDoc type
  new RegExp(String.raw`\bimport\b\s*${QUOTED}`, "g"), // import "…"
];

/** The paths a text imports from, in order. */
function specifiers(text) {
  return KINDS.flatMap(kind => [...text.matchAll(kind)])
    .sort((m, n) => m.index - n.index)
    .map(m => m[1]);
}

/** The files a file names by relative path, as paths from src/. */
function named(file) {
  return specifiers(readFileSync(join(SRC, file), "utf8"))
    .filter(path => path.startsWith("."))
    .map(path => normalize(join(dirname(file), path)).split("\\").join("/"));
}

const edges = files.flatMap(file => named(file).map(to => ({ from: file, to })));
const show = ({ from, to }) => `${from} → ${to}`;

test("it finds each kind of import, also over lines and with comments between", () => {
  const text = [
    'import { a } from "./value.js";',
    'import type { T } from "./type.ts";',
    'import D, { b } from "./default.js";',
    'import * as all from "./namespace.js";',
    'export { c } from "./re-export.js";',
    'export * from "./star.js";',
    'import {\n  d, // the Puzzle\'s; "quoted"\n  e,\n} from "./lines.js";',
    '/** @import { F, G } from "./jsdoc.ts" */',
    '/** @param {import("./jsdoc-type.ts").H} h */',
    'const later = () => import(/* why */ `./dynamic.js`);',
    'import "./bare.js";',
    'import { "a-b" as ab } from "./string-named.js";',
  ].join("\n");
  expect(specifiers(text)).toEqual([
    "./value.js", "./type.ts", "./default.js", "./namespace.js", "./re-export.js", "./star.js", "./lines.js",
    "./jsdoc.ts", "./jsdoc-type.ts", "./dynamic.js", "./bare.js", "./string-named.js",
  ]);
});

test("it finds the imports of the files in src/: a value, a type, a re-export and a JSDoc @import", () => {
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
