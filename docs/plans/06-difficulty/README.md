# 06: Puzzles in order of difficulty, and fewer easy ones

Status: Active

Every Puzzle gets a difficulty: its Dotted lines plus twice those its solution leaves empty. The Puzzles are sorted by it, easiest first ([decision 0021](../../decisions.md#0021)). Eight easy Puzzles are removed: those with almost nothing to rule out, and those that are another Puzzle's layout with other symbols. They are kept for reference, and a test stops them coming back ([decision 0022](../../decisions.md#0022)). The game then starts with a short tutorial, Water, Hydrogen cyanide, Formaldehyde and Methanol (single, triple and double Bonds, then the first empty Dotted line), and gets harder from there: 20 Puzzles, difficulty 2 to 45.

## Scope

Covers:

- Puzzle: Puzzle.05 (now the difficulty), Puzzle.06 (new: removed Puzzles), Generate.01 (the script prints the difficulty), Puzzle.01 (20 Puzzles, by difficulty), Puzzle.04 (its example is Puzzle 20)
- Every example that names a Puzzle by number or uses a removed one, now on the new list: Puzzle.03, Grid.01–02, Bond.01–06, Bond.08–10, Check.01–04, Help.01–02, Progress.01, Progress.05, Progress.06, Page.01, Board.01, Input.01–03, Input.05, Messages.01–02, Panel.01, Panel.03, List.01–02, and the narrative. Their rules don't change. The README's example of a Puzzle, Glycine, becomes Puzzle 12.

Left out:

- Showing the difficulty to the Player.
- A Puzzle for Iodine, which has none once Iodoethane is removed.

## Design

Interfaces that change:

- `puzzle/difficulty.js`, new: `difficulty(puzzle)` returns the number of candidate Bonds of its Atoms (`candidateBonds` in `grid.js`) plus twice the number its `solution` leaves out. It is in the Puzzle component, for the tests and the generator; the game doesn't use it. `docs/architecture.md` gets it, with its arrow to `grid.js`.
- `scripts/generate.js`: the comment after `rows` and `cols` becomes `// difficulty <n>: <d> Dotted lines, <e> empty`, in place of `// <e> unused candidate bonds`.
- `puzzle/removed.js`, new: `REMOVED`, the eight Puzzles as they were in `puzzles.js`, in the order of the spec's table of removed Puzzles. Nothing in the game imports it; the tests do.
- `puzzle/puzzles.js`: the eight move out, and the other 20 are in order of difficulty, with a new one after those of the same difficulty. Its top comment says so, and the batch comments go.
- No change to the UI or to Storage: they count `puzzles.length` and key Progress by id. A removed Puzzle's mark and Board stay in what is stored, as for any id the game doesn't know.

The new numbers, for the tests: Water 1, Hydrogen cyanide 2 (was 4), Formaldehyde 3, Methanol 4 (was 5), Acetic acid 5 (was 8), Ethylene 6, Acrylonitrile 7, Urea 8 (was 9), Halothane 9 (was 21), Acetone 10 (was 12), Ethanol 11 (was 10), Glycine 12 (was 11), Lactic acid 13, Ethyl acetate 14, Alanine 15 (was 13), Glycerol 16, Serine 17, Cysteine 18, Threonine 19, Valine 20 (was 28). The examples that used Ammonia use Formaldehyde, with H 1,1 to C 2,1 for H 1,1 to N 2,1; the spec's two-letter drawing is Halothane in place of Chloroform.

## Steps

1. **The difficulty.** Puzzle.05, Generate.01.
   - (a) Tests: in `tests/unit/puzzle/difficulty.test.js`, the Puzzle.05 example, Glycine's 12 + 2 × 3 = 18, and Water's 2; in `tests/unit/puzzle/generate-script.test.js`, the Generate.01 example prints difficulty 2.
   - (b) Implementation: `puzzle/difficulty.js`, the script's comment, and `docs/architecture.md`.
2. **Fewer Puzzles, in order of difficulty.** Puzzle.01, Puzzle.04, Puzzle.05, Puzzle.06, and the examples in Scope.
   - (a) Tests, in two commits. First every test that names a Puzzle by number or index, or uses a removed one, to the new list (they fail, as the list hasn't changed): `tests/unit/puzzle/game.test.js` (the Bond.08, Bond.09, Check.01 and Check.02 tests move from Ammonia to Formaldehyde, as their examples did, with their drawings), `tests/unit/app.test.js` (Ammonia becomes Formaldehyde), `tests/unit/ui/ui.test.js` (the count, 20, and the comments that name the Puzzle a test opens), `tests/unit/draw.test.js` (Halothane, as the spec draws it), the Puzzle.04 test in `tests/unit/puzzle/puzzles.test.js` (Valine is Puzzle 20), and `tests/e2e/` (`check.spec.js`, `puzzle.spec.js`, `progress.spec.js`, `narrative.spec.js`, `reset.spec.js`, `layout.spec.js`, `screenshots.spec.js`, `bonding.spec.js` where they open a Puzzle by number). The Input.03 screenshot test uses Formaldehyde, with the same Bond. Then the list: in `tests/unit/puzzle/puzzles.test.js`, the Puzzles with their difficulty as in the table, and that they are in order of difficulty (Puzzle.01, Puzzle.05), in place of the old Puzzle.05 test of Puzzles 22 to 28, which goes; in `tests/unit/puzzle/removed.test.js`, `REMOVED` is the table's eight, each a valid Puzzle with one solution, and no Puzzle has the id of one, or a formula with the same Atoms (the Puzzle.06 example). The Puzzle.05 example itself is step 1's test.
   - (b) Implementation: `puzzle/removed.js`, and the order in `puzzles.js`; `docs/architecture.md` names `removed.js`, like `solver.js` and `generate.js` not part of the game. Then remake the screenshots that show the list, the count or a renumbered Puzzle (`page-start.png`, `page-solved.png`, `page-phone.png`, `panel-mystery.png`, `panel-solved.png`, `list.png`, and `actions.png` if it changes), and look at each against ui.md.
