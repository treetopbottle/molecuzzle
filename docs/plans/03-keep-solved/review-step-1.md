# Review of step 1 of plan 03: A solved Puzzle is kept

Commits reviewed: cd927ae (tests, step 1(a)) and 33c4289 (implementation, step 1(b)), range f03c214..33c4289. Everything was read and run in separate worktrees at 33c4289 and at cd927ae. Both worktrees have been removed.

## What was checked

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` at 33c4289 passes. That covers the build, the unit tests, 31 end-to-end tests (1 skipped: Layout.02 on desktop, which was already skipped before this step) and the 9 screenshot tests in Podman.
- **Rule ids:** each one has a test.
  - Progress.01: `tests/unit/app.test.js` "Progress.01 a solved Puzzle is marked solved" and `tests/e2e/puzzle.spec.js:60`.
  - Progress.05: `app.test.js` "Progress.05 Reset removes what was kept" and `tests/e2e/progress.spec.js:37`.
  - Progress.06: `app.test.js` "Progress.06 solving keeps the solved Board...", `progress.spec.js:37`, `progress.spec.js:53` and `puzzle.spec.js:60`.
  - The `saved()` test in `tests/unit/puzzle/game.test.js:346` is tagged Puzzle.03 and Bond.10.
- **Expected results against `docs/spec/storage.md`:**
  - The stored JSON in the Progress.01 example matches, key order included.
  - The Progress.06 example matches step by step: solve, open Puzzle 2, reload, open Puzzle 1. Then it is solved with H 1,1─O 1,2 and O 1,2─H 2,2, and Undo is disabled. After Reset, open 2, open 1, it has no Bonds (shown by the empty status), is still marked solved, and the stored value matches.
  - The narrative check (still showing Glycine after the reload) matches `docs/spec/narratives.md:7`.
- **Tests commit (cd927ae):** 3 unit tests and 4 end-to-end tests fail, all for the reason the step expects. `saved()` is `null` after solving, so `boards.water` is missing from what is stored, and a solved Puzzle opens with the empty status ("Click a dotted line..."). No other test fails. 33c4289 changes no tests.
- **Code against the spec and the Design:**
  - The only behaviour change is the dropped `status().kind === "solved"` condition in `saved()` (`src/puzzle/game.js:133`), plus the two docstrings the plan names (`game.js:128-130`, `src/app.js:27`). `storage/progress.js` and the schema are untouched, as the Design says.
  - A solved Board stores `revealed: false` and `undo: []`:
    - `history` is cleared on solving (`game.js:91`) and when a game is created solved (`game.js:60`).
    - `showSolution` on a solved Board doesn't set `revealed` (`game.js:116`).
- **Decisions:** 0017 covers the choice. No other choice here needs one.

## Findings

1. **note**: `src/ui/board.js:88`, with `src/ui/style.css:57`: at 33c4289, a solved Puzzle that opens again gets the class `solved` from its first render, so its Atoms pulse. That goes against Board.03 (`docs/spec/ui.md:34`: "a Puzzle that opens solved ... doesn't pulse"). The plan expects this and fixes it in step 2. Step 2 should land before this reaches `main`'s published build.

No other findings.

## Outcome

1. Kept: step 2 fixes it, and nothing is pushed before then.
