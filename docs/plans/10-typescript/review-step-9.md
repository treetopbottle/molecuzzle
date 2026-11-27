# Review of step 9 of plan 10

Commits reviewed: 1fe9ec4 (Node 22.18 as the minimum, 0029's cost, and the plan's rule that a move gives its exports their types), 26d6c0c (the move, with `// @ts-nocheck` and the exported signatures' types) and 5451e52 (the typing, and `tests/helpers/puzzles.ts`). The step has no rule ids, so there is no tests commit to check failing.

Checks, in worktrees: at 5451e52 and at 26d6c0c, `npx tsc -p .` exits 0, `npm run build` writes 49.9 kB, `npm test` passes 413 in 17 files, and Playwright passes 40. Node 22.18.0, in podman, at both commits: `node scripts/generate.js "CH3-C C#N" 2000 3 3 1` exits 0 with nothing on stderr, and Vitest passes 413 with no warning. Node 22.17 wasn't tried, so "the first" rests on Node's release notes.

Behaviour: the old `game.js` and the new `game.ts`, side by side 40,000 times on the Glue's path: a random Puzzle from `PUZZLES`, `REMOVED` or the Grid.02 crossing Grid; a random entry stored and loaded through `createProgressStore` (12,303 survived its checks; the rest had orders 0, 4 and 1.5, string members, Bonds of 2 or 4 members, `null`, undo of 99 to 101, non-boolean `revealed`); 30 random `change`, `undo`, `reset` and `showSolution`, comparing every member after each, sometimes rebuilding from `saved()`. No difference.

Type-check probes: `toBoard` without the `n === 1 || 2 || 3` narrowing fails at `game.ts:138`; `history = before.slice(...)` at `:51`; the old `undo()` at `:108`; `status()` without `: Status` at `:156`; `h = 0` put back passes. Each new runtime form only narrows a type; none is a cast.

## Findings

1. **should fix**, `docs/decisions.md:358` with `package.json:15`: 0029's Cost says Node's types are the oldest Node the README names, but the README names 22.18 and `@types/node` is `^22.20.7`, so tsc doesn't flag an API of 22.19 or 22.20. Step 6's outcome 3 said step 9 revisits it. Pin `@types/node` to 22.18's line and see whether `skipLibCheck` is still needed, or reword the cost.
2. **note**, `src/puzzle/game.ts:10-16`, `:27-31`: `createGame` no longer handles a saved entry of the wrong shape. Sound for every caller (the Glue passes what `isEntry` let through or `saved()`, the typed tests, the JavaScript tests pass well-shaped values, and the generators don't call it), but the requirement is written only inside `orders()`, not in `createGame`'s doc or at `CreateGame`. An untyped caller with `undo: {}` now gets a `TypeError`, and `[0, 1, 0]` then `[0, 1, 1]` gets past "bonded twice".
3. **note**, `docs/plans/10-typescript/README.md:40`: the Design's example `export { createGame } from "./game.js"` describes `api.ts` as it was.
4. **note**, `tests/helpers/puzzles.ts`: in the plan's spirit: no `!` or cast, it throws as `draw.test.ts:15-16` did inline, and it replaces three copies. `tests/unit/draw.test.ts:15-16` and `tests/unit/ui/board.test.js:11` could use it; step 11 is the place.
5. **note**, `src/puzzle/difficulty.ts` in 26d6c0c: the move gave `dottedLines` a return type its JSDoc never had, beyond "the types their JSDoc gave". Harmless; the rename is still recorded (68%).

Checked with no finding: all 9 renames recorded (68% to 99%), with `git log --follow` past them; the move commit's edits; no `@ts-nocheck`, casts, `!`, `@ts-` lines or `any` left; no old names outside the past plans but finding 3; the README and 0029 say 22.18, and CI stays on Node 22; step 3's findings 4 and 5 resolved; `undo()`, the `valid` filter, `toBoard` and `connected` equivalent; Puzzle.03 lists the three reasons the game still checks; the tests assert the same; the commit messages.
