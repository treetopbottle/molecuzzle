# Review of plan 02, step 1, round 3: the fixes for the second review

Commits reviewed: 6be3c68..01f7644. These are 8160450 (`test: list the ids of the Puzzle.02 page test in the spec's order`), 2301165 (`docs: fix the renaming example and step 2's Messages.01 test in plan 02`) and 01f7644 (`docs: add the outcome of the second review of step 1`). Only a test name and docs changed, so there is no tests commit to check for failing tests.

What was checked:

- `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes at 01f7644. The build works, 7 unit test files with 66 tests pass, and 23 end-to-end tests pass with 1 skipped (Layout.02 on desktop, which is touch only). This ran in a separate `git worktree` at 01f7644, which has been removed.
- The second review was committed (6be3c68) before the fixes, and 01f7644 only adds the Outcome below its Findings. The Findings were not edited.
- Every Outcome line matches the commits:
  1. Step 2(a) (`docs/plans/02-components/README.md:86`) now says "green for solved and revealed (orange for pieces is tested by `tests/e2e/check.spec.js`)" (2301165). The orange test is `check.spec.js:15`, which asserts the class `warn` at line 22. Including solved matches Messages.01 ("solved and revealed in green"), and no test at 01f7644 asserts the green class (`good`) for either one. So this goes further than the finding suggested, correctly. Saying that this line supersedes Outcome 6 of the first review, and not editing that Outcome, is in line with review.md.
  2. `tests/e2e/puzzle.spec.js:4` is "Board.04, Panel.01, Panel.02" (8160450).
  3. `README.md:80` adds "A test takes the ids of the rules it is about, not of every value it reads on the way, and lists them in the order of the spec" (2301165).
  4. The example at `README.md:80` says "Board.01, Board.04" (2301165).
  5. Kept, with nothing changed.
- The kept reasons hold. Outcome 5 repeats what the finding itself said. Under the new rule, the names Outcome 3 leaves as they are fit. `puzzle.spec.js:60` is about Progress and reads the counter and the list on the way. `bonding.spec.js:66` is about Reset and Undo. `check.spec.js:53` is about the Next puzzle button. The `toHaveAccessibleName` checks in `bonding.spec.js` read Bond orders. The ids added by the first round also fit as "about":
  - `check.spec.js:60`'s "still unsolved" is shown by the badge, the button and the score.
  - `board.test.js:52` is the only unit test of the "double bond" and "complete" names.
  - `puzzle.spec.js:4`'s Board.04 is the id the table gives Puzzle.02 at page level.
- Every multi-id test name at 01f7644 was compared with the order in ui.md (Page, Layout, Board, Input, Messages, Panel, List), then storage.md. Within a file, all of them are in order. Which file comes first is finding 1.

## Findings

1. **should fix**: `docs/plans/02-components/README.md:80`. "in the order of the spec" doesn't say how files are ordered against each other, and the plain reading doesn't fit one of the renamed tests. The spec lists its files as puzzle.md, storage.md, ui.md (`docs/spec/README.md:7-9`), and so does the plan's own Scope (`README.md:11-13`: Puzzle, Storage, UI). Read that way, `tests/e2e/check.spec.js:25` "Board.03, Messages.01, Panel.01, Panel.03, List.02, Progress.01" is out of order: Progress.01 would come first. The tests actually follow ui.md and then storage.md, as the second review described. Later steps will add tests that mix Storage and UI ids (for example step 10's end-to-end tests of Progress.05), so the rule should name the order. Either say "in the order of ui.md, then storage.md", or follow the spec's file order and move Progress.01 to the front at `check.spec.js:25`.
2. **should fix**: `docs/plans/02-components/README.md:85-86`. Step 2 is "Tests for the rules without one" and 2(a) asks for "the names of the Board and its Atoms" (Board.04). Since step 1's renames, Board.04 already has tests for nearly all of it:
   - The Board's name: `tests/unit/ui/board.test.js:20` and `tests/e2e/puzzle.spec.js:18`.
   - Atoms with "needs n more bond(s)": `board.test.js:23-26` and `puzzle.spec.js:22-25`.
   - "complete": `board.test.js:60` and `bonding.spec.js:84`.
   - All four Bond names: `bonding.spec.js:10`.

   No test sees the Element name Nitrogen. This is the same problem the second review's finding 1 found for orange: whoever does step 2 follows the plan and would test these names again. 2301165 edited this line but left the item alone, and neither earlier round caught it. Step 2(a) should say what is missing (only Nitrogen's name, if that is the intent) and point to the existing tests, as it now does for orange.
3. **note**: `docs/plans/02-components/README.md:59,69,75`. The table right above the new rule doesn't list its ids in the spec's order, under either reading of finding 1:
   - line 59: "Puzzle.02, Panel.02, Board.04"
   - line 69: "Input.02, Board.04"
   - line 75: "Check.04, Messages.01, Panel.03, Board.03, Progress.01, List.02"

   Step 1 says to rename "by the table above", and the second review traced `puzzle.spec.js:4`'s old order back to line 59. Step 1 is done, so nothing is wrong now. But the table and the rule disagree, and anyone copying from the table copies the wrong order. The table could follow the spec's order, or the rule could say that the table gives ids, not their order.

No must fix findings.

## Outcome

1. Fixed: the rule names the order, Puzzle ids, then UI ids in the order of ui.md, then Storage ids, which is how the tests are named (4c10949).
2. Fixed: step 2(a) tests the Board.04 example, Formaldehyde with C═O, which no test has as a whole; it says the names are tested in parts already (4c10949). Nitrogen's name isn't in the example, so it stays out.
3. Fixed: the rule says the table gives the ids, not their order (4c10949).
