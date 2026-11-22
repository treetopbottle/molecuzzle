# Review of the decisions, plan 07

Commits reviewed: the work of plan 07 up to d66838b ("docs: move the leftovers of plan 07 into the backlog"), centred on the decisions it added or edited: 0023 and 0024 (65502cb, e49d056, 94652c6, 0266c89), and the notes on 0002, 0016, 0021 and 0022. I read everything at d66838b in my own `git worktree` and removed it afterwards. The previous decisions review was `docs/plans/06-difficulty/review-decisions.md`.

## What was checked

- **0023 against the code and the spec:**
  - Puzzle.07 (`docs/spec/puzzle.md:15`), Valence.01 (`:286`) and the valence table note (`:171`) match the rule.
  - The schema has a fourth item, 0 to 3, and no H (`docs/spec/schemas/puzzle.schema.json`).
  - `STORAGE_KEY` is `molecuzzle-v3` (`src/storage/progress.js:2`), and nothing removes the old key. So "what is under the old key stays in the browser" holds.
  - `removed.js` keeps the 16 as they were, with H Atoms. `removed.test.js` checks only ids and formulas, as the Cost says.
  - The prototype `prototypes/implicit-hydrogens.html` exists.
  - The Why says 105 H across the 20 Puzzles before: `git show 2ef3d64:src/puzzle/puzzles.js` has 105 `["H"` Atoms in 20 entries. Adding Halothane's 5 one-Bond Atoms (F₃, Cl, Br) gives the 110.
  - I couldn't check "97 … nearest Atom" or "solved 12 of the 20" without the scripts, which aren't kept.
- **0024 against the code and the spec:**
  - The formula `dotted + 2 * loops`, with loops = dotted − atoms + 1, is the same in `src/puzzle/difficulty.js`, Puzzle.05 (`puzzle.md:13`) and the generator's comment (`scripts/generate.js:39`).
  - Puzzle.08 (`puzzle.md:16`) is tested at `tests/unit/puzzle/puzzles.test.js:80`, with loops `[0, 0, 1]` for the tutorial.
  - "For a Molecule with no ring the two are the same" holds: a tree has atoms − 1 Bonds, so its empty lines equal its loops.
  - The argument that no ring of 3 Atoms fits holds: two Atoms in a row and a third in the first one's column share no line with each other, and three in a row aren't neighbours.
  - The Cost on S and the halogens matches the spec's removed table (`puzzle.md:57–63`) and the backlog (`docs/plans/README.md:25`).
- **The notes:**
  - 0002 is fully superseded by 0023.
  - 0016's note (`:204`) points to `molecuzzle-v3`.
  - 0021's note (`:259`) says 0024 counts loops.
  - 0022's note (`:270`) says 0024's 2 loops apply after the tutorial.
  - 0003's note still holds.
