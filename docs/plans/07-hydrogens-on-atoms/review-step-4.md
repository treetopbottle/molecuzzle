# Review of step 4 of plan 07: difficulty counts loops

Commits reviewed: 6833833 (tests, step 4(a)) and 6ef22b7 (implementation, step 4(b)), range 6f6383d..6ef22b7. I read and ran each one in a `git worktree` of my own, with `npm install`. I have removed the worktree.

## What was checked

- **Checks.** At 6ef22b7, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0. That covers 250 unit tests in 16 files, 33 e2e tests and 10 screenshot tests. The screenshot tests ran in podman.
- **The new tests fail at 6833833.** All 4 new or changed tests fail, and the other 7 tests in `difficulty.test.js` and `generate-script.test.js` pass:
  - Glycine (Puzzle.05) and Glycerol (Puzzle.08): `dottedLines` returns `{ dotted, empty }`, not `{ dotted, loops }`. On these two Puzzles the old and new difficulty give the same number (7 and 11), so only the renamed field makes them fail. That is what the plan says happens for a Molecule with no ring.
  - Morpholine: `empty: 1`, where the test expects `loops: 2`. This is the one test that tells the two measures apart, as the plan intends.
  - The script's comment: it still prints `0 empty`.
- **Tests against the spec.**
  - **The made-up layouts are the plan's.** At 6ef22b7, `node scripts/generate.js "<bonds>" 100000 6 5 1` prints exactly the test's `rows`, `cols`, `atoms` and `solution` for Glycine, Glycerol and Morpholine. It also prints difficulty 7 / 11 / 11 with 1 / 2 / 2 loops, which matches the spec's table (puzzle.md:22–24).
  - **Puzzle.05** (difficulty.test.js:25) checks the spec's example (puzzle.md:92–98): 5 Dotted lines, 1 loop, difficulty 7.
  - **Puzzle.08** (difficulty.test.js:30) checks the spec's example (puzzle.md:114–119): 7 Dotted lines, 2 loops. The rule itself, "every Puzzle after the first three", is a check over the list, which is step 7's.
  - **Morpholine** (difficulty.test.js:35) has 2 loops and 1 empty Dotted line, so difficulty 11, as the plan's step 4(a) asks.
  - **The script's comment** (generate-script.test.js:15) is the plan's format.
- **Code against the spec.**
  - `dottedLines` returns `loops = dotted − atoms + 1`, and `difficulty` is `dotted + 2 × loops`, as Puzzle.05 says.
  - `solution` is no longer read.
  - `difficulty.js` ignores the hydrogens, so a missing fourth item doesn't matter.
  - The `puzzles.test.js` table still passes unchanged (Water 2 … Valine 45). That confirms the plan's claim that today's Puzzles, none with a ring, keep their numbers.
- **Design.** Only the interfaces the plan names changed: `dottedLines`' return value and the script's comment. Its only callers are `difficulty` and `scripts/generate.js`. The code comment now cites decision 0024, which keeps the why. 0021 is already marked partly superseded by 0024.
- **Commits.** Both follow Conventional Commits and carry no attribution.

## Findings

1. **note**: `tests/unit/puzzle/difficulty.test.js:41`. The Water test's name still describes the old measure: "both Bonds when solved".
   - Its number, 2, is right under both measures (2 Dotted lines, 0 loops).
   - Step 7 removes this test, so this only matters until then.
2. **note**: `tests/unit/puzzle/difficulty.test.js:37`. `expect(7 - morpholine.solution.length).toBe(1)` checks the made-up Puzzle against itself, not the code.
   - It documents the contrast the test's name draws, and it can't catch a regression.
   - Harmless.
3. **note**: `scripts/generate.js:39`. The comment prints "1 loops" for one loop, for example on Glycine. That is the plan's literal format and only the generator's output, but "1 loop" would read better if it is ever touched.
4. **note**: `src/puzzle/difficulty.js:12`. `loops = dotted − atoms + 1` holds only if the Dotted lines join all the Atoms, as the code comment says.
   - That is true of every Puzzle with a solution, and of every layout `findLayout` returns.
   - A Puzzle whose Dotted lines fall into separate groups would get too few loops. No test or caller can build one, so this is only worth knowing.

No must-fix or should-fix findings.

## Outcome

1. Kept: step 7 removes the Water test.
2. Kept until step 7, which rewrites the test on the Puzzles of `puzzles.js` and drops the line.
3. Kept: it is the plan's format, and only the generator's comment.
4. Kept: every Puzzle has a solution, so its Dotted lines join its Atoms, as the code comment says.
