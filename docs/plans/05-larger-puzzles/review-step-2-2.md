# Second review of step 2 of plan 05: The new Puzzles

Commits reviewed: 1c2290e (Cysteine's new layout), 645ad7f (the mouse leaves the list before the panel screenshots, and `panel-mystery.png` is made again), da9c327 (the Bonds and arguments in the plan's Design), and c22f803 and 1ea47c9 (Outcome). I read and ran them in a separate worktree at 1ea47c9 with `npm install`, and removed it afterwards.

## What was checked

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes at 1ea47c9.
  - Unit tests: 259 passed.
  - e2e tests: 33 passed and 2 skipped.
  - Screenshots: 10 passed.
- **Outcome lines:**
  - 1: matches 645ad7f. Both panel tests call `page.mouse.move(0, 0)` before the screenshot.
  - 2: matches 1c2290e. Cysteine is now 5×4 and comes from seed 2.
  - 3: matches da9c327.
  - 4 and 5: kept, each with a reason.
- **Cysteine (`src/puzzle/puzzles.js:184-190`):**
  - Checked by hand from `solution`: it is HS–CH₂–CH(NH₂)–COOH, every valence is right, and the formula is C₃H₇NO₂S.
  - The solver finds exactly one solution, and it equals `solution`. 6 Dotted lines are left empty.
  - Under all 8 turns and flips, its points differ from those of all 27 other Puzzles. This holds for every new Puzzle.
  - Against Serine, the best alignment under any turn, flip or shift shares 12 of 14 points, 7 symbols and 6 of 13 Bonds. Before the fix it was 12 symbols and 11 Bonds, so it is no longer Serine turned over.
- **Recorded Bonds and arguments (`docs/plans/05-larger-puzzles/README.md:31-39`):** I ran `node scripts/generate.js` with each of the seven rows. Every one gives the committed `rows`, `cols`, `atoms` and `solution` exactly.
- **`docs/spec/screenshots/panel-mystery.png`, read as an image:**
  - No button is hovered. "8" looks like the other unmarked buttons, and only "3" is marked.
  - Otherwise it matches ui.md:123-130 and :147: "Puzzle 3 of 28" between an enabled ‹ and ›, and "Unsolved".
  - It shows "Mystery molecule", "?" and "Bond every atom to find out what it is."
  - The valence rule text is exact (Panel.04).
  - Undo and Reset are disabled and Show solution is enabled, and there are 28 buttons with no ✓.

## Findings

1. **should fix**: `src/puzzle/puzzles.js:177-183` (Serine, Puzzle 25) against `:90-96` (Alanine, Puzzle 13). The first review missed this, and it comes from 9fa5edf, not from the fixes.
   - Serine's layout is Alanine's in the same orientation, with no turn or flip.
   - The only changes: the H at row 2, col 0 becomes an O, and an H is added at row 3, col 0.
   - All 12 of Alanine's Bonds are in the same places in Serine, and 12 of 13 Atoms keep their symbols. The cause is Serine's Bond text, which is Alanine's with `C3-O3 O3-H2` added, run at the same seed.
   - Like the first review's finding 2, this doesn't break the Design's wording (`docs/plans/05-larger-puzzles/README.md:26`), since there is one more Atom. It does break its intent: a Player who has solved Alanine already knows Serine.
   - No other pair is this close. Among pairs within 3 Atoms of each other, the next closest is Lactic acid on Alanine, with 9 of 11 Bonds.
   - Fix: give Serine a seed whose layout isn't Alanine's plus an OH, and record the new arguments in the plan.
2. **note**: `docs/plans/05-larger-puzzles/review-step-2.md:74`. Outcome 3 says "Fixed in the commit after 645ad7f" instead of naming da9c327. review.md asks for the commit.
   - Also, da9c327 is the commit that marks step 2 `[DONE]` (`README.md:45`), although c22f803's message says it does. Commit messages can't be changed now, so this is only for the record.
