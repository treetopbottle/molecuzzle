# Review of the fixes for step 7 of plan 02: The panel as a component (round 2)

Commits reviewed: 7575109 (test: Panel.01 as the spec's example) and 0575d9e (the Outcome of `review-step-7.md`). Range 732e8be..0575d9e, which also holds f383139, the first review.

What was checked:

- **The checks pass at 0575d9e.** `npm install` and `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a clean `git worktree` at 0575d9e, since removed.
  - Vitest: 11 files, 113 tests passed. That is one more than at 732e8be: the new test for a solved Puzzle.
  - Playwright: 26 passed, 1 skipped (Layout.02 on desktop, skipped before too).
  - `npm install` warned that esbuild's install script was blocked. The build ran anyway.
- **7575109 changes only `tests/unit/ui/panel.test.js`.** No code changed, so the fixed tests pass against 732e8be's `renderPanel`. That is expected: the behavior was right, only the test was off from the example.
- **Each Outcome line against what was done:**
  - Line 1 matches 7575109:
    - Puzzle 13 is now rendered with nothing solved (`panel.test.js:32`).
    - The test expects `"‹ Puzzle 13 of 13 › Unsolved"` with › disabled (`:34`, `:37`).
    - "✓ Solved" has its own test, on Puzzle 11 (`:40-43`), as in the `panel-solved.png` example (`docs/spec/ui.md:128`).
    - The nav's text is checked whole and in order (`:22`, `:26`).
  - Lines 2–6 keep notes whose original findings already called the choice sound or harmless:
    - Line 3 has a sound reason: plan 02's "Left out" keeps the game as it is for the Player.
    - Line 4 has a sound reason: Panel.01–04 name it "the panel".
  - Line 7 is a promise for step 8. As expected, `docs/decisions.md:109` (0007) is unchanged at 0575d9e. See finding 1.
- **The Panel.01 tests against the rule and example (`docs/spec/ui.md:119`, `:134-139`):**
  - "Puzzle <n> of 13" between ‹ and ›, with the badge next to it: the exact nav strings at `:26`, `:34` and `:42` cover it.
  - ‹ disabled on Puzzle 1 and › on Puzzle 13: `:27` and `:37`.
  - The example's end state, "Puzzle 13 of 13" and "Unsolved" with › disabled: `:34` and `:37`.
  - Clicking › stays end-to-end (`tests/e2e/puzzle.spec.js:29`), as finding 2 of the first review accepted.
- **The tests can fail if the behavior breaks.** The exact nav strings fail on a wrong count, a wrong order, a missing ‹ or ›, or a wrong badge. The disabled and `data-open` checks fail on wrong bounds. The one gap is in finding 2.
- Step 7 is not yet marked `[DONE]` in the plan. That is right: implement-a-step.md marks a step done after its review, as was done for step 6 (4044335).

## Findings

1. **note**: `docs/plans/02-components/review-step-7.md:54`, Outcome line 7, "Fixed in step 8", has no commit.
   - review.md asks for each Outcome line to be either fixed (with the commit) or kept (with why).
   - Step 8 of the plan doesn't mention updating 0007 (`docs/plans/02-components/README.md:105` names only the README's diagram), so nothing tracks the promise but this line.
   - Fix: when step 8 lands, check that `docs/decisions.md:109` names `src/ui/panel.js` and `src/ui/ui.js`, then add the commit to this line.
2. **note**: `tests/unit/ui/panel.test.js:40-43`. The unit tests don't show that the badge comes from Progress rather than from `done`.
   - The only solved case, Puzzle 11 at `:41`, has `done: true` too. The unsolved cases (`:25`, `:32`) have `done: false`.
   - So a `renderPanel` that set the badge from `done` would still pass every unit test.
   - The end-to-end tests do catch it: `tests/e2e/check.spec.js:84` expects "Unsolved" after Show solution, and `:94` expects "✓ Solved" on a solved Puzzle after Show solution. That is enough for this step.
   - If step 8 moves those cases into happy-dom tests of `createUi`, one view with `done: true` and nothing solved, expecting "Unsolved", would cover it at the unit level. Spec: "Unsolved" or "✓ Solved" at `ui.md:119`, Show solution keeping a Puzzle unsolved at `check.spec.js:73`.

## Outcome

1. Fixed in step 8: decision 0007 names the UI's components in `src/ui/` and the Glue as tested with Vitest (f7cf6b0). This line closes Outcome 7 of the first review.
2. Fixed in step 8: a `createUi` test renders a shown solution, `done` with nothing solved, and expects "Unsolved" and "Solved 0 of 13" (9ad8d21).
