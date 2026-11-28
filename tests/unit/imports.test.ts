// The imports in src/ keep decision 0028: a component names only files in its
// own folder, and the Glue only app.ts and the components' api.ts. Every file
// named must exist.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const SRC = fileURLToPath(new URL("../../src/", import.meta.url));
const GLUE = ["app.ts", "browser.ts"];
const FOR_THE_GLUE = ["app.ts", "puzzle/api.ts", "storage/api.ts", "ui/api.ts"];

// The .js and .ts files of src/, as paths from it.
const files = readdirSync(SRC, { recursive: true, encoding: "utf8" })
  .map(f => f.split("\\").join("/"))
  .filter(f => /\.(js|ts)$/.test(f))
  .sort();

// What an import or export binds: a type, braces (which may hold comments), a namespace or a default.
const BINDINGS = String.raw`(?:type\s+)?(?:\{[^}]*\}|\*(?:\s+as\s+[\w$]+)?|[\w$]+(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+[\w$]+))?)`;
const QUOTED = String.raw`["'\`]([^"'\`]+)["'\`]`;
const KINDS = [
  new RegExp(String.raw`\b(?:import|export)\b\s*${BINDINGS}\s*from\s*${QUOTED}`, "g"),
  new RegExp(String.raw`\bimport\b\s*\(\s*(?:/\*[\s\S]*?\*/\s*)*${QUOTED}`, "g"), // import(…)
  new RegExp(String.raw`\bimport\b\s*${QUOTED}`, "g"), // import "…"
];

/** The paths a text imports from, in order. */
function specifiers(text: string): string[] {
  return KINDS.flatMap(kind => [...text.matchAll(kind)])
    .sort((m, n) => m.index - n.index)
    .map(m => m[1]);
}

/** The files a file names by relative path, as paths from src/. */
function named(file: string): string[] {
  return specifiers(readFileSync(join(SRC, file), "utf8"))
    .filter(path => path.startsWith("."))
    .map(path => normalize(join(dirname(file), path)).split("\\").join("/"));
}

const edges = files.flatMap(file => named(file).map(to => ({ from: file, to })));
const show = ({ from, to }: { from: string; to: string }): string => `${from} → ${to}`;

test("it finds each kind of import, also over lines and with comments between", () => {
  const text = [
    'import { a } from "./value.js";',
    'import type { T } from "./type.ts";',
    'import D, { b } from "./default.js";',
    'import * as all from "./namespace.js";',
    'export { c } from "./re-export.js";',
    'export * from "./star.js";',
    'import {\n  d, // the Puzzle\'s; "quoted"\n  e,\n} from "./lines.js";',
    'const later = () => import(/* why */ `./dynamic.js`);',
    'import "./bare.js";',
    'import { "a-b" as ab } from "./string-named.js";',
  ].join("\n");
  expect(specifiers(text)).toEqual([
    "./value.js", "./type.ts", "./default.js", "./namespace.js", "./re-export.js", "./star.js", "./lines.js",
    "./dynamic.js", "./bare.js", "./string-named.js",
  ]);
});

test("it finds the imports of the files in src/: a value, a type and a re-export", () => {
  expect(named("app.ts")).toEqual(["storage/api.ts", "puzzle/api.ts", "ui/api.ts"]);
  expect(named("storage/api.ts")).toEqual(["storage/progress.ts"]);
  expect(named("storage/progress.ts")).toEqual(["storage/api.ts"]);
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
