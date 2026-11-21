# Review of plan 05: Larger and harder Puzzles

Commit reviewed: c4afef4 (the plan, its spec changes in `docs/spec/puzzle.md` and `docs/spec/ui.md`, and decision 0019). I read it in a separate worktree, which has since been removed.

## What was checked

- **Backlog item:** the plan covers the removed item, and gives "harder" a checkable meaning.
- **Rule ids:** Puzzle.04 is new and Generate.01 changes; both exist in the spec and don't conflict.
- **Design:** it fits `src/puzzle/generate.js`, `scripts/generate.js`, `src/puzzle/puzzles.js`, `src/ui/board.js` and `src/ui/style.css`, and decisions 0002, 0003, 0018 and 0019.
- **Steps:** every rule id has a step, and each step is split into tests and implementation.
- **Chemistry:** all seven structures match their formulas and the valences (H1 O2 N3 C4 S2). Atom counts are 12, 14, 14, 14, 14, 17 and 19, so "12 to 19" holds.
- **Puzzle.04 on the existing Puzzles:** all 21 pass. The largest Grids are Acetone at 5×4, and Glycine and Acetic acid at 4×5 and 3×5.
- **Empty Dotted lines today:** the "more than any Puzzle before but Alanine" claim holds. Alanine has 6 and every other Puzzle has 3 or fewer.
- **Layouts at 6×5:** `node scripts/generate.js "<bonds>" 20000 6 5 [seed]` found these:

  | Molecule | Seed | Grid | Empty Dotted lines |
  |---|---|---|---|
  | Lactic acid | 1 | 4×4 | 5 |
  | Ethyl acetate | 1 | 6×4 | 5 |
  | Glycerol | 1 | 5×4 | 6 |
  | Serine | 1 | 4×5 | 6 |
  | Cysteine | 1 | 4×5 | 6 |
  | Threonine | 1 | 6×5 | 8 |
  | Valine | 1 to 3 | none found | |
  | Valine | 4, 6, 10, 11 and 8 more of seeds 4 to 40 | 6×5 | 9 |

  Valine had no layout at 5×5 or 6×4 in 20 seeds each.
