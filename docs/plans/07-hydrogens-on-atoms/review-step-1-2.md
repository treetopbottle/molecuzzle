# Review of the fixes after the first review of step 1 of plan 07

Commits reviewed: 99682f9, the fixes to the findings of `review-step-1.md`. I also read 6f6383d, which adds the Outcome and marks step 1 done. I read and ran 99682f9 in its own `git worktree`, with `npm install`, and have removed the worktree.

## What was checked

- **Checks.** At 99682f9, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0: 248 unit tests in 16 files, 33 e2e tests and 10 screenshot tests (podman).
- **Outcome 1** (`tests/unit/puzzle/game.test.js:94`). The test now reads the hydrogens back through `remaining`, not through `game.atoms`.
  - It checks `[2, 1, 4, 1]` at the start, after undoing everything (`while (game.undo())`), and after Reset.
  - It checks `[0, 0, 0, 0]` after Show solution.
  - Each check can fail. If any of these paths lost CH₃'s 3 hydrogens, C 2,1 would need 4, or 3 after the solution. Reset, which the first review found missing, is covered.
- **Outcome 2** (`game.test.js:109`). The refused CH₃═C Board is now stored with `revealed: true`, and building it ends in `solved`.
  - This check can fail. Starting from an empty Board, `commit` clears `revealed` only when the Board becomes empty (`game.js` `commit`). So if a refusal kept the flag, building would end in `revealed`.
  - It now matches the `test.each` table above it (`game.test.js:77-90`) and the whole of Puzzle.03, puzzle.md:11.
- **Outcome 3** (`game.test.js:135`). Check.04 is now on the made-up Glycine, as in the spec's example (puzzle.md:331: "Given Puzzle 3 / When Glycine is built"). The Bond.03 test on CH₃─C stays as an extra, as the Outcome says.
- **Outcome 4.** Step 7 of the plan now says "the hydrogens of the formula, carried to the solver" for `puzzles.test.js` (6f6383d).
- **Scope.** Only `game.test.js` changed, and only those three tests. Nothing under `src/` changed.
- **Commits.** Both follow Conventional Commits and carry no attribution.

## Findings

1. **note**: `docs/plans/07-hydrogens-on-atoms/README.md:91`. Outcome 3 says the spec's Bond.03 example on Acetonitrile is tested in step 7. Step 7 doesn't name it; Outcome 4 got its own words in the plan.
   - "As the spec's examples now are" covers it, so this is small.
   - Naming Bond.03 next to "carried to the solver" would make sure step 7 doesn't drop it.

No must-fix or should-fix findings.
