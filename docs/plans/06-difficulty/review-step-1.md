# Review of step 1 of plan 06: the difficulty

Commits reviewed: a74e122 (tests, step 1(a)) and d252533 (implementation, step 1(b)), range d92208e..d252533. Each was read and run in its own `git worktree` with `npm install`. Both worktrees have since been removed.

## What was checked

- **Checks.** `CHROMIUM_PATH=/usr/bin/chromium npm run check` at d252533 exits 0: 261 unit tests, 33 e2e tests and 10 screenshot tests passed.
- **Tests against the spec.** `tests/unit/puzzle/difficulty.test.js` has the Puzzle.05 example (Glycine: 12 + 2 × 3 = 18) and Water's 2, as the plan asks. `tests/unit/puzzle/generate-script.test.js` checks that Generate.01 prints difficulty 2, and it matches the whole comment line `// difficulty 2: 2 Dotted lines, 0 empty`.
- **Tests fail at a74e122, for the expected reasons.** `difficulty.test.js` can't find the module `src/puzzle/difficulty.js`. The Generate.01 test fails because the script still prints `// 0 unused candidate bonds`.
- **Code against the spec.** `difficulty()` returns candidate Bonds + 2 × (candidate Bonds − solution length), which is what Puzzle.05 says, and nothing more.
- **Design.**
  - `difficulty.js` is in `src/puzzle/` and imports only `grid.js`.
  - Nothing in `src/` imports it, only the script and the tests.
  - The script's comment has the plan's format.
  - `docs/architecture.md` adds the node, its arrow to `grid.js`, and the note "not part of the game".
- **The script's other output is unchanged.** I ran `scripts/generate.js` at a74e122 and at d252533 with the same arguments, for Acetic acid (4×4, seed 1) and Halothane (3×3, seed 1). Only the comment after `rows`/`cols` differs (for example, `difficulty 10: 8 Dotted lines, 1 empty`). The drawing, `atoms` and `solution` lines are byte-identical.

## Findings

1. **note**: `tests/unit/puzzle/difficulty.test.js:7`: the test's name says Glycine has 12 Dotted lines with 3 empty, but it checks only the total, 18. A miscount that still adds up to 18 would pass (for example 14 + 2 × 2). The Generate.01 test does check the Dotted and empty counts, so this is minor.
2. **note**: `scripts/generate.js:30` and `:37`: the script counts the candidate Bonds itself (`unused`), and `difficulty()` counts them again. The comment's three numbers come from two copies of the formula. They agree now, but they could drift apart if one copy changes. One count, with the difficulty computed from it or checked against it, would avoid that.
3. **note**: `docs/architecture.md:38` says the tests use the difficulty "to check the Puzzles in `puzzles.js`". At this commit no test does that: the order test comes in step 2. At the same commit, the old "Puzzle.05 Puzzles 22 to 28" test and the comment at `src/puzzle/puzzles.js:155` still refer to the rule that Puzzle.05 replaced. Step 2 of the plan already removes both, so no action is needed in this step.

No must-fix or should-fix findings.

## Outcome

1. Fixed in 4df5be1: the test also checks Glycine's 12 Dotted lines and 3 empty, through `dottedLines`.
2. Fixed in 4df5be1: `dottedLines` counts them once, and both the difficulty and the script's comment use it.
3. Kept: step 2 adds the order test and removes the old ones, as the finding says.

Code changed, so the fixes have a [second review](review-step-1-2.md).
