# Review of step 7 of plan 07: the new Puzzles

Commits reviewed: 7b2e8d0 (tests: rules, Board, storage and Glue), 53b2bcb (tests: `puzzles.test.js` and `removed.test.js`), 0db47f8 (tests: end-to-end, narrative and screenshots) and 0582518 (implementation and remade screenshots), range 2ef3d64..0582518. I ran 0582518 in one `git worktree` and the three tests commits in a second, with `npm install` in each. I have removed both worktrees. The main checkout was not touched.

## What was checked

- **Checks.** At 0582518, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0:
  - 216 unit tests in 16 files pass.
  - 34 e2e tests pass. The 3 skipped are the phone-only tests in the desktop project.
  - 10 screenshot tests pass, run in podman.
- **The new tests fail at each tests commit, for the expected reasons.**
  - **7b2e8d0:** 55 tests fail and 193 pass.
    - Most failures are `puzzle("acetonitrile")`, `puzzle("morpholine")` and the others returning undefined.
    - The rest are the old layouts: Acetic acid drawn with H Atoms, "no candidate Bond between 2,1 and 2,2", "Solved 0 of 20", "Hydrogen already has all its bonds.", "Board, 3 by 5".
    - The hydrogen-count check gets NaN, because the old Atoms have no fourth item.
    - These pass, as they should: the tests on the made-up crossing Grid (`game.test.js:93`, `:153`, `grid.test.js:178`), since the rules already exist; and the Progress.03 tests in `progress.test.js`, since the storage doesn't check ids.
  - **53b2bcb:** 25 of 86 fail.
    - The table gets `Water H2O 2…`.
    - Puzzle.07 fails once per old Puzzle, 20 times.
    - Puzzle.04 gets "Ethyl acetate 6, 4".
    - Puzzle.08 gets loops `[0,0,0]`.
    - Acetic acid's hydrogens are `undefined`.
    - The removed list has 8 entries, not 24.
    - These pass on the old Puzzles: the schema test (H and 3 items were still allowed), "exactly one solution" (`h ?? 0`) and the id/formula guard.
  - **0db47f8, e2e:** 30 fail, 4 pass, 3 skipped.
    - The failures are "Puzzle 1 of 20", "It's Water/Formaldehyde/Alanine/Urea…", and timeouts on Bonds the old layouts don't have.
    - The two Layout.01 tests pass, unchanged. So do the two phone tests for Glucose and Citric acid (see finding 3).
  - **0db47f8, screenshots:** 8 fail. `board-glucose.png` doesn't exist yet, and the other images differ.
    - `page-start.png` and `page-phone.png` pass. Their tests are unchanged, and only the images change in 0582518.
- **The layouts match the plan's table.** I ran `node scripts/generate.js "<bonds>" 100000 6 5 1` for all 15 rows. For each Puzzle, the `rows`/`cols`, `atoms` and `solution` it printed are in that Puzzle's entry in `src/puzzle/puzzles.js`, checked by string match.
  - The printed difficulties are 2, 3, 7, 11, 11, 11, 12, 12, 13, 13, 17, 21, 21, 26, 27, the spec's table.
  - Within each difficulty, the new Puzzles come after the old ones: Glycerol before Morpholine and Cyclohexene, Serine before Cyclohexanol.
- **removed.js.**
  - It holds the 8 entries that were already there, then the 16 removed now, in the order of the spec's table (puzzle.md:39–62).
  - Each of the 16 entries is byte-for-byte the same as its entry in `puzzles.js` at 2ef3d64.
  - The only other change is the header comment.
  - The 4 Puzzles kept (Acetic acid, Glycine, Glycerol, Serine) keep their facts.
- **Schema.**
  - H is gone from the Elements.
  - There is a fourth item, 0 to 3, and `minItems` is 4.
  - The example in schemas.md is the same as Acetonitrile in `puzzles.js`, fact included.
- **Facts.**
  - Morpholine, Malic acid, Tartaric acid and Glutamic acid are true and brief.
  - Cyclohexene and Cyclohexanol: see findings 1 and 2.
  - The ones not new (Acetonitrile from schemas.md; Cyclohexane-1,4-dione, 1,4-Benzoquinone, Glucose and Citric acid from the prototype) are true.
  - Glucose's "ring of five carbons and an oxygen" is the layout's ring.
