# Review of step 2 of plan 05: The new Puzzles

Commits reviewed: 8a5942c and ab99173 (tests, 2(a)) and 9fa5edf (implementation and screenshots, 2(b)), range 9be5ee8..9fa5edf. I read and ran each one in its own worktree with `npm install`, and removed the worktrees afterwards.

## What was checked

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes at 9fa5edf.
  - Unit tests: 259 passed.
  - e2e tests: 33 passed and 2 skipped. Both skips are phone-only tests in the desktop project.
  - Screenshots: 10 passed.
- **Tests commits fail for the expected reason:**
  - At 8a5942c, `npm test` fails only the 2 `ui.test.js` count tests, with `Solved 0 of 21` where the test expects `Solved 0 of 28`.
  - At ab99173, the unit tests also fail on the Puzzle list snapshot, and Puzzle.04 and Puzzle.05 fail because `PUZZLES[27]` and `PUZZLES[21]` are undefined.
  - At ab99173, e2e has 12 failures. Some expect "of 28" and get "of 21". Panel.03 and the new layout test time out because the list has no "Puzzle 28" button.
- **Rule ids against the spec:**
  - Puzzle.01: the list snapshot follows the table's order and formulas.
  - Puzzle.04: the example is Valine, 19 Atoms, 6×5.
  - Puzzle.05: the example is Lactic acid with 5 empty Dotted lines, and each of Puzzles 22 to 28 leaves at least 5.
  - Layout.01: a phone test opens Puzzle 28.
  - Panel.01: the ui.md example on Puzzle 28 is at `tests/e2e/puzzle.spec.js:29`.
  - Panel.03: the test builds Valine.
  - Page.01, List.01 and List.02: the counts say 28.
  - `panel.test.js` keeps its 13 fake Puzzles.
- **Code:** only the seven entries are added to `src/puzzle/puzzles.js`, in the table's order. The UI code doesn't change.
- **Structures, by hand from each `solution`:** all seven are the plan's Molecules, not isomers, and every valence is right.
  - Lactic acid: CH₃–CH(OH)–COOH.
  - Ethyl acetate: CH₃–CH₂–O–C(=O)–CH₃.
  - Glycerol: HOCH₂–CH(OH)–CH₂OH.
  - Serine: HOCH₂–CH(NH₂)–COOH.
  - Cysteine: HSCH₂–CH(NH₂)–COOH.
  - Threonine: CH₃–CH(OH)–CH(NH₂)–COOH.
  - Valine: (CH₃)₂CH–CH(NH₂)–COOH.
- **Facts:** all are right. For Threonine, "1935" is the year of Rose's paper. Some sources say 1936, but 1935 is defensible.
- **Reproducing the layouts:** three of the seven match `node scripts/generate.js` output exactly, atoms and solution:
  - Lactic acid: `"C1-C2 C2-C3 C3=O1 C3-O2 O2-H1 C2-O3 O3-H2 C2-H3 C1-H4 C1-H5 C1-H6" 20000 6 5 1` gives 4×4, 5 unused.
  - Ethyl acetate: `"C1-C2 C2=O1 C2-O2 O2-C3 C3-C4 C1-H1 C1-H2 C1-H3 C3-H4 C3-H5 C4-H6 C4-H7 C4-H8" 20000 6 5 1` gives 6×4, 5 unused.
  - Glycerol: `"C1-C2 C2-C3 C1-O1 C2-O2 C3-O3 O1-H1 O2-H2 O3-H3 C1-H4 C1-H5 C2-H6 C3-H7 C3-H8" 20000 6 5 1` gives 5×4, 6 unused.

  For the other four, see finding 3.
- **Screenshots:**
  - Only the six named ones changed. `board.png`, `actions.png` and `board-halothane.png` are unchanged.
  - Each new one shows 28 Puzzles, "of 28" and "Solved k of 28", and the list wraps to 6 rows on the desktop panel.
  - The one exception is described in finding 1.

## Findings