- **Other decisions that name H on the Grid, empty Dotted lines, 20 Puzzles or Puzzles now removed.** I searched for these in the whole file: 0019, 0020, 0022 (see the findings). 0001, 0008, 0011, 0012 and 0017 still hold.
- **Index.** 0023 and 0024 are listed under Game, in number order, and their titles match the headings.
- **Choices in plan 07 that have no decision.** I compared the plan's Design, Scope and "Left out" with the decisions.
- **The leftovers commit d66838b:**
  - The solver-difficulty item matches 0024's Alternatives and the plan's "Left out".
  - The "1 loops" item is true: `scripts/generate.js:39` always prints "loops", and it was kept at review-step-4 Outcome 3.
  - Every "Kept" outcome in plan 07's reviews is either done in step 7 or explained.
  - The other "Left out" items are in the backlog (S/halogens at `:25`) or in 0023 (Progress isn't moved).

## Findings

1. **should fix**: `docs/decisions.md:250` and `:252` (0020), and `docs/plans/README.md:24`. The look-alike rule says "with other symbols of the same valence". With hydrogens on their Atoms, what makes two layouts play the same is what each Atom needs: its valence minus its hydrogens.
   - CH₂, NH and O all need 2. Morpholine and 1,4-Dioxane differ only in NH for O, and plan 07 calls them look-alikes (`docs/plans/07-hydrogens-on-atoms/README.md:58`). Under "same valence" (N 3, O 2) they wouldn't be.
   - The Why's example "Cl for H" no longer applies, since H isn't on the Grid.
   - The current 15 have no such pair. I checked the 3×2 and 4×2 groups by hand by need, and the 3×4 Puzzles have different Atom counts. But the rule, and the backlog test that would carry it out, should say "of the same need (valence minus hydrogens)". 0020's note could say this is because of 0023.
2. **should fix**: `docs/decisions.md:286–287` (0023). The Cost says Players start again, and the plan's "Left out" sends "Moving today's Progress to the new key" to 0023. But 0023 gives no alternative or reason for it.
   - 0016's own Alternatives name the option: "unless the new build reads the old key".
   - The ids `acetic-acid`, `glycine`, `glycerol` and `serine` still exist. Only the Boards changed meaning, so carrying over just the solved marks was possible.
   - Why not do that (for example, a ✓ for a layout the Player never built, or code kept for 4 marks) is a choice that isn't obvious, and it belongs in 0023's Alternatives.
3. **should fix**: no decision or backlog item says that no Puzzle now has crossing Dotted lines.
   - The plan states it (`docs/plans/07-hydrogens-on-atoms/README.md:58`). I confirmed by hand on the largest Grids, Glucose, Citric acid and Malic acid: no row line spans an empty point.
   - So Bond.05 (`docs/spec/puzzle.md:212`) and the "Bonds can't cross." message (Messages.02, `docs/spec/ui.md:92`) never happen in the game. Rule 3 of the panel (`src/ui/panel.js:9`) tells the Player a rule no Puzzle uses.
   - 0024 still counts "a Bond rules out the lines it crosses" among the obvious moves.
   - Either a decision saying the rule stays for later Puzzles, and why the panel keeps it, or a backlog item for Puzzles with crossing lines, should record this. Before plan 07, the Grid.02 example was on a real Puzzle.
4. **should fix**: `docs/decisions.md:241–242` (0019) has no note, but parts of it no longer hold after 0023 and 0024:
   - "with more Dotted lines left empty" is 0021's old measure. The measure is now loops.
   - "Valine, with 19 Atoms, has layouts only on the full 6 by 5": with its hydrogens on its Atoms Valine has 8 Atoms, and it is removed.
   - "([decision 0002](#0002)'s cost)" points to a superseded decision whose cost, Grids made bigger by H Atoms, is gone.
   - The 6×5 limit still matches the code and Puzzle.04, and the pixel numbers still hold (`CELL`/`PAD`/`SCALE` haven't changed since plan 02). Only the reasons are stale. A note "partly superseded by 0023/0024" with the new example would do.
5. **should fix**: `docs/decisions.md:272` and `:275` (0022), and `docs/spec/puzzle.md:62–63`. Since plan 07, some Puzzles are removed for one layout, not for being the Molecule they are.
   - The spec says Threonine and Valine were removed because "in the layout tried, the obvious moves leave nothing to choose". Yet Puzzle.06 bars their id and formula for good, so a better layout could never be added.
   - The formula bar also already kept out 1,4-Dioxane, because Ethyl acetate (removed for its CH₃-closed loop) has its formula (`docs/plans/07-hydrogens-on-atoms/README.md:58`). With 24 removed it now bars many isomers: C₂H₆O, C₃H₆O, C₃H₆O₃, C₃H₇NO₂ and others.
   - 0022's Why covers only easy Puzzles and look-alikes. Either say why a Molecule removed for its layout is still never added again, or narrow Puzzle.06 for those.
6. **note**: `docs/decisions.md:275` (0022, Cost). "Iodine has no Puzzle left" and "'Solved k of 20' can go down" are from before plan 07. Now S, F, Cl, Br and I all have no Puzzle (0024's Cost), and the score is "of 15". The note on 0022 (`:270`) covers only the rule for new Puzzles. Adding "(numbers before plan 07)", as was done for 0020, would be enough.
7. **note**: `docs/decisions.md:297` (0024). "Threonine and Valine have 3, and the obvious moves solve them" states this of the Molecules. The spec (`puzzle.md:62–63`) and the plan's table say it only of "the layout tried". The two should agree, and finding 5 depends on which is meant.
8. **note**: `docs/decisions.md:204` (0016). "The key it names was `molecuzzle-v2`", but since 0266c89 the body names no key (`:206`). "The key it named" would read right.
9. **note**: `docs/decisions.md:261`, `:264` (0021) and `docs/spec/puzzle.md:9`. A tie goes to "the Puzzle that was there first", or "after those of the same difficulty". Neither says how new Puzzles of one batch with the same difficulty are ordered among themselves: Morpholine and Cyclohexene at 11, Cyclohexane-1,4-dione and 1,4-Benzoquinone at 13, Tartaric and Glutamic acid at 21. The order follows the plan's table, which is fine, but nothing makes it a rule. 0018 had "easiest first among themselves".

No must-fix findings.
