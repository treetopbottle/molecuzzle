// scripts/generate.js, run as the developer runs it.
import { expect, test } from "vitest";
import { spawnSync } from "node:child_process";

test("Generate.02 the script says when no unique layout is found", () => {
  const run = spawnSync(process.execPath, ["scripts/generate.js", "H1-O1 O1-H2", "100", "1", "1"], { encoding: "utf8" });
  expect(run.stderr.trim()).toBe("no unique layout found");
  expect(run.status).not.toBe(0);
});
