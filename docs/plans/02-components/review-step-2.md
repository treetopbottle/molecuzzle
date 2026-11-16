# Review of step 2 of plan 02: Tests for the rules without one

Commits reviewed: 2426a1c..a77a921, which is one commit: a77a921 "test: add tests for Puzzle.02, Valence.02, Board.04 and Messages.01". Step 2(b) has nothing to implement, so there is no implementation commit.

What was checked:

- `CHROMIUM_PATH=/usr/bin/chromium npm run check`, in a separate worktree at a77a921, since removed, passed: 69 unit tests passed, and 24 end-to-end tests passed with 1 skipped (Layout.02 on desktop, as before).
- The four new tests pass at the tests commit, which is what step 2(b) expects.
- Each rule id has a test whose expected results match the spec, written out by hand:
  - **Puzzle.02:** the start Board of the puzzle.md example (Puzzle 3).
  - **Valence.02:** the Valence example: no Atom is complete, then after C═O only O 3,1 is.
  - **Board.04:** the ui.md example word for word, with "Board, 3 by 2" added from the rule.
  - **Messages.01:** green for solved and revealed.
- The test names follow the renaming rule.
- The tests go where step 2(a) says: two in `tests/unit/puzzle/`, Board.04 in `tests/unit/ui/board.test.js`, and the green test in `tests/e2e/check.spec.js`.
- The commit message is a Conventional Commit with no attribution.

## Findings

1. **should fix:** `tests/e2e/check.spec.js:22` and `docs/plans/02-components/README.md:86`. Orange for pieces is not really tested. Step 2(a) says "orange for pieces is tested by `tests/e2e/check.spec.js`", but the pieces test only checks `toHaveClass("warn")`. The colour itself is never checked. If `#status.warn` in `src/ui/style.css:36` were removed or turned green, every test would still pass. The new green test does check computed colours (`tests/e2e/check.spec.js:53-71`), so the two halves of the colour sentence in Messages.01 are tested differently. Check orange the same way green is checked, for example with an `isOrange` (red largest, green between red and blue) on the pieces status line, or make the plan's wording say what is actually tested.
2. **note:** `tests/unit/puzzle/game.test.js:181-187`. The Valence.02 test defines "complete" inside the test as `game.remaining(i) === 0` (line 183). `game.js` has no "complete" of its own, so the test can only fail if `remaining()` is wrong. Valence.01 already covers that: its `"H1 C2 H1 O0"` after C═O is the same fact. The test is not vacuous, but it adds little. The one place the Puzzle uses "complete" is `status()`, where a complete Atom is not counted as open (`src/puzzle/game.js:19`). Asserting `game.status()` is `{ kind: "open", open: 3 }` after C═O would tie the rule to code that uses it.
3. **note:** `tests/unit/puzzle/game.test.js:10-20`. Puzzle.02 is a rule about every Puzzle ("a Puzzle starts with no Bonds"), but the test checks only the Puzzle 3 example. That matches the spec's example. A cheap extra line would cover the whole rule: `expect(PUZZLES.filter(p => createGame(p).order.some(Boolean))).toEqual([])`.
4. **note:** `tests/e2e/check.spec.js:54`. `isGreen` only asks whether the green channel is the largest. The default status text, `--text` #e6ebf5 (230, 235, 245), misses counting as green only because its blue is 10 higher than its green. The test is correct today, since the `.some(isGreen)` check at line 62 does fail if the status line is always green. But a small change to `--text` could make that check fail, or the "every" checks pass, for the wrong reason.
