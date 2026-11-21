# 05: Larger and harder Puzzles

Status: Draft

Seven larger Puzzles at the end of the list: Lactic acid, Ethyl acetate, Glycerol, Serine, Cysteine, Threonine and Valine, from 12 to 19 Atoms. Each has at least 5 Dotted lines that stay empty in its solution, more than any Puzzle before but Alanine (6), so there are more wrong Bonds to rule out. They stay on Grids that fit a phone.

It starts once plan 04 is done, as both change the number of Puzzles in the same tests and screenshots.

## Scope

Covers:

- Puzzle: Puzzle.01 (28 Puzzles), Puzzle.04 (new: a Grid has at most 6 rows and 5 columns, [decision 0019](../../decisions.md#0019)), Generate.01 (6 by 5 when `maxRows` and `maxCols` are left out)
- UI: Panel.01 and List.01 (their examples: 28 Puzzles); Page.01, Panel.03 and List.02 already speak of the number of Puzzles, not 21

Left out:

- A difficulty shown to the Player, or a measure of it in the spec: the order, easiest first within the batch, is the only sign ([decision 0018](../../decisions.md#0018)).
- Molecules that don't fit 6 by 5 with exactly one solution.

## Design

Interfaces that change:

- `puzzle/generate.js`: `findLayout`'s defaults become `maxRows = 6, maxCols = 5`, from 5 and 6, so a layout found with the defaults fits Puzzle.04. `scripts/generate.js`'s comment says so.
- `puzzle/puzzles.js`: seven new Puzzles at the end, easiest first: by Atoms, then by Dotted lines left empty. Their layouts come from `node scripts/generate.js` with the defaults, or more tries or another seed where needed (Valine), and each must leave at least 5 Dotted lines empty; a fact each.
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
   - (a) Tests: in `tests/unit/puzzle/puzzles.test.js`, every Puzzle's Grid has at most 6 rows and 5 columns (all 21 do, so it passes at once); in `tests/unit/puzzle/generate.test.js`, `findLayout` for butane with no size given finds a layout of at most 6 by 5 (with today's defaults it is 5 by 6).
   - (b) Implementation: the defaults in `generate.js`, and the comment of `scripts/generate.js`.
2. **The new Puzzles.** Puzzle.01, Puzzle.04, Panel.01, List.01, List.02.
   - (a) Tests, in two commits. First the count, 28 where the tests say 21: `tests/unit/ui/ui.test.js`, and `tests/e2e/check.spec.js`, `puzzle.spec.js`, `narrative.spec.js` and `progress.spec.js`, with the Panel.01 example on Puzzle 28, and "Panel.03 the last puzzle has no Next puzzle button" building Puzzle 28, Valine (`tests/unit/ui/panel.test.js` keeps its 13 fake Puzzles). They fail as there are only 21 Puzzles. Then the Puzzles: their list in `tests/unit/puzzle/puzzles.test.js`, the Puzzle.04 example (Valine, 19 Atoms, 6 by 5), and that each new Puzzle leaves at least 5 Dotted lines empty.
   - (b) Implementation: the seven Puzzles in `puzzles.js`. Then remake the screenshots that show the count or the list, `page-start.png`, `page-solved.png`, `page-phone.png`, `panel-mystery.png`, `panel-solved.png` and `list.png`, and look at each against ui.md. Look at Valine on a phone, 390×844, in the browser: the Board fits, and its Atoms and Bonds can be told apart and tapped.
