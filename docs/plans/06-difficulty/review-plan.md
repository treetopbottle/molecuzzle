# Review of plan 06: Puzzles in order of difficulty, and fewer easy ones

Commit reviewed: 81c411b (the plan, its spec changes, and decisions 0021 and 0022). Read in a separate worktree at 81c411b, which has since been removed. `npm test` at 81c411b: 259 passed.

## What was checked

- **Coverage of the request.** The score is defined, documented and given to every Puzzle. The list is sorted by it. Eight easy Puzzles are removed and kept for reference. A test stops them coming back.
- **Rule ids.** Puzzle.05 and Puzzle.06 exist in the spec and don't conflict with other rules. Every rule id has a step, and both steps are split into tests and implementation.
- **Fit with the code.** The UI counts solved Puzzles by `puzzles.filter(...)` and opens Puzzles by id, so it needs no change. Storage keeps ids the game doesn't know.
- **Difficulty table.** Recomputed from `src/puzzle/puzzles.js` as candidate Bonds + 2 × (candidate Bonds − solution length). All 28 values match. The order of the 20 Puzzles matches, with ties in the current order (Water/HCN, Urea/Halothane, Glycerol/Serine/Cysteine). The plan's "new numbers" list matches too.
- **Renumbered examples.** Formaldehyde H 1,1–C 2,1 and C 2,1–H 2,2 are Dotted lines. After H–C, the status is still "open, with 3 Atoms" (C, H, O), which matches Check.02, Messages.01 and the `open: 3` in app.test.js. The ids and Board indexes in Progress.01, Progress.05 and the schemas example are right. The narrative's "four Puzzles solved" still holds. The Puzzle.05 example (Glycine 12 + 2 × 3 = 18) and the Generate.01 example (difficulty 2) are right.
- **Halothane drawing** in `docs/spec/README.md`. Checked against its layout, its solution (the empty lines are F–Cl and F–Br) and the two-character drawing rule: it is correct.
- **Removed Puzzles table.** The look-alike claims hold, with Phosgene a mirror of Formaldehyde and Methanethiol a flip of Methanol. No kept Puzzle has a removed formula.
- **Decisions.** 0021 and 0022 each give why, cost and alternatives. The supersede notes on 0003, 0018 and 0020 are there, and both new decisions are in the index under Game.
- **Tests that break.** Searched `tests/` for `openPuzzle` numbers, `PUZZLES[...]`, ids of removed Puzzles, and "of 28".

## Findings

1. **must fix**: `docs/plans/06-difficulty/README.md:37` leaves `tests/unit/puzzle/game.test.js` out of step 2(a). That file uses `puzzle("ammonia")` at lines 168, 201, 222, 300 and 304, in the Bond.08, Bond.08/09, Bond.09, Check.01 and Check.02 tests. Once Ammonia is removed, `createGame(undefined)` throws. These are the unit tests for spec examples the plan moved to Formaldehyde, and the Bond.08 tests at lines 172–180 and 207–215 have Ammonia drawings as their snapshots.
2. **should fix**: the plan never says that the old Puzzle.05 test goes. `tests/unit/puzzle/puzzles.test.js:84-88`, "Puzzle.05 Puzzles 22 to 28 each leave at least 5…", checks a rule the spec no longer has. After step 2 it reads `PUZZLES[21]`, which doesn't exist in a list of 20. Step 1(a) or 2(a) (`README.md:34`, `:37`) should name it as removed or replaced.
3. **should fix**: `README.md:23` still gives "Puzzle 11, Glycine" as the Puzzle example, and Glycine is now Puzzle 12. The plan's Scope (`docs/plans/06-difficulty/README.md:12`) doesn't list it.
4. **should fix**: `docs/architecture.md` (the Puzzle section) gets `difficulty.js` in step 1(b), but no step adds the new `removed.js` (`docs/plans/06-difficulty/README.md:25`, `:38`). It should be added with a note like the one for `solver.js` and `generate.js`: not part of the game, used by the tests.
5. **note**: `tests/unit/ui/ui.test.js:37` (`show(1); // Ammonia`) and `:113` (`show(8); // Urea`) still pass on the new list, but would then open Hydrogen cyanide and Halothane. The plan's note on this file (`README.md:37`) mentions only "the count, 20", so these two comments would go stale.
6. **note**: `docs/spec/puzzle.md:9` and `docs/decisions.md:259` say "in the order they were added" for ties. Once the batch comments go from `puzzles.js`, nothing in the code records that order. Saying "a new Puzzle goes after those of the same difficulty" would make the rule checkable later.
7. **note**: at `docs/decisions.md:273`, 0022 cites [0016](#0016) for "an id the game no longer knows". 0016 is about the storage key. What keeps unknown ids is Progress.01 and Progress.03 (`docs/spec/storage.md`). Also, `ui.md` List.02 doesn't say that k counts only Puzzles in the game, and 0022's "can go down" relies on that. The code does count that way (`src/ui/ui.js:54`).
8. **note**: at `docs/spec/puzzle.md:43`, "Water again, with one more H" isn't Water's layout. Ammonia's real reason is the one given for Carbon disulfide and Chloroform: no empty Dotted line, nothing to rule out.
9. **note**: Puzzle.06's formula check (`docs/spec/puzzle.md:14`) compares strings, so it holds only while formulas are written in Hill order, as all 28 are now. `formulaCount` from `puzzles.test.js` would compare the Atoms themselves.
10. **note**: the plan names the Puzzle.05 example twice, in step 1(a) in `difficulty.test.js` (`README.md:34`) and in step 2(a) "on Puzzle 12" in `puzzles.test.js` (`README.md:37`). It is unclear whether both are wanted or which test carries the rule id.
