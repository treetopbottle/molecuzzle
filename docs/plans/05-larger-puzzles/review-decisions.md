# Review of the decisions, plan 05

Commits reviewed: the work of plan 05, `c4afef4..1ea47c9`. I read everything at `1ea47c9` in a separate worktree and removed it afterwards. The previous decisions review was `docs/plans/04-halogens-and-sulfur/review-decisions.md`.

## What was checked

- **0019 against the code and the spec:**
  - `findLayout` defaults to `maxRows = 6, maxCols = 5` (`src/puzzle/generate.js:19`), as Generate.01 (`docs/spec/puzzle.md:82`) and the comment in `scripts/generate.js` say.
  - Puzzle.04 (`puzzle.md:12`) and its test hold for all 28 Puzzles. Valine is 6×5.
  - "has layouts only on the full 6 by 5" agrees with the plan review's search (no 5×5 or 6×4 layout in 20 seeds each).
  - "the hex grid in the backlog" exists (`docs/plans/README.md:19`).
- **0019's numbers, measured with Playwright (Chromium) on the built page with Puzzle 28 open:**
  - At 390×844 the Board is 332 px wide and 397 px tall. A C is 34.1 px across, about 36 with its stroke. That is 62% of its 55 px at 1280×800, and about 30 px at 6 columns. The status line ends 502 px below the top of the stage, and nothing scrolls sideways.
  - At 1280×800 the Board is 535×640 px. With the page at the top, the status line ends at 786.5 px of 800. All of these match the decision.
- **0002, 0003 and 0018, where plan 05 touches them:**
  - Puzzles 22 to 28 come after Halothane, in the order of the spec's table, with a batch comment at `src/puzzle/puzzles.js:155`.
  - 0003's partial-supersede note and 0018's Cost are still true.
  - 0019 cites 0002's Cost correctly.
- **Possibly missing decisions:** the threshold of 5 in Puzzle.05, what "harder" means, the generator's new defaults (covered by 0019's first sentence and its Why), the rule that no two layouts are alike, and the order within the batch.
- **The whole file, briefly:**
  - Every entry has a Why, a Cost and Alternatives.
  - The index lists 0001–0013 and 0015–0019 once each, under fitting categories, with titles that match the headings. Line 5 explains why there is no 0014.
  - Plan 05 changed only 0019's Why and Cost (and 0001 and 0011 from plan 04's review). They are fixed in place and keep the choice.
- `npm test` passes at `1ea47c9` (259 tests).

## Findings

1. **should fix**: `docs/spec/puzzle.md:13` (Puzzle.05), with the reason only in `docs/plans/05-larger-puzzles/README.md:5`. The spec says the rule: at least 5 empty Dotted lines for Puzzles 22–28. Why that is the measure of "harder", and why the number is 5, is written only in the plan, which stops being read once it is done. The reason is that 5 lets Lactic acid open the batch; at 6, Lactic acid and Ethyl acetate (both 5) would drop out. 0019's Why touches the measure ("with more Dotted lines left empty") but not the threshold. Several things are written nowhere outside the plan:
   - Cost: Lactic acid (12 Atoms, 5 empty) is easier than Alanine (13 Atoms, 6 empty), so the batch isn't harder than every earlier Puzzle. The rule is also tied to Puzzle numbers, so each later batch needs its own rule.
   - Alternatives: a higher threshold, Atom count alone, a difficulty from the solver, or a difficulty shown to the Player (left out in the plan's Scope).

   This needs a new decision, or a sentence added to 0019.

2. **should fix**: `docs/plans/05-larger-puzzles/README.md:26`. "No two of them, nor any with an earlier Puzzle, are the same layout with only the symbols changed" is written only in the plan's Design. Step 2's review stretched it to turns and flips (fixed in `1c2290e`). It is a choice about which Puzzles to publish, and it applies to every future batch: S plays like O, and the halogens like H. But no decision or rule says it, and no test checks it. It needs a decision, or a rule in Puzzle.01 with a test.

3. **note**: `docs/decisions.md:223` (0018) and `README.md:26`. Batch 05 doesn't follow the order the plan states ("by Atoms and then by Dotted lines left empty"). By the layouts' Dotted lines, counted by hand, Serine leaves 7 empty and Cysteine, after `1c2290e`, leaves 6, so Cysteine would come first. The plan's "as judged when it was written" covers this, and plan 04's review kept "easiest" as a judgement (its finding 3). So this is only a record that the Design's sentence no longer describes the result.

4. **note**: `docs/decisions.md:236` (0019, Why). "At 1280×800 it fits too, if only just" holds with the page at the top. But the last row of the list is now below the fold (the page is 875 px tall). Opening Puzzle 28 from the list scrolls the page by 75 px, so the top edge of the stage goes just above the screen; the Board itself starts about 2 px from the top. Worth a word if "fits" is meant after opening the Puzzle.

5. **note**: `docs/decisions.md:61` (0002, Cost). "Bigger Grids (13 Atoms for Alanine)" is now a small example: Valine has 19 Atoms on 6×5, which is the case 0019 cites this Cost for. This can be corrected in place, as the choice stays.

6. **note**: process, not a decision.
   - No commit in the range does finish-a-plan step 1 for plan 05: nothing moves plan content into the spec, the decisions or the backlog. Findings 1 and 2 are what such a step would move.
   - `docs/plans/05-larger-puzzles/review-step-2.md:78` links `review-step-2-2.md`, which doesn't exist at `1ea47c9`, while step 2 is marked `[DONE]` (`README.md`, step 2). The plan shouldn't be set Done until that second review is in.

## Outcome

1. Fixed in 6aa456a: decision 0020 gives the measure, the threshold of 5, its cost and the alternatives; Puzzle.05 links it.
2. Fixed in 6aa456a: 0020 also says no layout is another's or nearly so, turned, flipped or with other symbols, and that it is checked by hand; the plan's Design links it.
3. Fixed in 6aa456a: the Design says the table goes by Atoms, and those with as many keep the table's order.
4. Kept: "fits" is meant with the page at the top; after opening from the list the Board is still in view.
5. Fixed in 6aa456a: 0002's cost names Valine's 19 Atoms.
6. Fixed: findings 1 and 2 move the plan's choices into the decisions, which is finish-a-plan's step 1; the plan has no other leftovers. The second review of step 2 is in, and its fixes have a third review before the plan is set Done.
