# Review of step 9: A Puzzle goes on where it was left

Commits reviewed: a7e5e86 (tests, step 9(a)) and 2143e3d (implementation, step 9(b)), range 2766365..2143e3d.

What was checked:

- **The checks:** `npm install` and `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a clean worktree at 2143e3d. They pass: 136 unit tests, 26 end-to-end tests passed and 1 skipped (the touch-only test in `tests/e2e/layout.spec.js:15`, which was already skipped). A worktree was used because the main checkout had uncommitted step 10 work in progress.
- **The tests commit, a7e5e86, in its own worktree:**
  - Nine tests fail, each for the reason the step expects: `game.saved is not a function`, the restored Board is ignored (the snapshot doesn't match, and the status is `empty` instead of `revealed`), Undo goes back 101 times instead of 100, Undo is still possible after Reset and after solving, and Reset does nothing with no Bonds but something to undo.
  - The end-to-end test "Reset removes every Bond and the undo history" fails because Undo is still enabled after Reset.
  - Two sets of tests pass at once, as the commit message says. One is "Bond.10 while the solution is shown…". The other is the five "Puzzle.03 with … it starts with no Bonds" cases, which pass only because createGame doesn't read its options yet.
  - From 2143e3d on, those five cases do test the behavior. The positive Puzzle.03 tests show the options are read, and each bad Board is fine apart from its stated fault, so removing any one check (on a Dotted line, a pair twice, crossing, valence, the history) makes its case fail. The exception is "nothing to undo" in four of the cases (finding 1).
- **Rule ids:**
  - Puzzle.03 has a test with its example; for the second half of the example, see finding 1.
  - Bond.08 has the 101-change example, with 100 written in the test and the final H·C─N.
  - Bond.08 and Bond.09 have the Ammonia example: the snapshot after Undo, then no Bonds and nothing to undo.
  - Bond.09 also has a test of Reset with no Bonds but something to undo.
  - Bond.10 has the Water example (solved, nothing to undo) and a test of the shown solution.
  - Help.01: `saved()` keeps `revealed` after Show solution and after Undo.
  - The old tests of Undo after Reset (unit and end-to-end), after solving, and of the limit (it no longer uses `UNDO_LIMIT`) changed to match.
- **Design:**
  - The signature `createGame(puzzle, { bonds, revealed, undo } = {})` matches the plan.
  - A Board that breaks any of the four rules, in the Board itself or in its history, starts the game with no Bonds, nothing to undo and `revealed` false.
  - `saved()` returns null with no Bonds and nothing to undo, or when solved, as Progress.05 says.
  - `reset()` clears the Bonds, the history and `revealed`, and returns false only when there are neither Bonds nor history. Solving clears the history in `change()`.
  - `UNDO_LIMIT` is 100, as the spec and `progress.schema.json`'s `maxItems` say.
  - Only `game.js` changed in `src/`, and the only new interface is `saved()`.
  - The code matches decision 0015. Nothing in the docs still says the limit is 300, apart from past reviews.

## Findings

1. **should fix**, `tests/unit/puzzle/game.test.js:45`: the second half of the Puzzle.03 example isn't tested as the spec writes it. The spec reads "Given the Board [[0, 2, 1]] instead … Then it starts with H·C·N, and nothing to undo", which keeps the undo history `[[]]` from the first half. The test passes `[]`. In four of the five bad-Board cases (lines 45–48) the history is empty, so "nothing to undo" holds whatever createGame does. Only the history case (line 49) has a non-empty history, and there the Board itself is fine. So no test checks that a bad Board also drops a good history: an implementation that rejected the Board but kept `undo` would pass. Fix: give line 45 the example's `[[]]`, and ideally the other three cases too.
2. **note**, `src/puzzle/game.js:45`: `revealed` is restored only when the Board has Bonds (`shown === true && order.some(Boolean)`). This follows Help.01: the solution counts as shown only until the Board has no Bonds again. `saved()` can never give `revealed: true` with no Bonds, because `commit` and `undo` clear it. So this only matters for data made some other way, and no test passes `revealed: true` with an empty Board. It is fine to keep; a one-line test would pin it down.
3. **note**, `src/puzzle/game.js:44`: a restored history longer than 100 is cut to the last 100 (`before.slice(-UNDO_LIMIT)`), not rejected. This applies Bond.08 ("with each change past 100, the oldest is forgotten") and keeps the newest Boards, which are the right ones because `undo` pops from the end. It isn't tested. In practice it can't happen: from step 10, `load()` leaves out an entry with more than 100 Boards (`maxItems`).
4. **note**, `src/puzzle/game.js:40-47`: a solved Board passed in with a history starts solved with its history, so Undo works on a solved Board. Bond.10 allows Undo only while the solution is shown, and says solving removes the history. Puzzle.03 doesn't list a solved Board among the Boards that can't be on the Grid, so the code does what the spec says. `saved()` never produces such data (it returns null when solved, Progress.05), so this only matters for hand-made or stale data. Either accept it, or have createGame drop the history of a solved Board.
5. **note**, plan order, no file: `main` is the published build, and from 2143e3d its Reset can't be undone (Undo is disabled after it) but doesn't ask first; Input.05 comes in step 11. Decision 0015 says "Reset can't be undone, so it asks first". Until step 10, there is also no Progress that would make the lost Undo worth it. This is the order the plan chose, not a fault in this step, but until step 11 the live game has an irreversible Reset with no confirm.

## Outcome

1. Fixed: the four bad-Board cases pass the example's history `[[]]`, so each checks that a bad Board also drops a good history (bfd794e).
2. Fixed: a test starts with no Bonds and `revealed: true`, Undoes and builds the Molecule, and it is solved (bfd794e).
3. Kept: `load()` leaves out an entry with more than 100 Boards from step 10, so the cut is only a guard.
4. Fixed: a solved Board as it was left starts with nothing to undo, as Bond.10 says solving removes the history, with a test (bfd794e).
5. Kept: nothing is pushed to `main` while the plan runs, and step 11 adds the confirm for Reset.
