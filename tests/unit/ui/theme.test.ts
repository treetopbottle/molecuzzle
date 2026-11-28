// @vitest-environment happy-dom
// The theme is the one place for the look: style.css names only its
// variables, each of them, and has no colours of its own.
import { expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyTheme, DARK, THEME } from "../../../src/ui/theme.ts";

const css = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "../../../src/ui/style.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const used = new Set([...css.matchAll(/var\(--([\w-]+)\)/g)].map(m => m[1]));
const names = Object.keys(THEME.page);

test("style.css uses each variable of the theme, and no other", () => {
  expect([...used].sort()).toEqual([...names].sort());
});

test("style.css has no colours or fonts of its own", () => {
  expect(css.match(/#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(|(?<![\w-])(?:white|black)(?![\w-])|font-family|sans-serif/gi)).toBeNull();
});

test("applyTheme sets each variable on the root, and the game uses the dark theme", () => {
  applyTheme(document.documentElement);
  for (const name of names)
    expect(document.documentElement.style.getPropertyValue(`--${name}`)).toBe(THEME.page[name as keyof typeof THEME.page]);
  expect(THEME).toBe(DARK);
});