- **Each example against its test.** For each, the test uses the spec's Puzzle, places and expected result:
  - **Puzzle.01, Puzzle.02** (Acetic acid start and solution): `game.test.js:20`.
    - Puzzle.01 is also covered by the table in `puzzles.test.js:18`, the formula and hydrogens at `:48`, and the one solution at `:61`.
  - **Puzzle.03** (Acetonitrile, `[[0,1,1]]` with `[[]]`, then `[[0,2,1]]`): `game.test.js:43` and `:81`.
  - **Puzzle.04:** `puzzles.test.js:70`.
  - **Puzzle.05:** `difficulty.test.js:5`. Morpholine is at `:14`.
  - **Puzzle.06:** `removed.test.js:42`.
  - **Puzzle.07:** `game.test.js:101` and `puzzles.test.js:76`.
  - **Puzzle.08:** `difficulty.test.js:10` and `puzzles.test.js:80`.
  - **Grid.01:** `grid.test.js:11`.
  - **Grid.02:** the made-up Grid at `grid.test.js:26`, and Glycine at `:33`.
  - **Bond rules:**
    - Bond.01–03, four clicks giving `│ ║ ⦀ ·`: `game.test.js:124`.
    - Bond.04: `:140`. Bond.05, on the made-up Grid with its drawing: `:153`. Bond.06: `:166`.
    - Bond.08: `:176`. Bond.08 and Bond.09: `:187`. Bond.10: `:216`. Bond.11: `:240`.
  - **Valence.01, Valence.02:** `game.test.js:265`.
  - **Check rules:**
    - Check.01 and Check.02: `game.test.js:279`.
    - Check.03, with the spec's drawing: `:286`.
    - Check.04, on Glycine: `:302`.
  - **Help.01, Help.02** (Serine): `game.test.js:348` and `check.spec.js:98`.
  - **Progress rules:**
    - Progress.01: `puzzle.spec.js:67`.
    - Progress.03: `progress.test.js:49` and `puzzle.spec.js:80`, which also checks that Puzzle 1 opens.
    - Progress.05: `progress.spec.js:5`. Progress.06: `progress.spec.js:52`.
  - **Board.04:** word for word at `board.test.js:112`.
  - **Input and Messages:**
    - Input.01 and Input.02: `bonding.spec.js:36`. Input.05: `reset.spec.js:4`.
    - Messages.01: `check.spec.js:8`. Messages.02: `bonding.spec.js:19` and `ui.test.js:57`.
  - **Panel.01:** `puzzle.spec.js:32`.
  - **List.01, List.02:** `ui.test.js:85` and `puzzle.spec.js:46`.
  - **The narrative:** `narrative.spec.js`. It covers the three hydrogens on Puzzle 1, the OH that already has all its bonds on Serine, and "Solved 3 of 15".
  - **The spec README's Glycine drawing:** `draw.test.js:13`.
  - **The screenshots:** Page.01, Board.01, Board.02, Panel and List. See below.
- **Screenshots against ui.md.** I looked at each remade image.
  - **`board.png`, Acetic acid with C═O:**
    - The CH₃'s three hydrogens are below-left, below-right and above-left, and the OH's one is below-left.
    - Each badge is at the top right, clear of the above-left hydrogen.
    - Only the complete O glows. The hydrogens don't.
  - **`board-glucose.png`:**
    - All 12 Atoms are in the layout's places.
    - The badges are right: 1, 3, 2, 3, 2 and 1.
    - CH₂'s two hydrogens and the OH's below-left one at row 3 are close but clear of each other.
  - **`page-solved.png`:** Glycine's Atoms glow, and their hydrogens don't. The screenshot test also checks that the hydrogens' computed animation and filter are `none`.
  - **The panels and `list.png`:** 15 buttons in 3 rows of 5 (6 per row on the phone), "of 15", and rule 4 with no-break spaces.
  - `actions.png` is unchanged and still passes.
