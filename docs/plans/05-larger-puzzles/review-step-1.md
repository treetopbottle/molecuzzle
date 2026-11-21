# Review of step 1 of plan 05: Grids that fit a phone

Commits reviewed: 6a2629d (tests) and 1376476 (implementation), range 40136b0..1376476. I read and ran each commit in its own worktree with `npm install`, and removed both worktrees afterwards.

## What was checked

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes at 1376476.
  - Build passes.
  - Unit tests: 222 passed.
  - e2e tests: 32 passed and 1 skipped. The skip is "Layout.02 tapping…" in the desktop project, and this step doesn't touch that file.
  - Screenshots: 10 passed.
- **Tests commit (6a2629d):**
  - "Generate.01 with no size given…" fails for the reason the plan gives: `expected 6 to be less than or equal to 5` on cols, at `tests/unit/puzzle/generate-script.test.js:43`. With the old defaults butane comes out 6 columns wide.
  - The Puzzle.04 test passes at once for all 21 Puzzles, as the plan says.
- **Spec match:**
  - Puzzle.04 (`docs/spec/puzzle.md:12`) has a test of at most 6 rows and 5 columns per Puzzle, at `tests/unit/puzzle/puzzles.test.js:56-59`.
  - The Puzzle.04 example (Valine, 6 by 5) belongs to step 2, so it is rightly absent here.
  - Generate.01 (`docs/spec/puzzle.md:82`) says "6 by 5 if they are left out". The new test runs the script, not just `findLayout`, as the plan review's outcome 8 asked.
- **Code:**
  - Only `findLayout`'s defaults change, to `maxRows = 6, maxCols = 5` (`src/puzzle/generate.js:19`), plus a JSDoc line (`:14`).
  - The comment in `scripts/generate.js:12-13` is updated.
  - Nothing else changes, as the Design asks.
  - At 1376476, butane with no size given prints `rows: 6, cols: 4`.
- **Existing generator tests:** every test in `tests/unit/puzzle/generate.test.js` and `generate-script.test.js` passes explicit tries, sizes and seed, or stops before searching (Generate.02). So the new defaults don't affect them, and they all pass.
- **Decisions:** the choice is covered by decision 0019. No new decision is needed.

## Findings

1. **note**: `tests/unit/puzzle/generate-script.test.js:41-43`. The test only checks "at most 6 by 5". Defaults of 5 by 5, or even 4 by 4, would also pass it, so it doesn't show the 6th row is allowed. Butane now gives exactly 6×4, so asserting `rows: 6, cols: 4` would pin the new default. The rule's wording ("at most") makes the current test acceptable.
2. **note**: `scripts/generate.js:12-13`. The comment repeats `findLayout`'s other defaults (20000 tries, seed 1). That is two places to keep in step if those defaults ever change.
