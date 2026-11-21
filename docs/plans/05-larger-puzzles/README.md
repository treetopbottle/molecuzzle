# 05: Larger and harder Puzzles

Status: Active

Seven larger Puzzles at the end of the list: Lactic acid, Ethyl acetate, Glycerol, Serine, Cysteine, Threonine and Valine, from 12 to 19 Atoms. Each leaves at least 5 Dotted lines empty in its solution, more than any Puzzle before but Alanine (6), so there are more wrong Bonds to rule out. The threshold of 5 is chosen so Lactic acid, the smallest, can open the batch; the others leave 5 to 9. They stay on Grids that fit a phone.

It starts once plan 04 is done, as both change the number of Puzzles in the same tests and screenshots.

## Scope

Covers:

- Puzzle: Puzzle.01 (28 Puzzles), Puzzle.04 (new: a Grid has at most 6 rows and 5 columns, [decision 0019](../../decisions.md#0019)), Puzzle.05 (new: Puzzles 22 to 28 each leave at least 5 Dotted lines empty), Generate.01 (6 by 5 when `maxRows` and `maxCols` are left out)
- UI: Layout.01 (the largest Grid fits a phone), and the rules that show the number of Puzzles or the last one: Page.01, Panel.01, Panel.03, List.01 and List.02. Their texts already speak of the number of Puzzles; their examples and screenshots change to 28.

Left out:

- A difficulty shown to the Player: the order, easiest first within the batch, is the only sign ([decision 0018](../../decisions.md#0018)).
- Molecules that don't fit 6 by 5 with exactly one solution.

## Design

Interfaces that change:

- `puzzle/generate.js`: `findLayout`'s defaults become `maxRows = 6, maxCols = 5`, from 5 and 6, so a layout found with the defaults fits Puzzle.04. `scripts/generate.js`'s comment says so.
- `puzzle/puzzles.js`: seven new Puzzles at the end, in the order of the spec's table, which goes by Atoms and then by Dotted lines left empty, as judged when it was written. Their layouts come from `node scripts/generate.js` with the defaults, or more tries or another seed where needed; each leaves at least 5 Dotted lines empty, and no two of them, nor any with an earlier Puzzle, are the same layout with only the symbols changed: Cysteine's differs from Serine's, as S plays like O. A fact each.
- No change to the UI's code: the list wraps, and the Board shrinks to fit a phone.

The Molecules, as Bonds for the generator:

| Molecule | Structure |
|---|---|
| Lactic acid | CH₃–CH(OH)–COOH |
| Ethyl acetate | CH₃–C(=O)–O–CH₂–CH₃ |
| Glycerol | HOCH₂–CH(OH)–CH₂OH |
| Serine | HOCH₂–CH(NH₂)–COOH |
| Cysteine | HSCH₂–CH(NH₂)–COOH |
| Threonine | CH₃–CH(OH)–CH(NH₂)–COOH |
| Valine | (CH₃)₂CH–CH(NH₂)–COOH |

## Steps

1. **Grids that fit a phone.** Puzzle.04, Generate.01.
   - (a) Tests: in `tests/unit/puzzle/puzzles.test.js`, every Puzzle's Grid has at most 6 rows and 5 columns (all 21 do, so it passes at once); in `tests/unit/puzzle/generate-script.test.js`, the script for butane with no size given prints a layout of at most 6 by 5 (with today's defaults it is wider than 5).
   - (b) Implementation: the defaults in `generate.js`, and the comment of `scripts/generate.js`.
2. **The new Puzzles.** Puzzle.01, Puzzle.04, Puzzle.05, Layout.01, Page.01, Panel.01, Panel.03, List.01, List.02.
   - (a) Tests, in two commits. First the count, 28 where the tests say 21: `tests/unit/ui/ui.test.js`, and `tests/e2e/check.spec.js`, `puzzle.spec.js`, `narrative.spec.js` and `progress.spec.js`, with the Panel.01 example on Puzzle 28, and "Panel.03 the last puzzle has no Next puzzle button" building Puzzle 28, Valine (`tests/unit/ui/panel.test.js` keeps its 13 fake Puzzles). They fail as there are only 21 Puzzles. Then the Puzzles: their list in `tests/unit/puzzle/puzzles.test.js`; the Puzzle.04 example (Valine, 19 Atoms, 6 by 5); Puzzle.05, that Puzzles 22 to 28 each leave at least 5 Dotted lines empty, with its example on Lactic acid; and in `tests/e2e/layout.spec.js`, that Puzzle 28 on a phone, 390×844, doesn't scroll sideways and shows its status line on the screen.
   - (b) Implementation: the seven Puzzles in `puzzles.js`. Then remake the screenshots that show the count or the list, `page-start.png`, `page-solved.png`, `page-phone.png`, `panel-mystery.png`, `panel-solved.png` and `list.png`, and look at each against ui.md. Look at Valine on a phone, 390×844, in the browser: its Atoms and Bonds can be told apart and tapped.
