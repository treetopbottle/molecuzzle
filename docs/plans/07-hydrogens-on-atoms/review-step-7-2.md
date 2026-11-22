# Second review of step 7 of plan 07: the fixes

Commits reviewed: 90b4a18 ("fix: Cyclohexanol's and Cyclohexene's facts say only what holds; …"), against the Findings and Outcome of `docs/plans/07-hydrogens-on-atoms/review-step-7.md` (Outcome added in dac0d47). I ran 90b4a18 in my own `git worktree` with `npm install`. I have removed the worktree. The main checkout was not touched.

## What was checked

- **Checks.** At 90b4a18, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0:
  - 216 unit tests in 16 files pass.
  - 34 e2e tests pass. The 3 skipped are the phone-only tests in the desktop project.
  - 10 screenshot tests pass, run in podman.
- **Scope of the commit.** It changes only `src/puzzle/puzzles.js` (two facts), `tests/e2e/layout.spec.js` and `tests/e2e/puzzle.spec.js`. Between 90b4a18 and d66838b only docs change, so the code reviewed in B below is the same.
- **Outcome 1 (fixed).** `src/puzzle/puzzles.js:59` now reads "Cyclohexanol is turned into adipic acid, one of the two building blocks of nylon 6,6.", which is the wording the finding suggested.
  - It is true. Cyclohexanol, as KA oil, is oxidised to adipic acid, and adipic acid with hexamethylenediamine makes nylon 6,6.
  - No other copy of the old text is left in `src/`, `docs/spec/` or the tests.
- **Outcome 2 (fixed).** `src/puzzle/puzzles.js:45` says "turns it colourless". The spelling matches the rest of the code ("colours", "fertilisers").
- **Outcome 3 (fixed).** `tests/e2e/layout.spec.js:21–26`:
  - Each phone test now waits for `getByRole("group", { name: board })` with "Board, 3 by 5" or "Board, 6 by 3" before it measures. That is Board.04's name, set at `src/ui/board.js:38`.
  - Glucose is the only 3×5 Puzzle and Citric acid the only 6×3 one (`puzzles.js:102`, `:109`), so the Grid size alone identifies each Puzzle.
  - Both tests ran in the phone project and passed (tests 36 and 37).
- **Outcome 6 (fixed).** `tests/e2e/puzzle.spec.js:74` checks that the status line reads "Click a dotted line between two atoms to bond them.".
  - That is the `empty` status (`src/ui/messages.js:8`, ui.md:96), which `game.js:57` gives only when no Bond is set. So it checks that Puzzle 2 has no Bonds.
  - The stored Progress check below it still shows no Board for `acetic-acid`.
- **Outcomes 4 and 5 (kept).**
  - The reasons agree with the first review's own numbers. Layout.01 (ui.md:21) forbids only sideways scrolling.
  - The screenshot of Glucose taken by hand for outcome 5 isn't kept, so I couldn't check it. Keeping the finding is allowed for a note.
- **Commit.** It follows Conventional Commits and has no attribution.

## Findings

1. **note**: `docs/plans/07-hydrogens-on-atoms/README.md:83`. dac0d47 marked step 7 `[DONE]` linking only `review-step-7.md`, before this second review. Step 1 links both of its reviews, "[review](review-step-1.md), [2](review-step-1-2.md)". Step 7 should link this one too once it is written.

No must-fix or should-fix findings.

## Outcome

1. Fixed in the commit that adds this Outcome: step 7 links both of its reviews.
