# Review of plan 02, step 1, round 2: the fixes for the first review

Commits reviewed: d085078..832923b. These are 200611a (`test: name the rules the renamed tests check (review of step 1)`), bccd9ac (`docs: name the end-to-end Reset test in step 9 of plan 02`) and 832923b (`docs: add the outcome of the review of step 1`). Only test names and docs changed, so there is no tests commit to check for failing tests.

What was checked:

- `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes at 832923b. The build works, 7 unit test files with 66 tests pass, and 23 end-to-end tests pass with 1 skipped (Layout.02 on desktop, which is touch only). This ran in a separate `git worktree` at 832923b, which has been removed.
- The first review was committed (d085078) before the fixes, and 832923b only adds the Outcome below its Findings. The Findings were not edited.
- Every Outcome line matches the commits:
  1. The test at `tests/e2e/bonding.spec.js:66` is now "Input.02, Input.03 …" (200611a). Step 9(a) names `tests/unit/puzzle/game.test.js` and `tests/e2e/bonding.spec.js` among the old tests of Undo after Reset (bccd9ac). `game.test.js:130` is that test.
  2. `tests/unit/ui/board.test.js:18` is "Board.01, Board.04" (200611a).
  3. All four sub-items were done in 200611a: Board.04 at `board.test.js:52`, Panel.01 at `check.spec.js:25`, List.01 at `check.spec.js:60` and Panel.01 at `puzzle.spec.js:4`.
  4. to 6. are kept, with nothing changed.
- Every test renamed in step 1 was compared with docs/spec/ui.md, storage.md and puzzle.md: 18 end-to-end tests and 9 unit tests in `tests/unit/ui/` and `tests/unit/storage/`.
  - The tests in `tests/unit/puzzle/` keep their Puzzle ids, as the plan's rule says.
  - Every unit test in `tests/unit/ui/` and `tests/unit/storage/` now lists exactly the rules it asserts.
  - The end-to-end gaps that remain are in findings 2 and 3.
- The reasons for kept findings 4 and 5 are sound. Finding 4 is backed by the plan itself: Design (`docs/plans/02-components/README.md:50`) asks for that comment in `index.html`. The reason for 6 does not match the plan (finding 1).

## Findings

1. **should fix**: `docs/plans/02-components/README.md:86`. Outcome 6 (`review-step-1.md:44`) keeps the finding with the reason "step 2 adds only the test for green; orange for pieces is already tested". But step 2(a) still says "the status line in green for revealed, in orange for pieces", and neither 200611a nor bccd9ac changed it. Whoever does step 2 follows the plan, not an old review's Outcome, so they would add a second test of orange. This is really a fix to the plan, not a kept finding. Step 2(a) should say "in green for revealed (orange for pieces is tested by `tests/e2e/check.spec.js:15`)", and Outcome 6 should then read as fixed.
2. **note**: `tests/e2e/puzzle.spec.js:4`. "Panel.01, Panel.02, Board.04" is out of the spec's order. ui.md has Board before Panel. Every other test with several ids follows the order of ui.md and then storage.md (e.g. `check.spec.js:25` "Board.03, Messages.01, Panel.01, Panel.03, List.02, Progress.01"). The order came from the plan's table (`README.md:59`, "Puzzle.02, Panel.02, Board.04"). The first review's finding 2 said only `board.test.js:18` was out of order and missed this one, and the fix kept Board.04 last. It would be "Board.04, Panel.01, Panel.02".
3. **note**: fix 3 added ids for assertions that support the test, not just the rule it is about: List.01 for the "Puzzle 9" button at `check.spec.js:72`, Board.04 for names at `board.test.js:58,60`. That standard isn't applied everywhere. Under it, these names still leave out ids:
   - `tests/e2e/puzzle.spec.js:60` ("Progress.01, Progress.03") sees the stored state through the counter "Puzzle 4 of 13" (line 65, Panel.01) and the button "Puzzle 1: Water, solved" (line 66, List.01). This is the same kind of assertion that earned List.01 at `check.spec.js:60`.
   - `tests/e2e/bonding.spec.js:66` asserts the status text "Click a dotted line…" (line 73, Messages.01) and Bond names (lines 76–77, Board.04).
   - `tests/e2e/check.spec.js:53` ("Panel.03") asserts "✓ Solved! It's Alanine." (line 56, Messages.01).
   - Most end-to-end tests in `bonding.spec.js` assert Bond names with `toHaveAccessibleName` (lines 12, 21, 29, 36, 38, 48, 50, 60, 62), which is Board.04 by the standard used at `board.test.js:52`.

   No name is wrong; the line between "the rule tested" and "how it is observed" just isn't drawn the same way everywhere. Either say in the plan's renaming rule (`README.md:80`) that a test takes the ids of the rules it is about, not of every value it reads, or apply the stricter reading to the cases above.
4. **note**: `docs/plans/02-components/README.md:80`. The plan's example of the renaming rule still says `board.test.js` "Grid.01, Valence.01 names each Atom…" "becomes Board.04, Board.02". That is the name the first review found wrong (its finding 2) and 200611a replaced with "Board.01, Board.04". The plan is Active, so its example now teaches the wrong answer. It could say "Board.01, Board.04" or point to the review.
5. **note**: `docs/plans/02-components/README.md:107`. Step 9(a) begins "Tests in `tests/unit/puzzle/`:" but now also names `tests/e2e/bonding.spec.js`. The brackets make the meaning clear, so this is only wording. Step 11(b) ("the end-to-end tests that click Reset accept its dialog") also covers this test (`bonding.spec.js:72`), so nothing is missed in later steps.

No must fix findings.

## Outcome

1. Fixed: step 2(a) tests green for solved and revealed, and points to the existing test of orange (2301165). Outcome 6 of the first review stays as written; this line supersedes it.
2. Fixed: Board.04, Panel.01, Panel.02 (8160450).
3. Fixed: the plan's renaming rule says a test takes the ids of the rules it is about, not of every value it reads, in the spec's order (2301165). The names listed here read values on the way, so they stay.
4. Fixed: the example says Board.01, Board.04 (2301165).
5. Kept: the brackets make it clear, as the finding says.
