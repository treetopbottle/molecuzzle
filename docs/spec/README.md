# Specification

The functional specification of Molecuzzle from a user perspective, using examples for further clarification. Roles and domain entities can be found in the [README](../../README.md); the reasons are in the [decisions](../decisions.md).

The features are in one file per component ([decision 0011](../decisions.md#0011)):

- [puzzle.md](puzzle.md): the Puzzles and the rules of the game
- [storage.md](storage.md): what is kept in the browser, where, how and who can read it
- [ui.md](ui.md): what the Player sees and does, with screenshots

`src/app.js` wires them into the game; what it does is in the features it wires, such as [Progress.01](storage.md#progress), so it has no features of its own. Each feature lists its rules. A rule has an id, `<Feature>.<NN>`, unique over all files, and an example. Each rule is tested by a unit, component or end-to-end test whose name starts with its id.

A general narrative is used to describe a typical usage flow, see [narratives.md](./narratives.md).

## Scope

In scope: Puzzles on a Grid, where the Player fills in the Bonds so every Atom has exactly its valence ([decision 0001](../decisions.md#0001)), with every hydrogen bonded to its Atom from the start, drawn beside it ([decision 0023](../decisions.md#0023)), and each Puzzle has exactly one solution ([decision 0008](../decisions.md#0008)); seeing a solution; Progress kept in the browser ([decision 0005](../decisions.md#0005)).

Left out: building freely without a Grid, recognising other Molecules (Isomers), charges and ions, Elements other than H, C, N, O, S and the halogens F, Cl, Br and I (the game knows them, but no Puzzle uses them and the key leaves them out), stereochemistry, 3D shapes, and saving Progress anywhere but the browser. Other puzzle modes are in `prototypes/`, outside this spec.

## Examples

The examples fit inline, or are screenshots. The formats of a Puzzle, a Board and the stored Progress are in [schemas.md](schemas.md).

Boards in examples are drawn as text, as the unit tests do: Atoms by their label as in a formula, their Element and then their hydrogens (C, CH₂, OH, NH₂), at the Grid points, `·` a Dotted line, `─ │` single, `═ ║` double, and `≡ ⦀` triple Bonds. Places are written "row,column", counted from 1. Every Grid point is as wide as the longest label on the Board, with a shorter label in its first characters, so the columns are one character more apart; a Dotted line or Bond along a row fills every character between its two labels, and one along a column runs under their first characters. Glycine, with no Bonds and solved:

```
  OH··NH₂            OH··NH₂
  ·   ·              │   │
  C···CH₂            C───CH₂
  ·                  ║
  O                  O
```
