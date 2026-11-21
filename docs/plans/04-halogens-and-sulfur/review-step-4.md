# Review of step 4 of plan 04: The new Puzzles

Commits reviewed: f688fc7 and 7dd28ea (tests, step 4(a), in two commits) and 3b9822d (implementation and screenshots, step 4(b)), range 624cd33..3b9822d. I read and ran them in three separate worktrees, at f688fc7, 7dd28ea and 3b9822d, each after `npm install`, and removed all three afterwards.

## What was checked

- **Checks.** At 3b9822d, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0. Unit tests: 200 passed. e2e: 32 passed and 1 skipped (the touch-only one on desktop). Screenshots: 10 passed, the new Halothane one included.
- **Tests commits fail for the expected reason.**
  - At f688fc7, the 2 changed tests in `ui.test.js` fail on `Solved 0 of 13` / `Solved 1 of 13`. 11 e2e tests fail on "… of 13" in the counter, the score or the aria snapshot. "Panel.03 the last puzzle …" times out waiting for the "Puzzle 21" button.
  - At 7dd28ea, two more tests fail. `puzzles.test.js` fails because the list snapshot doesn't match. `draw.test.js` fails because `find` returns undefined (`TypeError … reading 'atoms'`). The Halothane screenshot test, run alone in Podman, times out on the "Puzzle 21" button.
  - Neither tests commit touches `src/`.
- **Rule ids against the spec.**
  - Puzzle.01: the list in `puzzles.test.js` matches the 21 rows of the puzzle.md table, names and formulas. The tests that run per Puzzle (schema, formula atoms, exactly one solution) now cover the eight new ones.
  - Board.01: the screenshot test of Halothane with no Bonds, as in ui.md's example.
  - Page.01: page-start and page-solved, now "Solved 0/1 of 21".
  - Panel.01: `puzzle.spec.js:29` follows ui.md's example. It goes from Puzzle 1 with ‹ disabled, then ›, then opens Puzzle 21 and checks "Puzzle 21 of 21", "Unsolved" and › disabled.
  - Panel.03: `check.spec.js:66` builds Halothane, checks "✓ Solved! It's Halothane." and that there is no "Next puzzle →".
  - List.01 and List.02: "Solved 1 of 21" in `ui.test.js` and the e2e tests, and list.png.
  - Chloroform in `draw.test.js` now comes from `puzzles.js` and matches the drawing in docs/spec/README.md.
  - `panel.test.js` keeps its 13 fake Puzzles, as the plan says.
  - No count of 13 is left in `tests/`, `src/` or `docs/spec/`.
- **Design.**
  - Only `src/puzzle/puzzles.js` changes in `src/`, and no UI code.
  - The top comment says "easiest first within each batch (decision 0018)".
  - Chloroform's atoms are exactly the plan's.
  - `bond()` matches `[A-Z][a-z]?`.
- **Layouts.** I reran `node scripts/generate.js` with the defaults. All eight layouts come out exactly, each from some order of its Bonds:
  - Chloroform: `C1-H1 C1-Cl1 C1-Cl2 C1-Cl3`
  - Vinyl chloride: `C1=C2 C1-H1 C1-H2 C2-H3 C2-Cl1`
  - Iodoethane: `C1-C2 C1-H1 C1-H2 C1-H3 C2-H4 C2-H5 C2-I1`
  - Halothane: `C1-C2 C1-F1 C1-F2 C1-F3 C2-H1 C2-Br1 C2-Cl1`
  - The others in the same way.
- **Structures and facts.** I traced every solution:
  - S=C=S
  - CHCl₃
  - CH₃–SH
  - Cl₂C=O
  - CH₂=CHCl
  - F₂C=CF₂
  - CH₃–CH₂I
  - CF₃–CHClBr

  Every formula is in Hill order, as the spec table has it. The eight facts are true: viscose and rayon or cellophane; chloroform from 1847; methanethiol's cabbage smell and bad breath; phosgene in WWI and in polycarbonate; PVC; PTFE/Teflon; ethyl iodide browning in light as iodine is freed; halothane from the 1950s (1956).
- **Screenshots.**
  - page-start, page-solved, page-phone, panel-mystery, panel-solved and list show 21 buttons and "of 21", and nothing else changed.
  - board-halothane.png matches ui.md's example. It shows F light green, Cl green, Br dark red with white text, and a C and an H. "Cl" and "Br" fit in their balls, and every Atom has its orange badge.
  - board.png and actions.png are unchanged.
  - Not checked: Carbon disulfide and Iodoethane in a browser (the S and I glow and badge). The plan asks for that by hand, and the commits can't show it.

## Findings

1. **note**: src/puzzle/puzzles.js:131-142 and 143-155. Valence-1 Atoms can stand in for each other, and these layouts are the same as older ones:
   - Vinyl chloride (18) and Tetrafluoroethylene (19) are Ethylene's layout (puzzles.js:44-46) with the H's renamed.
   - Halothane (21) is Iodoethane's (20) with the H's and I renamed.

   So 18 and 19 solve move for move like 6, and 21 like 20. This matches the plan ("they add variety, not harder logic") and the spec. Another seed would give a different grid, if variety in shape is wanted too.
2. **note**: page-solved.png and panel-solved.png. The "11 ✓" button is wider, so the 12–15 in its row sit out of line with the rows above and below. This was already so with 13 Puzzles. It shows more now that there are rows under it. It is outside this step.

No must-fix or should-fix findings.

## Outcome

1. Kept: the plan asks for variety of Elements, not of logic; the generator picks the hardest layout it finds, which for these shapes is the same. A different shape would be easier.
2. Kept: outside this step; moved to the backlog when the plan finishes.

The look at Carbon disulfide and Iodoethane in the browser was made before 3b9822d, with and without Bonds: the badge shows on yellow and violet, and the glow as a halo on the dark stage.
