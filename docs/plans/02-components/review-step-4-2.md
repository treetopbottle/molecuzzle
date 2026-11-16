# Review of step 4 of plan 02, round 2: the fixes for the review of step 4

Commits reviewed: efe7b99 (tests), e34acbc (spec: schemas.md) and 4e55c74 (Outcome), range d1f1612..4e55c74. These are the fixes for review-step-4.md. 46944b9 in that range is the review itself.

What was checked:

- **Checks:** `npm install` and then `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a fresh worktree at 4e55c74. The build passed. All 100 unit tests passed. Of the 25 end-to-end tests, 24 passed and 1 was skipped: Layout.02 on desktop, which only runs on the phone project, the same as in round 1.
- **Each commit touches only what it says:** efe7b99 changes only `tests/unit/puzzle/game.test.js` and `tests/unit/puzzle/puzzles.test.js`. e34acbc changes only one line of `docs/spec/schemas.md`. 4e55c74 only adds the Outcome to `review-step-4.md`, and leaves the Findings as they were committed in 46944b9.
- **Outcome line 1 matches:**
  - The per-Puzzle test in `describe("Puzzle.01 the puzzles")` (`tests/unit/puzzle/puzzles.test.js:41-46`) now checks that the Atoms are in reading order, at line 45.
  - The per-Puzzle Bond.11 test (`tests/unit/puzzle/game.test.js:176-184`) checks two things: each Bond has its lower Atom first (line 181), and the Bonds are strictly sorted by first Atom, then second (line 182). It still compares the Board with `solution` (line 183).
  - schemas.md:7 lists "the Atoms are in reading order" (e34acbc).
- **Outcome line 2 matches:** `describe("Bond.11")` is gone. Both Bond.11 tests are now the last ones in `describe("Bond")` (`game.test.js:168-184`).
- **The reading-order check is correct** (`puzzles.test.js:45`):
  - It is a strict comparison: the row goes up, or the row stays the same and the column goes up. That is the "by row, then by column" in the `description` of `puzzle.schema.json`'s `atoms`.
  - It would fail if two Atoms were swapped. For example, Water with O 0,1 before H 0,0 fails at i=1.
  - It would also fail for column-first order. For example, H 0,0, H 1,0, O 0,1 fails at i=2.
  - Because the comparison is strict, it also implies the "own point" check on line 44. That is redundant but harmless.
- **The Board-order checks are correct and would fail if the order broke** (`game.test.js:181-182`):
  - Because line 182 is strict, it also catches a pair that appears twice.
  - Since `board()` equals `solution` (line 183), these lines also check every hand-written `solution` against the ordering rule. Round 1 found that missing.
  - **Atoms out of reading order:** Water with its Atoms reordered to O 0,1, H 0,0, H 1,1 gives candidate Bonds {0,2} and {1,0}. `board()` would then be `[[0,2,1],[1,0,1]]`, which fails line 181 and line 182. This is on top of line 45.
  - **`board()` giving `[e.b, e.a, …]`:** fails line 181 for every Puzzle.
  - **Reversed or otherwise reordered output:** fails line 182, since every Puzzle has at least 2 Bonds.
  - **`candidateBonds` adding the down neighbour before the right one:** puts (i, down) before (i, right), with down > right. That fails line 182 wherever both are in the solution, and line 183 as well.
- **schemas.md:7 fits:**
  - The added item goes into the existing "Also:" list. Each of the other items there is checked by a test, and now this one is too.
  - The wording matches the schema's `description` and the way puzzle.md:51 ("the Atoms in reading order") and plan 02's Design use the term.
  - Puzzle.01 in puzzle.md:9 still says "Each is a [Puzzle](schemas.md#puzzle)". That link now covers reading order, so puzzle.md needed no change.
  - The comment at `src/puzzle/game.js:82-85` depends on reading order, and that is now both tested and in the spec.

## Findings

1. **note:** `tests/unit/puzzle/game.test.js:168-174` and `176-184`. The order of `board()` is checked only after Show solution. The only Board made by clicks is the Water example, which has a single Bond.
   - With the current code this doesn't matter. `board()` is a pure function of `order`, indexed by candidate Bond, so the order in which Bonds were clicked can't affect it.
   - But a Board made by clicks is what the Player makes, and what Progress will store (Progress.03, `boards`).
   - A Bond.11 example that makes two Bonds against the order would pin down "by first Atom, then second" whatever the order the Bonds were made in. For example, Water: H 2,2–O 1,2 first, then H 1,1–O 1,2, giving `[[0, 1, 1], [1, 2, 1]]`. Optional.

## Outcome

1. Kept: `board()` reads only the Bond orders, indexed by candidate Bond, so the order of the clicks can't reach it; step 10's tests store Boards made by clicks and check them against the schema.
