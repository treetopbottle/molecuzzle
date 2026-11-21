# 04: The halogens and sulfur

Status: Draft

F, Cl, Br and I with 1 Bond and S with 2 become Elements, and eight Puzzles with them go at the end of the list: Carbon disulfide, Chloroform, Methanethiol, Phosgene, Vinyl chloride, Tetrafluoroethylene, Iodoethane and Halothane. They play like H and O, so they add variety, not harder logic.

It starts once plan 03 is done, as both change some of the same tests.

## Scope

Covers:

- Puzzle: Puzzle.01 (21 Puzzles; new ones go at the end, [decision 0018](../../decisions.md#0018)), Valence.01 (the table of valences), Generate.02 (an Element the game doesn't have stops the generator)
- UI: Board.01 (the new Elements' colours, and a screenshot of Halothane), Board.04 (their names), Panel.04 (the rule on valence names every Element), Page.01, Panel.01, Panel.03 and List.02 (the number of Puzzles is no longer 13), List.01 (its example's header)
- The spec's text drawings of a Board with a two-letter symbol ([README](../../spec/README.md#examples))

Left out:

- Larger and harder Puzzles: the next item of the backlog.
- Elements with more than one valence, such as S with 4 or 6 Bonds in SF₆: they need a different valence model (backlog).

## Design

Interfaces that change:

- `puzzle/elements.js`: `ELEMENTS` gains `F`, `Cl`, `Br` and `I` with valence 1, and `S` with valence 2.
- `ui/elements.js`: `ELEMENTS` gains their names and looks, with the radius of C, N and O: Sulfur yellow, Fluorine light green, Chlorine green, Bromine dark red, Iodine violet, each with a text colour that reads on it (dark on yellow and the greens, white on dark red and violet). The symbol's font stays: "Cl" and "Br" fit in the ball. When the screenshots are remade, check that the orange badge and the glow of a complete Atom show on the new colours (Board.02).
- `ui/panel.js`: the rule on valence names every Element, as Panel.04 says.
- `puzzle/generate.js`: `findLayout` throws `can't read <bond>` also for a Bond with an Atom whose Element isn't an own key of `ELEMENTS` (`Object.hasOwn`, so `constructor1` isn't taken for an Element), imported from `elements.js` in the same component, before it searches; now it ends in a `TypeError` in the solver. `docs/architecture.md` gets the arrow from `generate.js` to `elements.js`.
- `tests/helpers/draw.js` and the layout comment that `scripts/generate.js` prints: in a Board with a two-letter symbol, every Grid point is two characters wide and the columns three apart, as the spec's README says; Boards with only one-letter symbols are drawn as now.
- `puzzle/puzzles.js`: eight new Puzzles at the end, with layouts from `node scripts/generate.js`, and a fact each.
- `docs/spec/schemas/puzzle.schema.json`: the Element `enum` gains the five symbols (in the spec commit).
- No change to the UI's code for the number of Puzzles: it already counts `puzzles.length`; only tests and screenshots that say 13 change.
- `tests/e2e/helpers.js`: `bond()` matches two-letter symbols too (`[A-Z][a-z]?`). `hue`, `isGreen` and `isOrange` move to `tests/helpers/colors.js`, which doesn't import Playwright, so the unit tests can judge colours too; `tests/e2e/helpers.js` re-exports them.

## Steps

1. **The new Elements.** Valence.01, Board.01, Board.04, Panel.04.
   - (a) Tests: move the colour helpers to `tests/helpers/colors.js`. The screenshots that show the rules fail as they are, until (b) remakes them. In `tests/unit/puzzle/game.test.js`, every Element has the valence of puzzle.md's table; in `tests/unit/ui/board.test.js`, each Element's name, and each new Element's colour as Board.01 says it (yellow, light green, green, dark red, violet, by hue and lightness); in `tests/unit/ui/panel.test.js`, the rule on valence. The test that every Element has a look and a name already holds, and stays.
   - (b) Implementation: both `elements.js`, and the rule in `panel.js`; then remake the screenshots that show the rules, and look at each.
2. **Two-letter symbols drawn as text.** No rule ids. `tests/helpers/draw.js` and the comment of `scripts/generate.js`, as in Design, with a test of `draw` in `tests/unit/draw.test.js` on the spec's Phosgene, with a made-up Puzzle until step 4 adds it, and on Glycine, which stays as it is drawn now.
3. **The generator knows the Elements.** Generate.02.
   - (a) Tests: the new Generate.02 example in `tests/unit/puzzle/generate.test.js`, and through the script in `tests/unit/puzzle/generate-script.test.js`.
   - (b) Implementation: the check in `findLayout`, and the arrow in `docs/architecture.md`.
4. **The new Puzzles.** Puzzle.01, Board.01, Page.01, Panel.01, Panel.03, List.01, List.02.
   - (a) Tests, in two commits. First the count, 21 where the tests say 13 (all fail as there are only 13 Puzzles):
     - `tests/unit/ui/ui.test.js` and `tests/unit/ui/panel.test.js` (its 13 fake Puzzles become 21);
     - `tests/e2e/check.spec.js`, `puzzle.spec.js`, `narrative.spec.js` and `progress.spec.js`, with the Panel.01 example on Puzzle 21;
     - "Panel.03 the last puzzle has no Next puzzle button" in `check.spec.js` builds Puzzle 21, Halothane, which needs `bond()` with two-letter symbols in `tests/e2e/helpers.js`.

     Then the Puzzles: their list in `tests/unit/puzzle/puzzles.test.js` (its other tests run for each Puzzle, so the new ones get them), Phosgene in `tests/unit/draw.test.js` from `puzzles.js`, and a screenshot test of Halothane with no Bonds in `tests/e2e/screenshots.spec.js`.
   - (b) Implementation: the eight Puzzles in `puzzles.js`, each laid out with `scripts/generate.js` and checked as a Board drawn as text. Then remake the screenshots that change, `page-start.png`, `page-solved.png`, `page-phone.png`, `panel-mystery.png`, `panel-solved.png` and `list.png`, and make the new `board-halothane.png`; look at each against ui.md. `board.png` and `actions.png` stay.
