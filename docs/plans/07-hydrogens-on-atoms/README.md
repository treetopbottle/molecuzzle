# 07: Hydrogens on their Atoms, and Puzzles with loops

Status: Active

The hydrogens leave the Grid: each Atom has its hydrogens bonded from the start, drawn small beside it, and needs its valence minus them in Bonds to other Atoms ([decision 0023](../../decisions.md#0023)). The Board is then the Molecule's skeleton, and the Puzzles are chosen for their loops of Dotted lines, the choices a Player has to make; the difficulty counts them ([decision 0024](../../decisions.md#0024)). Fifteen Puzzles, from Acetonitrile to Citric acid, most of them rings or acids; sixteen of today's twenty are removed, too easy without their hydrogens. The prototype `prototypes/implicit-hydrogens.html` tried it first.

## Scope

Covers:

- Puzzle: Puzzle.07 (new: hydrogens on their Atom), Valence.01 (an Atom needs its valence minus its hydrogens), Puzzle.03 (a bond count over its valence minus its hydrogens), Generate.01 and Generate.02 (labels with hydrogens), Puzzle.05 (difficulty counts loops), Puzzle.08 (new: at least 2 loops after the tutorial), Puzzle.01, Puzzle.04 and Puzzle.06 (the new Puzzles and the removed ones)
- UI: Board.01 and Board.04 (hydrogens drawn and named), Panel.04 (the rule on valence)
- Storage: Progress.03 (the key `molecuzzle-v3`)
- Every example that names a Puzzle, now on the new list: Puzzle.02, Puzzle.03, Progress.03, Grid.01–02, Bond.01–06, Bond.08–11, Valence.02, Check.01–04, Help.01–02, Progress.01, Progress.05, Progress.06, Page.01, Board.02, Input.01–03, Input.05, Messages.01–02, Panel.01–03, List.01–02, and the narrative
- The spec's text drawings, with labels as in a formula ([README](../../spec/README.md#examples))

Left out:

- Puzzles with S or a halogen: none of today's has loops worth keeping, so they have no Puzzle for now (backlog).
- A solver-based difficulty: the obvious moves are checked by a script while the Puzzles are chosen, not by the game or its tests ([decision 0024](../../decisions.md#0024)).
- Moving today's Progress to the new key: Players start again ([decision 0023](../../decisions.md#0023)).

## Design

Interfaces that change:

- A Puzzle's Atom is `[element, row, column, hydrogens]`. Until step 7, `game.js`, `solver.js`, `difficulty.js`, `draw.js` and `board.js` read a missing fourth item as 0, so today's Puzzles keep working; from step 7 every Atom has it. `docs/spec/schemas/puzzle.schema.json` gets the fourth item, required, 0 to 3, and loses H from its Elements in step 7 too, with the Puzzles, so the checks pass in between.
- `puzzle/game.js`: an Atom needs its valence minus its hydrogens (`remaining`, the check of a Board against the Grid, `full`). New: `atoms[i].h`.
- `puzzle/solver.js`: the same need.
- `puzzle/generate.js`: a label is `<Element>[H[<count>]][:<name>]`, as `CH3`, `OH`, `NH2`, `CH2:a`; the Atom gets those hydrogens, and a label that isn't one, an Element it doesn't have, H as an Element, or hydrogens that leave no room for a Bond, is "can't read". `findLayout` returns Atoms with their hydrogens; `scripts/generate.js` prints them, and draws the layout with the labels.
- `puzzle/difficulty.js`: `dottedLines(puzzle)` returns `{ dotted, loops }`, loops being Dotted lines minus Atoms plus 1; `difficulty` is `dotted + 2 * loops`. For today's Puzzles, all without a ring, it gives the same numbers. The script's comment becomes `// difficulty <n>: <d> Dotted lines, <l> loops`.
- `tests/helpers/draw.js`: an Atom is drawn by its label (`CH₂`, with a subscript digit), every point as wide as the longest label.
- `ui/board.js`: the Atom shows its symbol; its hydrogens are drawn as small H balls (radius 8.5, white, as `ui/elements.js` H) on thin lines (`class="fixed"`), on the diagonals below-left, below-right and above-left, in that order, inside the Atom's group and so not clickable; the badge keeps the top right. Its name gets ", with <h> hydrogen(s)". `style.css` styles them, as the prototype does.
- `ui/panel.js`: the rule on valence of Panel.04.
- `storage/progress.js`: `STORAGE_KEY` is `molecuzzle-v3`.
- `puzzle/puzzles.js`: the 15 Puzzles of the spec's table, with a fact each, layouts from the arguments below. `puzzle/removed.js` gets the 16 removed today, as they are now, after the 8 already there, in the order of the spec's table; its test checks only that no Puzzle has their id or formula, not their layouts, which follow the old rules ([decision 0023](../../decisions.md#0023)).

The Puzzles, and the Bonds and arguments that give their layouts with `node scripts/generate.js` (all `100000 6 5 1`); before step 3 the same layouts come from stand-in Elements, which is how they were chosen:

| # | Molecule | Bonds |
|---|---|---|
| 1 | Acetonitrile | `CH3-C C#N` |
| 2 | Acetic acid | `CH3-C C=O C-OH` |
| 3 | Glycine | `NH2-CH2 CH2-C C=O C-OH` |
| 4 | Glycerol | `OH:a-CH2:a CH2:a-CH CH-OH:b CH-CH2:b CH2:b-OH:c` |
| 5 | Morpholine | `O-CH2:a CH2:a-CH2:b CH2:b-NH NH-CH2:c CH2:c-CH2:d CH2:d-O` |
| 6 | Cyclohexene | `CH:a=CH:b CH:b-CH2:a CH2:a-CH2:b CH2:b-CH2:c CH2:c-CH2:d CH2:d-CH:a` |
| 7 | Serine | `NH2-CH CH-CH2 CH2-OH:a CH-C C=O C-OH:b` |
| 8 | Cyclohexanol | `CH-OH CH-CH2:a CH2:a-CH2:b CH2:b-CH2:c CH2:c-CH2:d CH2:d-CH2:e CH2:e-CH` |
| 9 | Cyclohexane-1,4-dione | `C:a=O:a C:a-CH2:a CH2:a-CH2:b CH2:b-C:b C:b=O:b C:b-CH2:c CH2:c-CH2:d CH2:d-C:a` |
| 10 | 1,4-Benzoquinone | `C:a=O:a C:a-CH:a CH:a=CH:b CH:b-C:b C:b=O:b C:b-CH:c CH:c=CH:d CH:d-C:a` |
| 11 | Malic acid | `OH:a-C:a C:a=O:a C:a-CH CH-OH:b CH-CH2 CH2-C:b C:b=O:b C:b-OH:c` |
| 12 | Tartaric acid | `OH:a-C:a C:a=O:a C:a-CH:a CH:a-OH:b CH:a-CH:b CH:b-OH:c CH:b-C:b C:b=O:b C:b-OH:d` |
| 13 | Glutamic acid | `NH2-CH CH-C:a C:a=O:a C:a-OH:a CH-CH2:a CH2:a-CH2:b CH2:b-C:b C:b=O:b C:b-OH:b` |
| 14 | Glucose | `O-CH:a CH:a-OH:a CH:a-CH:b CH:b-OH:b CH:b-CH:c CH:c-OH:c CH:c-CH:d CH:d-OH:d CH:d-CH:e CH:e-O CH:e-CH2 CH2-OH:e` |
| 15 | Citric acid | `OH:a-C:a C:a=O:a C:a-CH2:a CH2:a-C:b C:b-OH:b C:b-C:c C:c=O:b C:c-OH:c C:b-CH2:b CH2:b-C:d C:d=O:c C:d-OH:d` |

They were chosen from 30 candidates by three checks, with scripts that aren't kept: at least 2 loops after the first three; the obvious moves of [decision 0024](../../decisions.md#0024) (bounds on each line from what its Atoms need, as the cost there says) leave lines open; and no two of the same size are the same layout, turned, flipped or with other symbols of the same valence ([decision 0020](../../decisions.md#0020)). No layout has crossing Dotted lines, so the crossing rules get an example on a made-up Grid. 1,4-Dioxane was left out for having the formula of Ethyl acetate, which is removed; Morpholine, its look-alike, takes its place.

The candidates left out whose reason depends on their layout, with the Bonds tried (`100000 6 5 1`):

| Molecule | Bonds | Loops | Lines the obvious moves leave |
|---|---|---|---|
| Halothane | `C-F:a C-F:b C-F:c C-CH CH-Br CH-Cl` | 2 | 0 of 8 |
| Lactic acid | `OH:a-CH CH-CH3 CH-C C=O C-OH:b` | 1 | 0 of 6 |
| Ethyl acetate | `CH3:a-C C=O C-O:b O:b-CH2 CH2-CH3:b` | 1 | 0 of 6 |
| Alanine | `NH2-CH CH-CH3 CH-C C=O C-OH` | 1 | 0 of 6 |
| Threonine | `NH2-CH:a CH:a-CH:b CH:b-OH:a CH:b-CH3 CH:a-C C=O C-OH:b` | 3 | 0 of 10 |
| Valine | `NH2-CH:a CH:a-C C=O C-OH CH:a-CH:b CH:b-CH3:a CH:b-CH3:b` | 3 | 0 of 10 |
| Cysteine | `NH2-CH CH-CH2 CH2-SH CH-C C=O C-OH` | 2 | Serine's layout, with S for O |

## Steps

1. **Hydrogens in the rules.** `[DONE]` ([review](review-step-1.md), [2](review-step-1-2.md)) Puzzle.07, Valence.01, Puzzle.03.
   - (a) Tests in `tests/unit/puzzle/game.test.js` and `solver.test.js`, on made-up Puzzles with hydrogens (the spec's Acetic acid): what each Atom needs (the Valence example with its hydrogens), `full` on an Atom whose hydrogens and Bonds fill it, a stored Board with more Bonds than an Atom needs is refused, and the solver finds the one solution with them.
   - (b) Implementation: the need in `game.js` and `solver.js`.
2. **Labels in the text drawings.** `[DONE]` ([review](review-step-2.md)) No rule ids. `tests/helpers/draw.js`, with a test in `tests/unit/draw.test.js` of the spec's Glycine, as a made-up Puzzle until step 7, and of a Board with no hydrogens, drawn as now.
3. **Labels in the generator.** `[DONE]` ([review](review-step-3.md)) Generate.01, Generate.02.
   - (a) Tests: the new Generate.01 and Generate.02 examples in `tests/unit/puzzle/generate.test.js` and through the script; H as an Element, and an Atom with no room left (`CH4-C`), are "can't read". The old examples, with H Atoms, go.
   - (b) Implementation: the labels in `generate.js`, and the script's printing and drawing.
4. **Difficulty counts loops.** `[DONE]` ([review](review-step-4.md)) Puzzle.05, Puzzle.08.
   - (a) Tests in `tests/unit/puzzle/difficulty.test.js`: the Puzzle.05 example on the new Glycine and the Puzzle.08 example on Glycerol, made-up until step 7; and Morpholine, a ring, where loops and empty Dotted lines differ (2 loops, 1 empty; difficulty 11). The script's comment, in `generate-script.test.js`.
   - (b) Implementation: `difficulty.js` and the script's comment.
5. **The Board draws hydrogens.** `[DONE]` ([review](review-step-5.md)) Board.01, Board.04, Panel.04.
   - (a) Tests in `tests/unit/ui/board.test.js` on a made-up Acetic acid: its CH₃ has three hydrogens drawn, not focusable and outside every Dotted line's hit area, and the names of the Board.04 example; in `panel.test.js`, the rule. Board.01's colours lose H, which stays in `ui/elements.js` for the hydrogens.
   - (b) Implementation: `board.js`, `style.css`, `panel.js`.
6. **Progress under a new key.** `[DONE]` ([review](review-step-6.md)) Progress.03.
   - (a) Tests: in `tests/unit/storage/progress.test.js`, the key is `molecuzzle-v3`, and what is stored under `molecuzzle-v2` isn't read.
   - (b) Implementation: `STORAGE_KEY`.
7. **The new Puzzles.** Puzzle.01, Puzzle.04, Puzzle.05, Puzzle.06, Puzzle.07, Puzzle.08, and the examples in Scope.
   - (a) Tests, in three commits. First the unit tests of the rules, the storage and the Glue on the new Puzzles, as the spec's examples now are (`game.test.js`, `app.test.js`, `ui.test.js`, `board.test.js`, `draw.test.js`, `difficulty.test.js`, with the made-up Puzzles of steps 1, 2, 4 and 5 now read from `puzzles.js` and its Water test gone, the Bond.03 example on Acetonitrile, and the Progress.03 example in `progress.test.js`); the Grid.02 and Bond.05 examples on the made-up Grid. Then `puzzles.test.js` (the table, the hydrogens of the formula, carried to the solver, Puzzle.04, Puzzle.07, Puzzle.08) and `removed.test.js` (the 24, by id and formula only). Then the end-to-end tests, the narrative and the screenshot tests (`board-glucose.png` in place of `board-halothane.png`).
   - (b) Implementation: `puzzles.js`, `removed.js` and the Puzzle schema. Remake every screenshot that changes, all but `actions.png`, and look at each against ui.md: the hydrogens, which don't glow or pulse, the badge and the glow on the new Boards, and Glucose and Citric acid on a phone. The step is large but mechanical; its review checks the examples one by one.
