# Schemas

Language-independent [JSON Schema](https://json-schema.org/)s (draft 2020-12), as files in [schemas/](schemas/); the tests check the data against them ([decision 0012](../decisions.md#0012)). What a schema can't say is written next to it.

## Puzzle

[puzzle.schema.json](schemas/puzzle.schema.json): one Puzzle, as in `src/puzzle/puzzles.ts` ([Puzzle.01](puzzle.md#puzzle)). Its `solution` is a [Board](#board). Each Atom is `[element, row, column, hydrogens]`, its hydrogens those bonded to it from the start ([Puzzle.07](puzzle.md#puzzle)). Also: the `id`s are unique, every Atom is inside the Grid (row below `rows`, column below `cols`) at its own point, the Atoms are in reading order, an Atom's hydrogens leave it room for at least one Bond, and the Atoms with their hydrogens are those of the formula.

Example: Puzzle 1.

```json
{
  "id": "acetonitrile", "name": "Acetonitrile", "formula": "C2H3N",
  "fact": "Acetonitrile has been found around young stars and in comets; on Earth it is a common solvent in labs.",
  "rows": 3, "cols": 1,
  "atoms": [["C", 0, 0, 3], ["C", 1, 0, 0], ["N", 2, 0, 0]],
  "solution": [[0, 1, 1], [1, 2, 3]]
}
```

## Board

[board.schema.json](schemas/board.schema.json): the Bonds of a Puzzle, as `[atom, atom, order]` ([Bond.11](puzzle.md#bond)). Atoms are indexes into the Puzzle's `atoms`, the lower first, and the Bonds are in order of their first Atom, then their second. Also: each pair of Atoms is a Dotted line of the Grid, and appears once.

It is only the Bonds, the same for a Puzzle's solution as for a Board being played: whether the solution was shown, and the undo history, are kept next to it, in [Progress](#progress).

Example: Acetonitrile with both Bonds, the solution above.

```json
[[0, 1, 1], [1, 2, 3]]
```

## Progress

[progress.schema.json](schemas/progress.schema.json): stored in the browser ([Progress.03](storage.md#progress)). Every field of Progress is optional; an entry in `boards` has all three. `boards` has an entry only for a Puzzle in progress ([Progress.05](storage.md#progress)) or solved ([Progress.06](storage.md#progress)), and is left out when there is none; each Board in it is one of that Puzzle's. A Puzzle's id is its `id` in `src/puzzle/puzzles.ts`, e.g. `acetic-acid`.

Example: Puzzles 1 and 2 solved, and Puzzle 3 open, with C═O made in two clicks.

```json
{
  "puzzles": { "acetonitrile": "solved", "acetic-acid": "solved" },
  "current": "glycine",
  "boards": {
    "glycine": { "bonds": [[2, 4, 2]], "revealed": false, "undo": [[], [[2, 4, 1]]] }
  }
}
```
