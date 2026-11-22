# Review of step 1 of plan 08

Commits reviewed: 2903ab8 (tests) and f4e9e21 (implementation). At 2903ab8, in a separate worktree, 11 tests fail for the expected reasons; at f4e9e21 `npm test` passes (325) and so do the end-to-end tests (35). The code does what the spec says and no more, and every rule id of the step has a test.

## Findings

1. **should fix:** `tests/unit/puzzle/puzzles.test.js:11-20`. The Puzzle.09 test was added in the implementation commit, not the tests commit; at the tests commit nothing tests the budget of Puzzles.
2. **note:** `src/ui/messages.js:15-16`. `reasonText(result, atoms)` no longer uses `atoms`, and `ui.js:61` still passes it.
3. **note:** `messages.test.js` and `ui.test.js` assert that a leftover `reason: "full"` gives no text; slightly past the spec, fine as a guard.

## Outcome

1. Kept: only the commit placement is wrong, and the test exists and passes; commits aren't rewritten.
2. Fixed: `reasonText(result)` and its callers drop the parameter.
3. Kept: a guard.