1. **should fix**: `docs/spec/screenshots/panel-mystery.png`, and its test at `tests/e2e/screenshots.spec.js:41-45`. The remade screenshot shows the "8" button in its hover colour (`button:hover`, `src/ui/style.css:8`).
   - Cause: the panel is now 774 px tall, so at 1280×800 its bottom (about 838 px) is below the viewport. `toHaveScreenshot` scrolls the panel into view by about 41 px, one row of the list. The mouse, still where `openPuzzle` clicked "3", ends up over "8".
   - Before, the panel was 733 px tall and fit, so nothing scrolled.
   - Effect: ui.md's example "Puzzle 3, unsolved" now shows a second button that looks marked, which List.01 doesn't describe.
   - Fix: move the mouse off the list (e.g. `page.mouse.move(0, 0)`) before the screenshot, and remake it.
2. **should fix**: `src/puzzle/puzzles.js:184-190` (Cysteine) against `:177-183` (Serine). Cysteine's layout is Serine's flipped along the diagonal, with one O/H pair moved.
   - Transposed, Serine has exactly Cysteine's points: the same NH₂ corner, the same alpha C and the same COOH row.
   - 12 of 14 symbols and 11 of 13 Bonds are in the same places. The only change: Serine-transposed has O at row 1, col 3 and H at row 2, col 4, where Cysteine has H and S.
   - So Puzzles 25 and 26 are nearly the same puzzle back to back, which is the problem the plan review's finding 2 asked to avoid.
   - It isn't literally "the same layout with only the symbols changed", so it doesn't break the Design's wording. It does break its intent.
   - Fix: pick a Cysteine seed whose points don't match Serine's under rotation or reflection.
3. **note**: `src/puzzle/puzzles.js:177-204`. I couldn't reproduce the layouts of Serine, Cysteine, Threonine and Valine with the arguments given.
   - I tried about 270 Bond texts, including the three styles that reproduce the other Puzzles.
   - Serine: 234 orderings at seed 1, and 2 texts over seeds 2 to 8. One of those runs gives a 4×4 layout with 7 unused, like the committed one, but not the same layout.
   - Cysteine: 4 texts at seed 4. Threonine: 11 at seed 1. Valine: 8 at `100000 6 5 2`, one of which found no unique layout.
   - The Bond text decides the output, and neither the commit, the plan nor a comment records it. So the Design's "layouts come from `node scripts/generate.js`" can't be checked for these four.
   - The tests do show each one has exactly one solution, fits 6×5 and leaves at least 5 Dotted lines empty.
   - Suggestion: record each Molecule's Bond text and arguments, e.g. in the commit message or the plan.
4. **note**: `tests/e2e/layout.spec.js:28-29`. The test checks that the stage-to-status-line span fits in the viewport height, not that the status line is on screen. The plan says "shows its status line on the screen".
   - The test is more robust, because `openPuzzle` clicks the list, which scrolls the page.
   - Its name says "fit the screen", which matches what it checks.
5. **note**: `docs/spec/screenshots/page-start.png`. At 1280×800 the page is now 854 px tall (it was 813), so the last row of the list sits below the fold on desktop. No rule forbids vertical scrolling. This is only to make the trade-off deliberate.

## Outcome

1. Fixed in 645ad7f: the mouse leaves the list before both panel screenshots; `panel-mystery.png` was made again from scratch, since the hover is within the tolerance and `--update-snapshots` kept the old one. `panel-solved.png` came out the same.
2. Fixed in 1c2290e: Cysteine is seed 2's 5×4 layout. A check of every turn and flip finds no new layout equal to an earlier one.
3. Fixed in the commit after 645ad7f: the plan's Design records each Molecule's Bonds and arguments; with them, the script gives the committed layouts.
4. Kept: the test checks what its name says, and is more robust, as the finding says.
5. Kept: the page scrolls on a computer too; no rule forbids it, and the Board and its status line stay in view.

A Puzzle's layout and a screenshot test changed, so the fixes have a [second review](review-step-2-2.md).
