# Third review of step 9: A Puzzle goes on where it was left

Commits reviewed: 6008bbe (test and comments: `tests/unit/puzzle/game.test.js` and `src/puzzle/game.js`) and 7701d63 (the Outcome in `review-step-9-2.md`), range c8e1e4e..7701d63 (e1a853f, in that range, is the second review itself).

What was checked:

- **The checks:** `npm install` and then `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a clean worktree at 7701d63, since removed. They pass: 138 unit tests in 13 files, and 26 end-to-end tests passed with 1 skipped. The skipped one is the touch-only `tests/e2e/layout.spec.js:14` on desktop, skipped as before.
- **The range:** it changes only three files: `review-step-9-2.md` (Outcome added, Findings unchanged), `src/puzzle/game.js` (two comments, no code) and `tests/unit/puzzle/game.test.js`.
- **The tests fail when the behavior breaks:** `game.js` changed in the worktree twice, put back after each change:
  - Line 60 as `if (done()) history = [];` (shown solutions also lose their history): only "Puzzle.03, Bond.10 it starts with the solution shown, if it was, and Undo still works" fails (`expected false to be true` on `undo()`). So finding 1 of the second review is now covered.
  - Line 60 removed (solved Boards keep their history): only "Bond.08, Bond.10 a solved Board starts with nothing to undo" fails. So both sides of the rule are now tested.
- **The test against the spec (`docs/spec/puzzle.md`):**
  - `game.test.js:39-45` restores Urea with its solution, `revealed: true` and the undo history `[[]]`. It checks the status is `revealed`, that `undo()` works and that the Board becomes `[]`.
  - This matches Puzzle.03 (line 11): the Puzzle starts from a Board, from whether the solution was shown, and from its undo history.
  - It matches Bond.10 (line 124): "Undo while it shows the solution".
  - It agrees with Help.01 (line 249): Undo may go back past the shown solution. Whether the solution still counts as shown after that is tested at line 47.
  - The tag Bond.10 fits, because the test checks Undo while the solution is shown.
  - `game.test.js:54` is now tagged Bond.08, Bond.10. Bond.08 (line 122) is "up to 100 changes back … since it was last reset or solved", which fits a restored solved Board.
- **The Outcome:**
  - Line 1 matches: the Urea test now Undoes back to no Bonds, and with `done()` in place of the solved check it fails (confirmed above).
  - Line 2 matches: the test at line 54 has the ids Bond.08, Bond.10.
  - Line 3 matches. createGame's doc comment (`game.js:13-14`) now names the solved case: "A solved Board starts with nothing to undo, since solving ends the undo history". The line comment at `game.js:60` now gives the reason, not just what happens: "Undo goes back only to the last solve (Bond.08, Bond.10)".
  - Each finding has an Outcome line, all fixed, each with its commit.

## Findings

No findings.
