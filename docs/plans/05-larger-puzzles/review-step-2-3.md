# Third review of step 2 of plan 05: The new Puzzles

Commits reviewed: f943d24 (Serine's and Lactic acid's new layouts), 6aa456a (decision 0020, the arguments recorded in the plan, the link from Puzzle.05, and 0002's cost), and 37fc9e4 (the Outcomes). I read and ran them in a separate worktree at 37fc9e4 with `npm install`, and removed it afterwards.

## What was checked

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes: 259 unit tests, 33 e2e tests (2 skipped) and 10 screenshot tests.
- **Structures:** checked by hand from `solution`, at `src/puzzle/puzzles.js:156-162` and `:177-183`.
  - Lactic acid is CH₃–CH(OH)–COOH, C₃H₆O₃.
  - Serine is HOCH₂–CH(NH₂)–COOH, C₃H₇NO₃.
  - Every valence is right in both.
- **One solution, and the empty Dotted lines:**
  - The unit tests check that each Puzzle has exactly one solution (`puzzles.test.js:68`). They also check Puzzle.05, with Lactic acid at exactly 5 (`:84-88`).
  - The generator prints these counts: Lactic acid 5, Serine 6, and the other five 5, 6, 6, 7 and 9.
- **Recorded arguments (`docs/plans/05-larger-puzzles/README.md:33-39`):** I ran `node scripts/generate.js` with all seven rows. Each gives the committed `rows`, `cols`, `atoms` and `solution` exactly.
- **Likeness:** I compared by hand, under turns, flips and shifts. I checked Serine against Alanine, Glycerol, Cysteine and the other 14-Atom Puzzles, and Lactic acid against Alanine, Acetone, Acetic acid, Glycine, Ethanol and Ethyl acetate. I wrote no script, so this isn't an exhaustive search of all 28.
  - Serine against Glycerol, with no turn or shift, is the closest pair I found: 11 of 14 points line up, but only 6 symbols and 6 of 13 Bonds match. That is no closer than Cysteine against Serine, which the second review accepted.
  - Against Alanine, Serine matches at most 5 symbols, and Lactic acid about 2. Neither layout is nearly another Puzzle's.
- **Outcome lines:**
  - review-step-2-2's 1 and 2, and review-decisions' 1 to 6, match the diffs.
  - The old Lactic acid, turned 180°, does have 9 of 12 symbols on Alanine's, as Outcome 1 says.
- **Decision 0020:**
  - It keeps the why, the cost and the alternatives.
  - Its claims match the code and the spec:
    - `findLayout`'s score maximises the empty Dotted lines (`generate.js:92`).
    - Before Puzzle 22, only Alanine leaves as many: it leaves 6, and the others at most 3.
    - With a threshold of 6, exactly Lactic acid and Ethyl acetate drop out.
  - Puzzle.05 and the plan link it, and the index lists it.

## Findings

1. **should fix**: the list in `docs/decisions.md:249` is incomplete. The cost says "In the batch before, Puzzles 18, 19 and 21 are layouts of 6 and 20 with other symbols". Two more Puzzles are earlier layouts with symbols of the same valence:
   - Puzzle 16, Methanethiol (`puzzles.js:117-118`), is Puzzle 5, Methanol, flipped top to bottom, with S for O. All 6 points and all 5 Bonds match.
   - Puzzle 17, Phosgene (`puzzles.js:124-125`), is Puzzle 3, Formaldehyde, flipped left to right, with Cl for H.
   - The cost should name 16, 17, 18, 19 and 21, as layouts of 5, 3, 6, 6 and 20. The alternative "the batch before would need exceptions" then has five exceptions, not three.
2. **note**: in `docs/plans/05-larger-puzzles/review-step-2-2.md:43`, Outcome 1 uses "points" for points with the same symbol. The finding it answers, and this file's "What was checked", use "points" for points that both layouts have an Atom on ("12 of 14 points, 7 symbols").
   - Read that way, the claim fails: Serine shares 11 of its 14 points with Glycerol, with no turn or shift.
   - Read as symbols, the numbers check out where I tested them. Saying "symbols" would avoid the confusion.
3. **note**: `docs/decisions.md:249` says likeness is "checked by hand, with a script". The script isn't committed, and "nearly so" has no measure. The measure used was at most 9 points with the same symbol, and it appears only in an Outcome.
   - The next batch can't repeat the check as it was done. The cost could say this, or give the measure.
4. **note**: `docs/decisions.md:21-22` lists 0020 before 0019. The other entries in the index are in numeric order.
5. **note**: this one is outside these commits. In Ethyl acetate (`puzzles.js:165-169`), the top three rows are Ethanol's layout (`:72-74`) in the same orientation:
   - 8 of Ethanol's 9 Atoms keep their symbols, and 7 of its 8 Bonds are in the same places.
   - The difference: the O bonds down to the acetyl group instead of to Ethanol's H at row 2, column 3.
   - A Player who has solved Ethanol already knows that part. It is a part of the layout, not all of it, so it doesn't break 0020's wording. It is only recorded here.

## Outcome

1. Fixed in 67bd898: 0020 names Puzzles 16, 17, 18, 19 and 21, and five exceptions.
2. Fixed in 67bd898: the second review's Outcome 1 says "points on Atoms of the same valence", which is what the script counted.
3. Fixed in 67bd898: 0020's cost gives the measure, and says the script isn't kept.
4. Fixed in 67bd898: the index is in number order.
5. Kept: Ethyl acetate holds an ethyl group, as Ethanol does, so part of its layout is alike; the whole isn't, and the rest of the Molecule is new.

Only decisions and an Outcome changed, so there is no fourth review.
