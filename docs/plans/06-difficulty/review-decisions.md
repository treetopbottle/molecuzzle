# Review of the decisions, plan 06

Commits reviewed: the work of plan 06, `81c411b..65edaab` ("docs: move the leftovers of plan 06 into the backlog"). I read everything at `65edaab` in a separate worktree and removed it afterwards. The previous decisions review was `docs/plans/05-larger-puzzles/review-decisions.md`.

## What was checked

- **0021 against the code and the spec:**
  - The formula, Dotted lines + 2 × empty, is the same in `src/puzzle/difficulty.js` and Puzzle.05 (`docs/spec/puzzle.md:13`).
  - `src/puzzle/puzzles.js` is in order of difficulty (2 to 45), and `tests/unit/puzzle/puzzles.test.js` checks this.
  - Every tie keeps the old order: Water before Hydrogen cyanide, Urea before Halothane, and Glycerol, Serine, Cysteine. This matches "a tie goes to the Puzzle that was there first" and Puzzle.01.
  - The generator prints the difficulty (`scripts/generate.js:36`).
  - No Puzzle's atoms, solution or fact changed. The 28 old entries are exactly the 20 in `puzzles.js` plus the 8 in `removed.js`.
- **0022 against the code and the spec:**
  - `removed.js` holds the eight Puzzles, in the spec table's order.
  - `removed.test.js` checks the id and the formula (as Atom counts, so an isomer is kept out too), and that each removed Puzzle has exactly one solution, its own.
  - The score counts only Puzzles in the game: `src/ui/ui.js:54` filters `puzzles`, as List.02 says.
  - Ids the game no longer knows stay in Progress. `read()` in `src/storage/progress.js` keeps any `"solved"` id and any valid board entry, and `app.js` saves by spreading Progress. So the citation of Progress.01 and Progress.03 holds.
  - I worked out the difficulties of the removed Puzzles by hand. Methanethiol and Methanol are both 8, and Iodoethane and Halothane are both 13. These agree with the spec's "why" column.
- **The notes on 0003, 0018 and 0020:** whether each is right, and whether 0020's text that is now false is covered.
- **0002, 0008, 0016 and 0019, where they relate:** 0002 still names Alanine's 13 Atoms and Valine's 19. 0008's test now also covers the removed Puzzles. Removing Puzzles changes no format, so the key stays, as 0016 says. 0019's Why ("more Dotted lines left empty") fits the measure.
- **The whole file, briefly:**
  - Every entry has a Why, a Cost and Alternatives.
  - The index lists 0001–0013 and 0015–0022 once each, in number order within each category, with titles that match the headings.
  - The entries are in number order below the index.
- `npm test` passes at `65edaab` (230 tests).

## Findings

1. **should fix**: `docs/decisions.md:252` (0020, Alternatives). "A test that no two layouts are alike: the batch before would need five exceptions" no longer holds. 0022 broke all five pairs: Methanethiol, Phosgene, Vinyl chloride, Tetrafluoroethylene and Iodoethane are removed, and Halothane no longer has a twin. So the reason given for checking look-alikes by hand, with no test, is gone. 0020's note covers only the threshold and the removal, and no decision says why there is still no test. Either a note on 0020 or a line in 0022 should give the new reason, or the test should be planned.

2. **should fix**: `docs/decisions.md:259` (0021) and `docs/plans/README.md:23`. 0021 replaced 0020's bar for new Puzzles (at least 5 empty). Now a new Puzzle just "goes where its difficulty puts it", and nothing in the decisions or the spec sets a lower bound. 0022's Why ("without a long stretch of Puzzles that teach nothing new") is the reason the eight were removed, but no decision applies it to new Puzzles. The backlog's Iodine item already assumes a rule: "with difficulty enough to earn its place". Which Puzzles may be added (not too easy, teaching something new, unlike the others) is a choice that isn't obvious, and it has no decision. Only the formula check stops the eight themselves.

3. **note**: `docs/decisions.md:246`, `:248` and `:251` (0020). The note "removes the look-alikes of the batch before" is right in substance, and it covers the false "they stay". Three details:
   - 0020's numbers are those from before plan 06. "Puzzles 22 to 28" and "16, 17, 18, 19 and 21 are the layouts of 5, 3, 6, 6 and 20" now read against a list of 20 where 5 is Acetic acid and 20 is Valine.
   - Of the pair 20 and 21, it is the older Puzzle, Iodoethane, that was removed, and Halothane stays.
   - The link `[Puzzle.05]` at `:248` now points to the difficulty rule, which no longer says "at least 5": the rule id was reused.

   Adding "(numbers before plan 06)" to the note would be enough.

4. **note**: `docs/decisions.md:270` (0022). It says the three were removed for having "almost nothing to rule out", but Ammonia, Carbon disulfide and Chloroform have no empty Dotted line at all (difficulty 3, 2 and 4), as the spec's table says (`docs/spec/puzzle.md:43-45`). Water, Hydrogen cyanide and Formaldehyde have none either, and they stay. Only the Why's "single, double and triple Bonds" says why: they are the tutorial. Saying "nothing to rule out, beyond the first Puzzles that teach each kind of Bond" would make the line between kept and removed clear.

5. **note**: `docs/decisions.md:70` and `:224` (0003, 0018). Both notes are right. 0018 is fully superseded, and 0021's Alternatives give its trade-off. In effect 0021 puts back 0003's "easiest first", now measured instead of judged. "Partly superseded by 0018, and that by 0021" is accurate, though it might read better as "restored by 0021".

No must-fix findings.
