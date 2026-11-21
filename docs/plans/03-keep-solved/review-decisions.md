# Review of the decisions, plan 03

Commits reviewed: the work of plan 03, `02051d2..20ef703` (14 commits), and `02051d2` itself, where 0017 and the "Partly superseded" note on 0015 were added. Read at `20ef703` in a separate worktree, which has been removed. The previous decisions review was `docs/plans/02-components/review-decisions.md` (at `2741413`), fixed in `29f5478`.

## What was checked

- 0015, 0016 and 0017, line by line, against `src/puzzle/game.js` (`saved()`, `reset()`, `showSolution()`, the history cleared on solving), `src/app.js` (`withEntry`, `open`, `update`), `src/ui/board.js`, `src/ui/ui.js` (Reset asks first), `src/ui/style.css`, `docs/spec/storage.md` (Progress.01, .05, .06), `docs/spec/ui.md` (Board.03) and `progress.schema.json`.
- 0017's claims hold:
  - A solved Board is stored as `{ bonds, revealed: false, undo: [] }`.
  - Only Reset removes it in the current build.
  - An older build opens it as solved, and its `withEntry` drops it the next time it opens that Puzzle.
- How 0017 fits with 0004, 0008, 0013, 0015 and 0016.
- Each decision has a why, a cost and alternatives, and gives the why rather than the what.
- Missing decisions, in particular `board.js`'s pulse and `game.js` `saved()`.
- The rest of the file, briefly.
- The index lists 0001–0013 and 0015–0018 once each, under a fitting category, with matching titles. Line 5 explains why there is no 0014.

## Findings

1. **should fix**: `docs/decisions.md:196-200` (0016) and `docs/decisions.md:213` (0017, Why). 0016's title says Progress keeps its key "while it only gains fields". Its rule is "Only a field that changes its meaning or format gets a new key". 0017 gains no field, and it widens what `boards` holds: the schema description went from "Per Puzzle in progress" to "Per Puzzle in progress or solved". Yet it keeps `molecuzzle-v2`. 0017 gives the real test: "its entries keep their format, and an older build opens a solved entry as solved". But 0016, read alone, still sends a change like 0017's to a new key. 0017 narrows 0016 without 0016 being marked `Partly superseded by 0017`, as `docs/decisions.md:5` asks. For example: "the key also stays when older builds still read the entries right".

2. **note**: `src/ui/board.js:30`, `:89-94`. The pulse comes from comparing two renders of one Board, not from a "just solved" event from the game or from `app.js`. The cost: any new Board stops a pulse that is running, for example a reload right after solving, or clicking the open Puzzle in the list (now in the backlog). The choice and its reason are only in the plan's Design (`docs/plans/03-keep-solved/README.md:27`) and in code comments. The plan stops being read once it is done. It is local to the UI and small, so a decision is optional, but this is the one choice in plan 03 that isn't in `decisions.md`. `game.js` `saved()` needs no new decision: storing the Board rather than a mark is 0017's choice, and its alternatives cover the mark.

3. **note**: `docs/decisions.md:187` and `:189-191` (0015). The note "Partly superseded by 0017: solving keeps the Board" covers the body, the Why ("Once a Puzzle is solved its Board tells nothing more") and the Cost ("stays there until it is solved or reset"). It is correct as it is. A reader still has to work out that solving still clears the undo history (Bond.10), and that only the Bonds now stay.

4. **note**: `docs/decisions.md:64-68` (0003), `:224-225` (0018). These come from plan 04, not plan 03, and are already findings 5 and 8 of `docs/plans/04-halogens-and-sulfur/review-plan.md`, which has no Outcome yet at `20ef703`:
   - 0003 isn't marked `Partly superseded by 0018`.
   - 0018 cites 0016 for "Progress is by id", which is in `docs/spec/schemas.md` instead.

   Also, 0018's cost ("the Puzzles with new Elements follow Alanine") describes Puzzles that aren't in `src/puzzle/puzzles.js` yet: it still has 13. That is expected while plan 04 is a draft.

## Outcome

1. Fixed in dfe4c76: 0016 is partly superseded by 0017.
2. Kept: local to the UI and small, as the finding says; the comment in `board.js` gives the reason, and Board.03 the behaviour.
3. Fixed in dfe4c76: 0015's note says solving keeps the Bonds but still ends the undo history.
4. Fixed in d959cca, with plan 04's review.
