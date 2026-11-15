# Review of plan 02, step 1: Move into components

Commits reviewed: 5261b50 (`refactor: move the code and tests into components`), range e5f975f..5261b50. Step 1 has no rule ids, so it has no tests commit and the check that new tests fail was skipped.

What was checked:

- `npm test` passes: 7 files, 66 tests.
- `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes: build, unit tests, and 23 end-to-end tests passed with 1 skipped (Layout.02 on desktop, which is touch only). This ran in a separate `git worktree` at 5261b50, removed afterwards.
- No behavior changes. `dist/index.html` built from e5f975f and from 5261b50 differs only in esbuild's `// src/...` path comments and the new HTML comment.
- The file moves match the Design layout and are all git renames. `main.js` is now `browser.js`, and the source files are 100% similar. `board.js` and `index.html` changed only in import paths and the build comment.
- Imports, `scripts/build.js`, `scripts/generate.js`, `playwright.config.js`, `tests/e2e/build.js`, `tests/e2e/helpers.js` and `package.json` (`test:e2e`, and `check` runs it) are fixed. `vitest.config.js` needed no change: its glob `tests/unit/**/*.test.js` still matches.
- No old paths are left (`test:ui`, `tests/ui`, `main.js`, flat `src/*.js`) outside the plan 01 history.
- The README is updated: "Where things are", the diagram (whose arrows match the actual imports) and `test:e2e` under Development. The paths in decisions 0007 and 0008 are updated.
- Every path the spec and decisions name exists, except `docs/spec/screenshots/` (finding 5).
- The tests in `tests/unit/puzzle/` keep their Puzzle ids, as the rule says. Every other renamed test follows the old→new table. The findings below are the cases where a name and what the test asserts differ.

## Findings

1. **note**: `tests/e2e/bonding.spec.js:66`. "Input.03 Reset removes every Bond, and Undo brings them back" now has a UI id, but it asserts the opposite of Input.03 and Bond.09. At line 74 Reset is disabled after Reset even though there is something to undo. At lines 75–77 Undo after Reset brings the Bonds back. The plan allows this until step 9 ("The tests of Bond.08–10 keep the old behavior"). But this test no longer has a Bond id, and neither step 9(a) nor step 10(a) names it among the tests that "change to match". It will fail when step 9 lands, so it won't be missed silently. Still, the plan could name it in step 9 or 10. The test also checks Ctrl+Z (line 75), so it covers Input.02 without saying so. Line 53 is tagged Input.02 for the same key.
2. **note**: `tests/unit/ui/board.test.js:18`. "Board.04, Board.02 names each Atom with what it needs, and each dotted line" is the name the plan's own example gives, but it doesn't match what the test checks:
   - It checks the accessible names (Board.04) and that the 3 Dotted lines are drawn dotted (`.edge .maybe`, line 36), which is Board.01.
   - Board.02 is the orange badge and the glow, which this test doesn't check.
   - The ids are also out of order, unlike every other test name.

   By the rule "a test takes the new ids of what it checks", the name would be "Board.01, Board.04 …".
3. **note**: some renamed tests check rules their names leave out. These are minor, and each case follows the table:
   - `tests/unit/ui/board.test.js:52` ("Board.01, Board.02") also checks Board.04 names (lines 58, 60).
   - `tests/e2e/check.spec.js:60` ("Input.04, Messages.01, Panel.01, List.02") also checks that the list button stays "Puzzle 9" (line 72), which is List.01.
   - `tests/e2e/check.spec.js:25` checks the "✓ Solved" badge (line 36), which is Panel.01, without tagging it. It is tagged Progress.01, but nothing about storage is checked, only the score and the badge.
   - `tests/e2e/puzzle.spec.js:4` ("Panel.02, Board.04") also checks the counter and "Unsolved" (lines 11, 13), which is Panel.01.
4. **note**: `src/ui/index.html:7`. The new comment ("scripts/build.js replaces this link and the script below …") is copied into `dist/index.html`. In the built page the link and script it mentions are already gone, so the comment is out of place. It does no harm. `scripts/build.js` could strip it, or leave it, as the Player never sees it.
5. **note**: `docs/spec/ui.md:15` (and lines 17, 26, 39, 83, 126, 130, 148), and `docs/decisions.md:175` (0013) name `docs/spec/screenshots/` and its PNGs, which don't exist yet. This is expected: step 12 makes them. It is the one exception to "every path the spec and decisions name exists".
6. **note**: this is about the plan, not this commit. Step 2 says it adds the test for Messages.01 "in orange for pieces". After the renames, `tests/e2e/check.spec.js:15` ("Messages.01 every Atom complete, but in two pieces") already checks this with `toHaveClass("warn")` at line 22, and `#status.warn` is the orange style (`src/ui/style.css:36`). Only "green for revealed" is still untested.

No must fix or should fix findings.
