# Review of step 5 of plan 10

Commits reviewed: 7a1fbd7 (`tests/unit/imports.test.js`, and the plan's line on it) and 3f33f74 (`docs/architecture.md`, `README.md`). The step has no rule ids, so there is no tests commit to check failing.

Checks at 3f33f74, in a worktree: `npx tsc -p .`, `npm run build` (49.9 kB), `npm test` (17 files, 412 tests) and `npx playwright test` (40) pass.

Probes of the import test, files added to `src/ui/` in the worktree naming a path in `src/puzzle/`:

- Caught: a multi-line `import { a, b } from`, `export * from`, a multi-line JSDoc `@import { … } from`, JSDoc `@type {import("…").Game}`, `import "…"`, `import … with { type: "json" }`, and an import after another statement on the same line; and a JSDoc `@import` from a missing `./apix.ts` in the same folder, by the existence test.
- Missed: a multi-line import with a comment inside its braces holding an apostrophe or a semicolon; `import(` with a template literal; `import(/* c */ "…")`; `import { "a-b" as ab } from`; `/// <reference path>`.
- Reported though it isn't one: an import written inside a template string; strict, so harmless.

## Findings

1. **should fix**, `tests/unit/imports.test.js:20`: in a multi-line import, a comment holding an apostrophe, a quote or a semicolon hides the whole import: the first branch's `[^"'`;]*?` stops there. `import {\n  createGame, // the Puzzle's game\n} from "../puzzle/p1.js";` in `src/ui/` was not reported, nor the missing file it names, and the same in a Glue file naming `./puzzle/game.js` passed. The comments use possessives all the time, and neither tsc nor esbuild checks 0028.
2. **should fix**, `docs/architecture.md:23-40`: the UI's diagram has `api --> uijs` but no arrow from `api` to `looks`, though `src/ui/api.ts:3` imports `./elements.js` for `LookSymbol`; "an arrow is an import", and the Puzzle's diagram draws each of its `api.ts`'s imports.
3. **note**, `tests/unit/imports.test.js:34-38`: "it finds each kind of import" checks only the kinds `src/` has today; nothing shows `import(…)` or a multi-line import is found, though the Design lists both. Checking the matching on fixed strings, one per kind, would keep it covered, and cover finding 1.
4. **note**, `tests/unit/imports.test.js:20`: `import(` is matched only with a quoted string right after the parenthesis, not a template literal or a comment first. Triple-slash references and string-named bindings are missed too; the Design lists neither.
5. **note**, `docs/architecture.md:11`: the Glue's paragraph lists `app.ts`'s checks, not `browser.ts`'s that the key's symbols fit `KeyElement`.
6. **note**, `docs/architecture.md:5`: "The Glue imports only the `api.ts` files" leaves out `browser.ts` importing `app.ts`.
7. **note**, `tests/unit/imports.test.js:45-46`: a component's file may name only files in exactly its own directory, so a subfolder of a component would be rejected. None has one, and the Design says "that folder".

Checked with no finding: the files the test reads and its Glue rules match the Design; paths are normalized, and one leaving `src/` is rejected; `architecture.md`'s lines for each `api.ts`, `AppDeps` and its checks match the code, `LookSymbol` included; the UI's other edges and the Puzzle's diagram match the code; the README's line and its link; the plan's Design line; the commit messages.

## Outcome

1. Fixed in 4acbd07: the bindings are matched as a type, braces, a namespace or a default, so a comment in the braces can hold anything but `}`; a fixed text with such an import is found.
2. Fixed in 4acbd07.
3. Fixed in 4acbd07: a test of each kind on fixed text, the multi-line one and `import(…)` included.
4. Fixed in 4acbd07 for `import(…)` with a comment or a template literal, and string-named bindings; triple-slash references are kept out, as the code has none and the Design lists none.
5. Fixed in 4acbd07.
6. Fixed in 4acbd07.
7. Kept: no component has a subfolder, and the Design says "that folder".
