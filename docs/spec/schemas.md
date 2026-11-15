# Schemas

Language-independent [JSON Schema](https://json-schema.org/)s (draft 2020-12), as files in [schemas/](schemas/); the tests check the data against them ([0012](../decisions.md#0012)). What a schema can't say is written next to it.

## Puzzle

[puzzle.schema.json](schemas/puzzle.schema.json): one Puzzle, as in `src/puzzle/puzzles.js` ([Puzzle.01](puzzle.md#puzzle)). Its `solution` is a [Board](#board). Also: the `id`s are unique, every Atom is inside the Grid (row below `rows`, column below `cols`) at its own point, and the Atoms are those of the formula.

Example: Puzzle 1.

```json
{
  "id": "water", "name": "Water", "formula": "H2O",
  "fact": "About 60% of your body is water. Its bent shape makes it polar, so it dissolves many substances.",
  "rows": 2, "cols": 2,
  "atoms": [["H", 0, 0], ["O", 0, 1], ["H", 1, 1]],
  "solution": [[0, 1, 1], [1, 2, 1]]
}
```

## Board

[board.schema.json](schemas/board.schema.json): the Bonds of a Puzzle, as `[atom, atom, order]` ([Bond.11](puzzle.md#bond)). Atoms are indexes into the Puzzle's `atoms`, the lower first, and the Bonds are in order of their first Atom, then their second. Also: each pair of Atoms is a Dotted line of the Grid, and appears once.

It is only the Bonds, the same for a Puzzle's solution as for a Board being played: the undo history and whether the solution is shown belong to the game in progress, which isn't kept or passed on.

Example: Water with both Bonds, the solution above.

```json
[[0, 1, 1], [1, 2, 1]]
```

## Progress

[progress.schema.json](schemas/progress.schema.json): stored in the browser ([Progress.03](data.md#progress)). Every field is optional. A Puzzle's id is its `id` in `src/puzzle/puzzles.js`, e.g. `acetic-acid`.

Example: Puzzles 1 and 2 solved, and Puzzle 3 open.

```json
{
  "puzzles": { "water": "solved", "ammonia": "solved" },
  "current": "formaldehyde"
}
```
