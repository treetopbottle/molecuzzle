# Review of step 7 of plan 10

Commits reviewed: b2206d7 (the renames, with `// @ts-nocheck`) and d0ed826 (the typing, with app.test's fakes as a `Store` and a `Ui`). The step has no rule ids, so there is no tests commit to check failing.

Checks, each in a worktree: at d0ed826 and at b2206d7, `npx tsc -p .` passes, `npm run build` writes 49.9 kB, `npm test` passes 413 in 17 files, and Playwright passes 40.

Probes at d0ed826, each undone before the next, each failing tsc where it should: the fake's `render(view: string)` and `render(view: { index: string })` at `app.test.ts:37`; the fake's `open(game: string)` at `:36`; `close(): void` added to `Ui` at `:35`; `clear(): void` added to `Store` at `:22`; `load: () => 3` at `:24`; `onChange(0, 2)` at each of its 4 calls; `view()` cast to `number` at each use. After `if (!handlers) throw`, `handlers` is `Handlers`. So the fakes are checked as a `Store` and a `Ui`, but for the method bivariance the Design accepts for `open`.

## Findings

1. **note**, `tests/unit/app.test.ts:117`: `PUZZLES.find(p => p.id === "acetic-acid")?.solution` puts `undefined` in the expected object when the Puzzle is missing. No assertion is weakened in practice, but it differs from `draw.test.ts:16`, which throws "no Glycine"; a throw would say what is missing.
2. **note**, `tests/helpers/draw.ts:23`: `Array(W).fill(" ")` is `any[]`, so `grid` is `any[][]`, unflagged as the `any` comes from the lib. `Array<string>(W).fill(" ")` would type it.
3. **note**, `tests/helpers/colors.ts:4`: `type Rgb = number[]`, though the comments say `[r, g, b]`. A tuple would need a cast or a written-out return in `rgb`, and wouldn't match `colors` in `tests/e2e/helpers.ts`; defensible, but looser than the comments.
4. **note**, `docs/plans/10-typescript/README.md:47`: the Design's paragraph on the import test still says `tests/unit/imports.test.js`. It describes the test as it is, unlike steps 1 and 5's lines, which rightly keep the old names.
5. **note**, process: b2206d7, step 7's move, was committed before step 6's review, its fixes and its `[DONE]`, though `docs/workflow/implement-a-step.md` has one step at a time. No harm came of it: the fixes touch `tests/e2e/helpers.ts` only at lines b2206d7 didn't change.

Checked with no finding: all six renames recorded as renames (95% to 99%), with `git log --follow` past them; the move commit's edits; no old names left but finding 4; no casts or `@ts-` lines; the same expectations but finding 1, 413 tests before and after, `start`'s and `last()`'s throws only failing earlier; `click`'s return; `imports.test.ts`'s `encoding`; the fake `open`; the commit messages.

## Outcome

1. Fixed in 8a06026: `PUZZLES[1].solution`, Puzzle 2, as the test's `onOpen(1)` already takes it.
2. Fixed in 8a06026.
3. Kept: `number[]` matches what the e2e `colors` reads, with no cast.
4. Fixed with this outcome: the Design's line names `imports.test.ts`.
5. Kept, noted: step 8's move went in before this review too; from step 9 on, a step starts after the review of the one before is dealt with.
