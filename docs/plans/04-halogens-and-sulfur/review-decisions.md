# Review of the decisions, plan 04

Commits reviewed: the work of plan 04, `3ea7190..9d129e7`. The range also holds the end of plan 03 and the draft of plan 05 (`c4afef4`). I read everything at `9d129e7` in a separate worktree and removed it afterwards. The previous decisions review was `docs/plans/03-keep-solved/review-decisions.md`.

## What was checked

- **0003 and 0018** against `src/puzzle/puzzles.js` (the top comment, the batch comment, Puzzles 14–21 after Alanine), Puzzle.01 and the Progress section of `docs/spec/schemas.md` (Progress by `id`).
  - 0003's `Partly superseded by 0018` note matches its body.
  - 0018's Cost ("the Puzzles with new Elements follow Alanine") is now true.
  - 0018 now cites schemas.md for "Progress by id", where that rule is written.
- **0001, 0002, 0008, 0011, 0012, 0013 and 0016**, where plan 04 touches them:
  - the five Elements in both `elements.js`, the schema `enum`, and the rule in `panel.js`;
  - the import from `generate.js` to `elements.js`, inside the Puzzle component;
  - exactly one solution per new Puzzle;
  - `board-halothane.png`, made in the container;
  - the key `molecuzzle-v2`, unchanged.
- **0019** for consistency only. The generator's defaults are still 5×6 (`src/puzzle/generate.js:18`); that is plan 05's work, so it isn't counted as a mismatch.
  - It agrees with 0002 (its Cost), 0018 and 0008, with Puzzle.04, Generate.01, Layout.01 and plan 05.
  - All 21 current Grids are at most 6 rows by 5 columns.
  - Its pixel figures hold against `CELL`, `PAD` and `SCALE` in `board.js` and the padding in `style.css`. A C ball is about 36 px across at 5 columns (62% of its size on a computer) and about 30 px at 6. A Board of 6 rows is about 397 px tall.
- **Possibly missing decisions.** None of these needs a decision:
  - The Element colours follow the usual CPK colours, as H, O, N and C already did; Board.01 says what they are.
  - The generator's check is Generate.02, and obvious.
  - The two-letter text drawing is covered by finding 4.
- **The whole file, briefly.** Every decision keeps a Why, a Cost and Alternatives. The index lists 0001–0013 and 0015–0019 once each, under fitting categories, with titles that match the headings. Line 5 explains why there is no 0014.

## Findings

1. **should fix**: `docs/decisions.md:50-51` (0001). The Cost names only Molecules that need formal charges, and the Alternatives only charges and lone pairs. Plan 04 left out S with 4 or 6 Bonds (SF₆, DMSO, sulfuric acid) because of this decision ("they need a different valence model"). The backlog says that item goes against 0001. Now that S is an Element, "one valence per Element" also rules out hypervalent S (and P, if it is ever added). That is a separate cost from formal charges, and it is written only in the plan, which stops being read once it is done. For example: "...salts, and Molecules where S has 4 or 6 Bonds, such as sulfuric acid".

2. **should fix**: `docs/decisions.md:160` (0011, Cost). "What two components both need is written in each" lists the Element symbols in the two `elements.js` files only. Plan 04 had to change two more places:
   - The valences are also written in the UI, in the rule text at `src/ui/panel.js:10`. No test checks that text against `src/puzzle/elements.js`; it is checked only against Panel.04.
   - The symbols are also in `docs/spec/schemas/puzzle.schema.json:22`.

   The undo limit in the same sentence names its schema too. Adding an Element now means editing five places (two `elements.js`, `panel.js`, the schema, the spec), and the Cost should say so.

3. **note**: `docs/decisions.md:223` (0018) and `src/puzzle/puzzles.js:100-155`. 0018 and the comment say "easiest first among themselves", but neither says what easiest means. Plan 05 orders its batch "by Atoms, then by Dotted lines left empty" (`docs/plans/05-larger-puzzles/README.md:26`). Plan 04's batch doesn't follow that measure: Phosgene (4 Atoms, `puzzles.js:121`) comes after Chloroform (5) and Methanethiol (6). Plan 05 deliberately leaves a measure out of the spec, so this is no mismatch. But if plan 05's measure moves into a decision, it should allow for batch 04's order, or reorder it before those numbers are published.

4. **note**: `docs/spec/README.md:25`. A Board drawn as text has two widths: points are two characters wide only when a two-letter symbol is present. The reason, that every existing one-letter drawing and snapshot stays the same, is only in plan 04's Design. This is a convention for the tests and the spec, and it is cheap to change, so a decision is optional.

5. **note**: `docs/decisions.md:237` (0019, Cost). "Larger Molecules wait for another Grid" is vague. It probably means the hex grid or diagonals in the backlog; saying so, or linking the backlog, would make it concrete.

## Outcome

1. Fixed in 5ec3b3f: 0001's cost names S with 4 or 6 Bonds.
2. Fixed in 5ec3b3f: 0011's cost names the schema, the panel's rule, and what a new Element takes.
3. Kept: "easiest" is a judgement within a batch; Phosgene's double Bond makes it harder than its 4 Atoms say. Plan 05's measure is for its own batch only.
4. Kept: a convention for the tests and the spec, cheap to change, as the finding says.
5. Fixed in 5ec3b3f: 0019 names the hex grid of the backlog.
