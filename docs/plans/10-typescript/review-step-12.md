# Review of step 12 of plan 10

Commits reviewed: 969ddf9 (moves `generate-script.test.js` to `.ts` with `// @ts-nocheck`), 0d5ea1a (the tests commit: Generate.01, the README's New Puzzle line, the backlog, and the test running `scripts/generate.ts`, with its body typed), 2c2c0a9 (moves `scripts/generate.js` and `scripts/build.js` to `.ts`, every mention renamed) and 506b4e0 (types the scripts; `tsconfig.json` adds `scripts/` and drops `allowJs`/`checkJs`; `vitest.config.ts` runs only `*.test.ts`).

Checks, each in its own worktree with node_modules copied in, all since removed:
- **Before the step and at 969ddf9:** `npx tsc -p .` exits 0 and `npm test` passes 414 in 17 files.
- **At the tests commit, 0d5ea1a:** tsc exits 0. The only failures are the 7 tests of `generate-script.test.ts` (both Generate.01, all three Generate.02, both drawing tests), each with `MODULE_NOT_FOUND` for `scripts/generate.ts`, as the step expects.
- **At 2c2c0a9 and at 506b4e0:**
  - tsc exits 0.
  - `npm run build` writes 50.4 kB. It is byte-identical to the build from before the step except for the `index.html` comment that names `scripts/build.ts`.
  - `npm test` passes 414.
  - `npm run test:e2e` with `CHROMIUM_PATH=/usr/bin/chromium` passes 40.
  - `npm run test:screenshots` passes 10 in podman.
- **Node 22.18 (`node:22.18.0-slim` in podman), at 506b4e0:** both scripts run with no warning on stdout or stderr. That covers a layout, the usage message (exit 1), "can't read CH3-Xx" (exit 1), "no unique layout found" (exit 2), and the build. `npx vitest run` passes 414 and tsc exits 0 there too.
- **The generator's behavior, old against new:** `node scripts/generate.js` before the step and `node scripts/generate.ts` at 506b4e0 on 19 inputs: no arguments, an empty spec, a blank spec, a Bond it can't read, H, CH4, NaN/0/-1 tries, an extra argument, the Bonds that don't join into one Molecule (the backlog's TypeError, still a TypeError), Caffeine and a ring. With the file name normalised, stdout, stderr and the exit codes are identical, stack line and column numbers included.
- **The build's error:** with the placeholder missing from `index.html`, the build gives the same message and exit 1 before and after.
- **History:** git records the three renames at 99%, 98% and 93%, and `git log --follow` reaches each file's first commit (16, 5 and 13 commits).
- **Is a `.js` file noticed now?** Tried at 506b4e0 and reverted. `tsc` now checks `scripts/`: a deliberate type error in `build.ts` fails it. A `.js` file that a `.ts` file imports fails with TS7016. See finding 1 for the cases nothing notices.

## Findings

1. **should fix**, `docs/plans/10-typescript/README.md:82`, `vitest.config.ts:3`, and 506b4e0's message: "so a `.js` file can't come back unseen" is true only for a `.js` file that a `.ts` file imports, which fails tsc with TS7016. In every other case nothing notices:
   - `src/puzzle/extra.js`, imported by nothing: tsc exits 0 and doesn't list it.
   - `scripts/extra.js`: the same.
   - `tests/unit/extra.test.js` with `expect(1).toBe(2)`: `npm test` still passes 414. Vitest never runs the file, so the `*.test.ts`-only include makes a JavaScript test less visible than before: under `*.test.{js,ts}` it would at least have run, and failed.
   - `tests/e2e/extra.spec.js`: Playwright's desktop project still lists it, since it sets only `testIgnore`, so it would run without being checked.

   Fix with a check that fails on any `.js`/`.mjs`/`.cjs` under `src/`, `tests/` and `scripts/`. `tests/unit/imports.test.ts:13-17` already lists `src/`'s `.js` files and could assert there are none. Otherwise, narrow the claim to what tsc gives.
2. **note**, `docs/plans/10-typescript/README.md:44`: the Design's `ui/api.ts` bullet describes the code as it is in terms of `board.js` and `messages.js`, which step 11 renamed. This is the same kind of stale name as step 7's finding 4 and step 8's finding 1. Step 13's check of the docs should cover the Design, not only the README, the spec and the decisions. The other `.js` names left in the plan are in history: the step lines, `:58`, and `:32`'s example of an import.
3. **note**, `scripts/generate.ts:23`: `!(e instanceof Error) ||` changes one case. A thrown non-Error is now rethrown as it is, where before reading `e.message.startsWith` threw a TypeError that hid it. The case can't happen, as `findLayout` throws only `Error`s (`src/puzzle/generate.ts:46`, `:53`, `:74`), and the new behavior is the better one.
4. **note**, 2c2c0a9's `// @ts-nocheck` in `scripts/build.ts:1` and `scripts/generate.ts:1` does nothing: `tsconfig.json` doesn't include `scripts/` until 506b4e0, and nothing imports either script. It follows the Design's steps for a move and is harmless. Also, in 0d5ea1a the tests commit both removes the test's `@ts-nocheck` and types it (`run`'s `string[]`, and a throw where `match` gives null). The Design's "next commit" after the move here is the tests commit, and the typing is small.

Checked with no finding:
- Each commit's diff, against step 12's (a) and (b) lines and the Design's rules for a move.
- Generate.01's spec line and its test, and the README's New Puzzle line; the backlog's two items still hold.
- Every mention of the moved files: `package.json`, `scripts/screenshots.sh`, `tests/e2e/build.ts`, `docs/architecture.md`, the comments in `src/ui/index.html` and in `src/puzzle/generate.ts`, `puzzles.ts` and `removed.ts`, and the script's top comment and usage message.
- No `.js` file of `src/`, `tests/` or `scripts/` is named in the README, `architecture.md`, the spec, the decisions, the backlog, the code or CI. What is left is in the past plans, the reviews, `prototypes/`, and `imports.test.ts`'s fixtures, which are strings.
- No `.js` file is left in `src/`, `tests/` or `scripts/`.
- No `@ts-nocheck`, `@ts-ignore`, `any`, cast or `!` is left in the scripts.
- tsc's options match the Design, with `checkJs` dropped along with `allowJs`.
- CI's `npm run build` runs `scripts/build.ts` on the latest Node 22.
- Decision 0029 still describes the code.
- The commit messages.

## Outcome

1. Fixed in 1093630: `tests/unit/typescript.test.ts` fails on any `.js`, `.mjs` or `.cjs` file in `src/`, `tests/` or `scripts/`; step 12's line and decision 0029 say so.
2. Fixed in 1093630: the Design's `ui/api.ts` bullet names `board.ts` and `messages.ts`; step 13 checks the Design too.
3. Kept: `findLayout` throws only `Error`s, and rethrowing anything else is the better behavior.
4. Kept: the move follows the Design's steps, and the test's typing is small.
