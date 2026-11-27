// @ts-nocheck
import { execFileSync } from "node:child_process";

// The end-to-end tests run against dist/index.html, so build it first.
export default function () {
  execFileSync(process.execPath, ["scripts/build.js"], { stdio: "inherit" });
}
