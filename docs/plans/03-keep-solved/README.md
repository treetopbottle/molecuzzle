# 03: Solved Puzzles keep their solution

Status: Active

A solved Puzzle opens again as it was solved, showing its Molecule, until the Player resets it ([decision 0017](../../decisions.md#0017)).

## Scope

Covers:

- Storage: Progress.01 (its example now stores the solved Board), Progress.05 (solving no longer removes what was kept), Progress.06 (new: a solved Puzzle is kept, until it is reset)
- UI: Board.03 (the Atoms pulse when the Player solves the Puzzle, not when a solved Puzzle opens)
- The narrative: the next day, Glycine still shows.

Left out:

- Puzzles solved before this change have no Board kept, so they open with no Bonds, as after a Reset, until they are solved again ([decision 0017](../../decisions.md#0017)).
- Nothing changes in the rules: a solved Board already starts with nothing to undo ([Puzzle.03](../../spec/puzzle.md#puzzle)), and changes don't change it ([Bond.10](../../spec/puzzle.md#bond)).

## Design

Interfaces that change:

- `puzzle/game.js`: `saved()` returns `{ bonds, revealed, undo }` whenever the Board has Bonds or something to undo, so also when it is solved, as `{ bonds: <the solution>, revealed: false, undo: [] }`; `null` only with neither. `createGame` already starts a solved Board with nothing to undo.
- `app.js`: no change but `withEntry`'s docstring. It already keeps `saved()` in `boards`, or removes the entry when it is `null`, after every change, Undo, Reset and Show solution, and passes the entry to `createGame` when a Puzzle opens.
- `storage/progress.js`: no change: an entry has the same three fields. `progress.schema.json` only changes its description.
- `ui/board.js`: the svg keeps the class `solved` while the status is solved, and gets the class `pulse` only when a `render()` finds it solved and the one before didn't, so not for a Board that is created solved. `pulse` stays until the status leaves solved or a new Board is created: `createBoard` removes it as well as `solved`, as the UI draws every Puzzle on the same svg. `style.css` animates `.pulse .atom .body` in place of `.solved .atom .body`, in the reduced-motion rule too.

## Steps

1. **A solved Puzzle is kept.** Progress.01, Progress.05, Progress.06.
   - (a) Tests: in `tests/unit/puzzle/game.test.js`, `saved()` after solving is the solution with nothing to undo and `revealed` false, and `createGame` from it is solved with nothing to undo; `saved()` is still `null` after Reset (the test "saved() is null after Reset and after solving" splits in two). In `tests/unit/app.test.js`: solving keeps the entry, Reset removes it (the tests "Reset and solving remove what was kept" and "Progress.01 a solved Puzzle is marked solved" change), and opening the solved Puzzle passes its entry to `createGame`, solved. End-to-end: the Progress.06 example, in place of "a solved Puzzle opens again with no Bonds"; the stored value of the Progress.01 example (`tests/e2e/puzzle.spec.js`); the solved Water in "what is stored is a Progress" (`tests/e2e/progress.spec.js`); and, in the narrative test, Glycine still solved after the reload.
   - (b) Implementation: `saved()` in `game.js`, and its docstring and `withEntry`'s in `app.js`.
2. **The pulse only when solving.** Board.03.
   - (a) Tests in `tests/unit/ui/board.test.js`: solving during play gives `solved` and `pulse`, and both stay over another render; a Board created for a solved game, on an svg that just had `pulse`, has `solved` but not `pulse`; after Reset, neither. End-to-end, in `tests/e2e/check.spec.js`: after solving Puzzle 4, then solving Water, opening Puzzle 4 again right away gives no `pulse`; the reduced-motion test in `tests/e2e/screenshots.spec.js` checks the `pulse` class.
   - (b) Implementation: the `pulse` class in `ui/board.js`, and the animation on it in `ui/style.css`.
