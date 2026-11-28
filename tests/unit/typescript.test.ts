// The code, the tests and the scripts are TypeScript (decision 0029): tsc
// sees a .js file only through a .ts file that imports it, and Vitest runs
// only .test.ts files, so a .js file anywhere else would go unchecked.
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

test("there is no JavaScript file in src/, tests/ or scripts/", () => {
  const javascript = ["src", "tests", "scripts"].flatMap(dir =>
    readdirSync(ROOT + dir, { recursive: true, encoding: "utf8" })
      .filter(f => /\.[cm]?js$/.test(f))
      .map(f => `${dir}/${f.split("\\").join("/")}`));
  expect(javascript).toEqual([]);
});
