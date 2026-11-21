# 04: The halogens and sulfur

Status: Draft

F, Cl, Br and I with 1 Bond and S with 2 become Elements, and eight Puzzles with them go at the end of the list: Carbon disulfide, Chloroform, Methanethiol, Phosgene, Vinyl chloride, Tetrafluoroethylene, Iodoethane and Halothane. They play like H and O, so they add variety, not harder logic.

## Scope

Covers:

- Puzzle: Puzzle.01 (21 Puzzles; new ones go at the end, [decision 0018](../../decisions.md#0018)), Valence.01 (the table of valences), Generate.02 (an Element the game doesn't have stops the generator)
- UI: Board.01 (the new Elements' colours, and a screenshot of Halothane), Board.04 (their names), Page.01, Panel.01, Panel.03 and List.02 (the number of Puzzles is no longer 13), List.01 (its example's header)

Left out:

- Larger and harder Puzzles: the next item of the backlog.
- Elements with more than one valence, such as S with 4 or 6 Bonds in SF₆: they need a different valence model (backlog).

## Design

Interfaces that change:

- `puzzle/elements.js`: `ELEMENTS` gains `F`, `Cl`, `Br` and `I` with valence 1, and `S` with valence 2.
- `ui/elements.js`: `ELEMENTS` gains their names and looks, with the radius of C, N and O: Sulfur yellow, Fluorine light green, Chlorine green, Bromine dark red, Iodine violet, each with a text colour that reads on it (dark on yellow and the greens, white on dark red and violet). The symbol's font stays: "Cl" and "Br" fit in the ball.
- `puzzle/generate.js`: `findLayout` throws `can't read <bond>` also for a Bond with an Atom whose Element isn't in `ELEMENTS` (imported from `elements.js`, in the same component), before it searches; now it ends in a `TypeError` in the solver.
- `puzzle/puzzles.js`: eight new Puzzles at the end, with layouts from `node scripts/generate.js`, and a fact each.
- `docs/spec/schemas/puzzle.schema.json`: the Element `enum` gains the five symbols (in the spec commit).
- No change to the UI's code for the number of Puzzles: it already counts `puzzles.length`; only tests and screenshots that say 13 change.
- `tests/e2e/helpers.js`: `bond()` matches two-letter symbols too (`[A-Z][a-z]?`).

## Steps

1. **The new Elements.** Valence.01, Board.01, Board.04.
   - (a) Tests: in `tests/unit/puzzle/game.test.js`, every Element has the valence of puzzle.md's table, and an Atom of each new Element needs that many Bonds; in `tests/unit/ui/board.test.js`, each Element's name, and each new Element's colour as Board.01 says it (yellow, light green, green, dark red, violet, by hue and lightness, as the e2e helpers judge green and orange). The test that every Element has a look and a name already holds, and stays.
   - (b) Implementation: both `elements.js`.
2. **The generator knows the Elements.** Generate.02.
   - (a) Tests: the new Generate.02 example in `tests/unit/puzzle/generate.test.js`, and through the script in `tests/unit/puzzle/generate-script.test.js`.
   - (b) Implementation: the check in `findLayout`.
3. **The new Puzzles.** Puzzle.01, Board.01, Page.01, Panel.01, Panel.03, List.01, List.02.
   - (a) Tests: the list of Puzzles in `tests/unit/puzzle/puzzles.test.js` (its other tests run for each Puzzle, so the new ones get them); the number of Puzzles, 21, where the tests say 13 (`tests/unit/ui/`, `tests/e2e/`), and the Panel.01 example on Puzzle 21; a screenshot test of Halothane with no Bonds in `tests/e2e/screenshots.spec.js`. They fail as there are only 13 Puzzles.
   - (b) Implementation: the eight Puzzles in `puzzles.js`, each laid out with `scripts/generate.js` and checked as a Board drawn as text; then remake the screenshots (the count, the list and the new one) and look at each against ui.md.
