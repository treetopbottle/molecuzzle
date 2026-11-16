# Review of step 4 of plan 02: Schemas

Commits reviewed: 966e16a (tests, step 4(a)) and d1f1612 (implementation, step 4(b)), range 68ae7b9..d1f1612.

What was checked:

- **Checks:** `npm install` and then `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a fresh worktree at d1f1612. Build OK. 100 of 100 unit tests passed. 24 end-to-end tests passed and 1 was skipped (Layout.02 on desktop, which only runs on the phone project, as before this step).
- **Tests commit:** `npm test` in a separate worktree at 966e16a. 14 tests fail, each with `TypeError: game.board is not a function`: the Water Bond.11 example and one Show-solution test for each of the 13 Puzzles. That is the reason the step expects. The tests the plan says "already hold" pass at once: the 13 "is a Puzzle, as its schema says" tests, the schema check of what `saveProgress` stores, and the new Progress.03 test.
- **Rule ids:**
  - Puzzle.01: `tests/unit/puzzle/puzzles.test.js:37` checks every Puzzle against `puzzle.schema.json`. The existing tests already cover the rest of what schemas.md lists for a Puzzle: unique ids, Atoms inside the Grid each at its own point, and the Atoms of the formula.
  - Bond.11: `tests/unit/puzzle/game.test.js:169-184`. The Water example (H 1,1 to O 1,2) gives `[[0, 1, 1]]`, and that result is checked against `board.schema.json`. After Show solution, `board()` equals each Puzzle's `solution`.
  - Progress.03: the schema check at `tests/unit/storage/progress.test.js:24`. The storage.md example `{"puzzles":{"water":"solved","urea":"seen"},"current":7}` loads as `{ puzzles: { water: "solved" }, current: null }` (lines 28-31). "current is left out" is shown as `null`, as `loadProgress` already does, and Puzzle 1 then opens by Progress.01.
- **The schemas helper:** `tests/helpers/schemas.js` adds every `*.schema.json` in `docs/spec/schemas/` to one `Ajv2020`, imported from `ajv/dist/2020.js`, so the `$ref`s from puzzle and progress to `board.schema.json` resolve. It looks schemas up by `$id`, which equals each file name.
- **ajv:** it is in `devDependencies` only, and the lockfile marks it and its dependencies `"dev": true`. Nothing in `src/` or `scripts/` imports it (decisions 0006, 0012).
- **Interfaces:** the only change outside tests is `board()` in `src/puzzle/game.js`, as the Design names. It builds its output from the candidate Bonds, so each pair is a Dotted line and appears once.
- **The ordering claim in the comment** (`src/puzzle/game.js:82-85`, "The candidate Bonds are already by first Atom, then second, since the Atoms are in reading order"): it holds for every Puzzle and Grid whose Atoms are in reading order.
  - `candidateBonds` goes through the Atoms by index and, for each Atom i, adds its right neighbour before its down neighbour.
  - In reading order, the right neighbour (same row, later column) comes after i but before every Atom of a later row, so it comes before the down neighbour, which is in a later row.
  - So each pair is lower index first, and the list is sorted by first Atom, then second.
  - The Atoms of all 13 Puzzles in `src/puzzle/puzzles.js` were checked by hand to be in reading order, and their solutions to follow the ordering rule. Nothing in the code or tests checks this (finding 1).

## Findings

1. **should fix:** `src/puzzle/game.js:82-86` and `tests/unit/puzzle/puzzles.test.js:37`. The order `board()` gives depends on the Atoms being in reading order, and nothing checks that they are.
   - `puzzle.schema.json` only describes reading order, in the `description` of `atoms`. A schema can't enforce it.
   - schemas.md says "What a schema can't say is written next to it", but its list of what a Puzzle must also meet leaves reading order out.
   - No test checks it.
   - If a Puzzle's Atoms weren't in reading order, `board()` could give a pair with the higher index first, or Bonds out of order, and no test would catch it. The Board schema can't express "lower first" or the order. The per-Puzzle Bond.11 test only compares `board()` with the hand-written `solution`, which nothing checks against the ordering rule either.
   - Fix: in Puzzle.01's per-Puzzle tests, check that `atoms` are in reading order. Or check the Bond.11 output directly against the rule: in each Bond the first Atom is lower, and the Bonds are sorted by first Atom, then second. Consider adding reading order to what schemas.md lists for a Puzzle.
2. **note:** `tests/unit/puzzle/game.test.js:169`. The Bond.11 tests are in their own `describe("Bond.11")`. Every other rule's tests are grouped by section (`describe("Bond")` at line 24, `describe("Valence")`, `describe("Check")`, `describe("Help")`), and Bond.01 to Bond.10 are inside `describe("Bond")`. These tests belong there too.