- **Butane (step 1's test):** with today's defaults it is laid out 3×6, so the new test fails as it should. With 6×5 it is 6×3.
- **Decision 0019's numbers,** measured with Playwright at 390×844:
  - The Board is 332 px wide.
  - At 5 columns a C or O is 34.1 px, or 35.7 px with its stroke ("36").
  - That is 332/535 = 62% of its size at 1280×800.
  - At 6 columns it is 29.8 px ("about 30").
  - A 6×5 Board is 397 px tall, with the bottom of the status line at 566 px.
  - Nothing scrolls sideways.
- **Tests and screenshots the count change breaks:** found by searching `tests/**` for 21 and Halothane. The plan names them all: `ui.test.js`, `check.spec.js`, `puzzle.spec.js`, `narrative.spec.js`, `progress.spec.js`, and the six screenshots. `board.png`, `actions.png` and `board-halothane.png` stay as they are.
- **Facts:** none are in the plan yet, as intended.
- `npm test` passes at c4afef4.

## Findings

1. **should fix**: `docs/plans/05-larger-puzzles/README.md:47` and `:18`. "Harder" is only checked by a test that no spec rule backs. Step 2(a) tests "each new Puzzle leaves at least 5 Dotted lines empty", but Scope leaves any measure of difficulty out of the spec, and no rule id says this. Tests are meant to come from the spec (implement-a-step (a)1, CONTRIBUTING "Testing the spec"). Once the plan is done, the only checkable meaning of "harder" would live in a test that cites no rule. Either:
   - state it as a rule (e.g. in Puzzle.01, or a new Puzzle.05: "Puzzles 22–28 each leave at least 5 Dotted lines empty in their solution"), or
   - drop the test and keep it as a check at implementation time.

2. **should fix**: `docs/plans/05-larger-puzzles/README.md:26`, `docs/spec/puzzle.md:40-41`. With the defaults, Cysteine gets exactly Serine's layout: the same points, with S where Serine has an O (seed 1 for both). S needs 2 Bonds like O (plan 04: "They play like H and O"), so Puzzles 25 and 26 would be the same puzzle twice in a row. The plan should ask for a layout that differs from Serine's. Seed 2 gives a different 5×4 layout with 6 empty Dotted lines.

3. **should fix**: `docs/plans/05-larger-puzzles/README.md:14` vs `:46`. The rule ids in Scope and step 2 don't agree:
   - Scope says Page.01, Panel.03 and List.02 "already speak of the number of Puzzles", yet step 2 names List.02.
   - Step 2 doesn't name Panel.03, though it rewrites the "Panel.03 the last puzzle has no Next puzzle button" test to build Valine.
   - Step 2 doesn't name Page.01, though its screenshots (`page-start.png`, `page-solved.png`) are remade.

   Plan 04's step 4 named all three.

4. **note**: `docs/plans/05-larger-puzzles/README.md:26`, `docs/spec/puzzle.md:37-43`. The order is fixed in the spec table before any layout exists, but the Design orders "by Atoms, then by Dotted lines left empty". Glycerol, Serine and Cysteine tie at 14 Atoms and 6 empty lines, and the tie-break isn't stated. A different seed (e.g. for Cysteine, finding 2) could make the table and the rule disagree. The table should win, or the tie-break should be stated.

5. **note**: `docs/plans/05-larger-puzzles/README.md:5`. Lactic acid (12 Atoms, 5 empty, also at seeds 2 and 3) is smaller and has fewer empty Dotted lines than Alanine (13 Atoms, 6 empty). So "larger and harder" holds against Puzzles 1–21 as a group, not against the hardest one. The text says this ("but Alanine"). This note is only so the threshold of 5 is a deliberate choice.

6. **note**: `docs/decisions.md:236`. The numbers hold (see above). The Why covers only the phone. At 1280×800 a 6-row Board is 640 px tall, and the bottom of the status line lands at 787 px of 800. It fits, but only just, which may be worth saying.

7. **note**: `docs/decisions.md:237`. "Valine … only just has one" is right about size: no 5×5 or 6×4 layout turned up. It overstates how rare a 6×5 layout is, though: 12 of seeds 4–40 find one, each with 9 empty Dotted lines.

8. **note**: `docs/plans/05-larger-puzzles/README.md:44`. Step 1's Puzzle.04 test passes at once, and the plan says so. Expect the step review's "the new tests fail" check to flag it. Generate.01 is a rule about the script, but the step 1 test calls only `findLayout` and doesn't run the script. That is adequate, since the script passes `undefined` for left-out sizes, but a test of the script with no sizes given would match the rule.

9. **note**: `docs/plans/05-larger-puzzles/README.md:48`. "The Board fits a phone" (Puzzle.04, Layout.01) gets only a look by hand at Valine on 390×844. No screenshot or e2e check shows a 6×5 Board on a phone. A small layout check for Puzzle 28 at 390×844 would keep it checked: no sideways scroll, and the status line on screen.

## Outcome

1. Fixed in ae11259: a new rule, Puzzle.05, with an example, in Scope and step 2.
2. Fixed in ae11259: the Design asks that no new layout is an earlier one with only the symbols changed, Cysteine's not Serine's. (Seed 4 gives Cysteine a different 4×4 layout with 7 empty Dotted lines.)
3. Fixed in ae11259: step 2 names Page.01, Panel.01, Panel.03, List.01 and List.02, and Scope says why.
4. Fixed in ae11259: the table's order wins, as judged when it was written.
5. Fixed in ae11259: the plan says why the threshold is 5.
6. Fixed in ae11259: 0019 says a 6-row Board fits at 1280×800 too, if only just.
7. Fixed in ae11259: 0019 says Valine has layouts only on the full 6 by 5.
8. Fixed in ae11259: step 1 tests the script with no size given; the Puzzle.04 test passing at once is expected, as the plan says.
9. Fixed in ae11259: an end-to-end layout test of Puzzle 28 on a phone, with Layout.01 in Scope.

Only the plan, the spec and a decision changed; the step reviews check the rest.
