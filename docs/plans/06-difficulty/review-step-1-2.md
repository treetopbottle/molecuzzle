# Second review of step 1 of plan 06: the difficulty

Commits reviewed: 4df5be1 (refactor: `dottedLines` counts the Dotted lines once, and the test checks the counts) and 15483b9 (the Outcome of the [first review](review-step-1.md)). I read and ran 4df5be1 in its own `git worktree`, and d252533 in another to compare. I ran `npm install` in both. Both worktrees have since been removed.

## What was checked

- **Checks.** At 4df5be1, `npm test` passed 261 unit tests. `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0: 261 unit tests, 33 e2e tests and 10 screenshot tests passed.
- **Each Outcome line against what was done.**
  1. `tests/unit/puzzle/difficulty.test.js:8` now checks `dottedLines(glycine)` against `{ dotted: 12, empty: 3 }`, along with the total of 18. This matches the line.
  2. `src/puzzle/difficulty.js:7-10` counts the candidate Bonds once, in `dottedLines`. `difficulty()` (`:13-16`) is built on it. `scripts/generate.js:29,36` takes the comment's counts from it and no longer imports `candidateBonds`. This matches the line.
  3. Kept, and step 2 handles it. This is fine for a note.
- **The script's output is unchanged.** I ran `node scripts/generate.js` at d252533 and at 4df5be1 with the same arguments, and the outputs are byte-identical in every case:
  - Acetic acid, 4×4, seed 1: `difficulty 10: 8 Dotted lines, 1 empty`.
  - Water, with the defaults.
  - Halothane, with the defaults and also 3×3 seed 1. With 3×3 seed 1 both commits stop with "no unique layout found".
  - Glycine, with the defaults and also 6×5 seed 7.
  - A bad Bond, `X1-H1`: both print "can't read X1-H1" and exit 1.
- **Puzzle.05.** `dottedLines` counts the Grid's Dotted lines with `candidateBonds`, the same function the game uses (`game.js:18`). `empty` is that count minus the length of `solution`. That is right because each pair of Atoms appears only once in a solution (`docs/spec/schemas.md:23`); I checked this for every Puzzle. `difficulty` = dotted + 2 × empty, as the rule says. I also computed `difficulty` for all 20 Puzzles in the table at `docs/spec/puzzle.md:16-37`, and each matches the table's Difficulty column.

## Findings

1. **note**: `src/puzzle/difficulty.js:7`: `dottedLines` is a new export, but the plan's "Interfaces that change" (`docs/plans/06-difficulty/README.md:23`) names only `difficulty(puzzle)`. The first review asked for this change, and the change is small. Still, the plan and `docs/architecture.md` don't mention the new function.
2. **note**: `src/puzzle/difficulty.js:6`: `dottedLines` has a one-line comment but no `@param` type. `difficulty` has one at `:12`.

No must-fix or should-fix findings.