- **The two notes from step 5.**
  - **Note 2, the page's height:**
    - `page-start.png` is now 800 px tall (it was 814), so Puzzle 1 at 1280×800 doesn't scroll.
    - `page-solved.png` is about 900 px (it was 942), back to its height before step 5.
  - **Note 3, the hydrogens' look:** it is now shown in `board.png`, `board-glucose.png`, `page-start.png`, `page-solved.png` and `page-phone.png`.
- **Design.**
  - Only `puzzles.js`, `removed.js`, the schema and the screenshots changed in 0582518.
  - The tests were changed only in the files the step names, plus `grid.test.js`, `messages.test.js` and `puzzle-list.test.js`, for their ids and examples.
  - `difficulty.test.js`'s Water test is gone.
  - The default `h = 0` in `game.js` and `solver.js` stays. The made-up Atoms in `solver.test.js` still rely on it, which the Design allows.
- **Commits.** All four follow Conventional Commits and carry no attribution.

## Findings

1. **should fix**: `src/puzzle/puzzles.js:59`. Cyclohexanol's fact says "Most cyclohexanol is turned into adipic acid".
   - Cyclohexanol is made mostly as KA oil. Much of it is dehydrogenated to cyclohexanone for caprolactam, which is nylon 6, not 6,6.
   - That a majority goes to adipic acid isn't clearly true, and the facts should be.
   - Dropping "Most" would make it safe, for example "Cyclohexanol is turned into adipic acid, one of the two building blocks of nylon 6,6." Saying it goes "into nylons" would also work.
2. **note**: `src/puzzle/puzzles.js:45`. Cyclohexene "turns it clear". Bromine water is already clear: the test turns it colourless. "Colourless" is the usual wording, and the one school chemistry asks for.
3. **note**: `tests/e2e/layout.spec.js:21`. The phone tests "Glucose's, the widest" and "Citric acid's, the tallest" open Puzzles 14 and 15 by number, and check neither the name nor the Grid.
   - At 0db47f8 they passed on the old Puzzles 14 and 15.
   - At 0582518 they hold, because `puzzles.test.js:70` pins Glucose and Citric acid at 14 and 15, with 3×5 and 6×3 Grids.
   - Checking `#counter` or the Board's name ("Board, 3 by 5") in the test itself would make it stand alone.
4. **note**: no screenshot or test shows Citric acid, the tallest Board, at 1280×800. Decision 0019 says a 6-row Board fits "if only just". I worked it out from `CELL`/`PAD`/`SCALE` and the page-start geometry:
   - The Board is 640 px tall, and the stage 666 px.
   - The status line ends at about 788 px, so the Board and its status line fit on the screen.
   - The page is about 804 px tall, so it scrolls by about 4 px. Layout.01 allows that.
   - A solved Puzzle's panel already makes the page scroll, at about 900 px.
5. **note**: there is no screenshot of Glucose on a phone, the case the step asks to look at. I judged it from the layout tests, which pass, and from the numbers:
   - At 5 columns the Board is scaled to about 62% of its computer size (decision 0019).
   - So a hydrogen is a ball about 13 px across, with an "H" of about 7 px (9 px × 1.25 × 0.62).
   - They can't be tapped, so only readability matters, and that small "H" is marginal. A look on a real phone, or a screenshot of Glucose at 390×844, would settle it.
   - Citric acid, at 3 columns, is drawn at full size on the phone.
6. **note**: `tests/e2e/puzzle.spec.js:67`. The Progress.01 example says "Puzzle 2 is open, with no Bonds", but the test checks only the counter, the solved button and what is stored. This was already so before this step.

No must-fix findings.

## Outcome

1. Fixed in 90b4a18: "Cyclohexanol is turned into adipic acid, one of the two building blocks of nylon 6,6."
2. Fixed in 90b4a18: "turns it colourless".
3. Fixed in 90b4a18: each phone test checks its Board's name, "Board, 3 by 5" and "Board, 6 by 3".
4. Kept: the Board and its status line fit at 1280×800, and Layout.01 allows the page to scroll up and down by a few pixels.
5. Kept: a screenshot of Glucose at 390×844, taken by hand and not kept, shows each small H readable, if small; the hydrogens can't be tapped.
6. Fixed in 90b4a18: the test checks that Puzzle 2 opens with no Bonds, by its status line.
