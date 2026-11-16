# Second review of step 9: A Puzzle goes on where it was left

Commits reviewed: bfd794e (fix: `src/puzzle/game.js` and `tests/unit/puzzle/game.test.js`) and c8e1e4e (the Outcome in `review-step-9.md`), range 2143e3d..c8e1e4e.

What was checked:

- **The checks:** `npm install` and then `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a clean worktree at c8e1e4e, since removed. The checks pass: 138 unit tests, plus 26 end-to-end tests passed and 1 skipped (the touch-only `tests/e2e/layout.spec.js:14` on desktop, skipped as before).
- **The new test fails without the fix:** bfd794e's tests run against the `game.js` of 4dac53c. Only "Bond.10 a solved Board starts with nothing to undo" fails (`expected true to be false` on `canUndo`). The other changed tests pass there, which is expected: they cover behavior that 2143e3d already had. The test and the fix are in one commit, but the test does fail without the fix.
- **The tests fail when the behavior breaks:** `game.js` changed in the worktree three times, put back after each:
  - With a bad Board that keeps its good history, all five "Puzzle.03 with …" cases fail. Before the fix, the four bad-Board cases passed whatever createGame did with the history.
  - With `revealed` restored on a Board with no Bonds (`&& order.some(Boolean)` removed from line 45), "Help.01 with no Bonds, the solution doesn't count as shown, also after Undo" fails.
  - With line 59 clearing the history for any finished Board (`done()`) instead of only a solved one, nothing fails. See finding 1.
- **The Outcome:**
  - Line 1 matches: lines 59–62 of the test now pass `[[]]`, the history from the spec's Puzzle.03 example.
  - Line 2 matches: line 44 starts with no Bonds and `revealed: true`, Undoes, then adds the last Bond. That follows Help.01 ("until the Board has no Bonds again").
  - Line 4 matches: `game.js:59`, with its test at line 51.
  - Line 3 is a sound reason to keep it. Step 10(a) of the plan has `load()` leave out an `undo` with 101 Boards (`progress.schema.json` `maxItems: 100`).
  - Line 5 is a sound reason to keep it. Local `main` is 76 commits ahead of `origin/main`, and 2143e3d isn't on `origin/main`, so the Reset with no confirm isn't published.
- **The new rule:**
  - `if (status().kind === "solved") history = []` runs once, after the Board is restored. A Board that is valid but not solved, or that shows the solution (`revealed`), keeps its history, so Undo still works while the solution is shown (Bond.10).
  - It has no effect on `saved()`: that is null for a solved Board either way (Progress.05).
  - No caller passes options at c8e1e4e (`src/app.js:29` calls `createGame(puzzles[i])`).
  - Nothing else changed in `src/`.

## Findings

1. **should fix**, `tests/unit/puzzle/game.test.js:41`: no test checks the other side of the new rule. A restored Board that shows the solution must keep its history, because Bond.10 says Undo works "while it shows the solution". The test at line 41 restores Urea with `revealed: true` and `undo: [[]]` but checks only the status. If `game.js:59` became `if (done()) history = []`, an easy slip since `done()` is defined on the line above, all 138 tests still pass. A Player who showed the solution and came back would then find Undo disabled, against Bond.10 and the Help.01 rule that the solution counts as shown "also when Undo goes back past it". Fix: add `expect(game.canUndo).toBe(true)` (or an Undo back to `[]`) to the test at line 41.
2. **note**, `tests/unit/puzzle/game.test.js:51`, `docs/spec/puzzle.md:11`: the new test is tagged Bond.10, but Bond.10 says "Solving removes the undo history", which is about the act of solving. Restoring a solved Board isn't that act. Bond.08's "up to 100 changes back … since it was last reset or solved" fits the rule more directly. Puzzle.03 itself says a Puzzle starts "with its undo history" and doesn't list a solved Board among the cases that drop it. The rule follows from the spec, and `saved()` never produces such data. Still, adding Bond.08 to the test's ids, or a clause in Puzzle.03, would point the test at text that says what it checks.
3. **note**, `src/puzzle/game.js:9-14`: createGame's doc comment still lists only the bad-Board case as starting without the saved history. The new case is explained only in the line comment at 59. That comment says what happens; it would be more useful to say why (no Undo on a solved Board, Bond.08/Bond.10).

## Outcome

1. Fixed: the test restoring Urea with the solution shown also Undoes back to no Bonds; with `done()` in place of solved, it fails (6008bbe).
2. Fixed: the test's ids are Bond.08, Bond.10 (6008bbe).
3. Fixed: createGame's comment names the solved case, and the line comment says why (6008bbe).
