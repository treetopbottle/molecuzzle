# Puzzle

The Puzzles and the rules of the game: where Bonds can go, how they change, and when a Puzzle is solved. The rules give a status or a reason, not text: the [UI](ui.md) words and shows them ([0011](../decisions.md#0011)).

## Puzzles

### Puzzle

- Puzzles: there are 13, in the order of the table below. Each is a [Puzzle](schemas.md#puzzle), gives exactly the Atoms of its formula, each at its own point on the Grid, and has exactly one solution, its `solution` ([0008](../decisions.md#0008)) (Puzzle.01)
- Start: a Puzzle starts with no Bonds (Puzzle.02)
- Go on: a Puzzle can also start from a [Board](schemas.md#board), and whether it shows the solution, with nothing to undo. A Board that can't be on its Grid starts it with no Bonds: a Bond that isn't on a Dotted line, Bonds that cross, or an Atom with more Bonds than its valence (Puzzle.03)

| # | Molecule | Formula |
|---|---|---|
| 1 | Water | H₂O |
| 2 | Ammonia | NH₃ |
| 3 | Formaldehyde | CH₂O |
| 4 | Hydrogen cyanide | HCN |
| 5 | Methanol | CH₄O |
| 6 | Ethylene | C₂H₄ |
| 7 | Acrylonitrile | C₃H₃N |
| 8 | Acetic acid | C₂H₄O₂ |
| 9 | Urea | CH₄N₂O |
| 10 | Ethanol | C₂H₆O |
| 11 | Glycine | C₂H₅NO₂ |
| 12 | Acetone | C₃H₆O |
| 13 | Alanine | C₃H₇NO₂ |

The Grids, solutions and facts are in `src/puzzle/puzzles.js`.

Example (Puzzle.01, Puzzle.02):

```
Given Puzzle 3, Formaldehyde
Then it starts with the Board
  H
  ·
  C·H
  ·
  O
And its one solution is
  H
  │
  C─H
  ║
  O
```

### Generate

- Layout: `node scripts/generate.js "<bonds>" [tries] [maxRows] [maxCols] [seed]` searches for a Grid of at most `maxRows` by `maxCols` on which the Molecule with these Bonds is the only solution, and prints its `rows`, `cols`, `atoms` and `solution` as in a [Puzzle](schemas.md#puzzle), the Atoms in reading order; the same arguments print the same layout (Generate.01)
- None: if it can't read a Bond it stops with "can't read <bond>", and if no try gives exactly one solution, with "no unique layout found" (Generate.02)

Bonds are written between labelled Atoms: the label's letters are the Element, `-` `=` `#` a single, double and triple Bond.

Example (Puzzle.03):

```
Given Puzzle 4, Hydrogen cyanide, and the Board [[0, 1, 1]]
Then it starts with H─C·N, and nothing to undo
Given the Board [[0, 2, 1]] instead, which isn't on a Dotted line
Then it starts with H·C·N
```

Example (Generate.01):

```
Given the Bonds "H1-O1 O1-H2", 2000 tries, at most 3 by 3, seed 1
Then it prints rows: 3, cols: 1, atoms: [["H",0,0],["O",1,0],["H",2,0]], solution: [[0,1,1],[1,2,1]]
```

Example (Generate.02):

```
Given the Bonds "H1-O1 O1~H2"
Then it stops with "can't read O1~H2"
```

## Board

| Element | Valence (Bonds) |
|---|---|
| H | 1 |
| O | 2 |
| N | 3 |
| C | 4 |

An Atom's bond count is the sum of its Bonds: single 1, double 2, triple 3. It has room for its valence minus its bond count.

### Grid

- Dotted lines: from each Atom to the nearest Atom in the same row, and in the same column, with no Atom in between (Grid.01)
- Crossing: a Dotted line along a row and one along a column cross when they meet at a point that is not one of their Atoms (Grid.02)

Example (Grid.01, Grid.02):

```
Given Puzzle 11, Glycine
Then the Board is
    O·C·O·H
    · · · ·
  H···C···H
    · · ·
    · · ·
    · · ·
    H·N·H
And the Dotted line H 2,1 to C 2,3 crosses O 1,2 to H 4,2, but not C 1,3 to C 2,3
```

### Bond

A change makes a Dotted line or Bond one stronger or one weaker.

- Bond: stronger on a Dotted line bonds its Atoms with a single Bond (Bond.01)
- Stronger: stronger on a Bond makes it single to double, double to triple (Bond.02)
- Wrap: stronger on a triple Bond, or on a Bond one of whose Atoms has no room, removes it (Bond.03)
- Full: stronger on a Dotted line where an Atom has no room makes no Bond; the reason is `full`, with that Atom (Bond.04)
- No crossing: stronger on a Dotted line that crosses a Bond makes no Bond; the reason is `crossing` (Bond.05)
- Weaker: weaker on a Bond makes it single to none, double to single, triple to double; on a Dotted line it does nothing (Bond.06)
- Undo restores the Bonds as they were before the last change, up to 300 changes back in this Puzzle; with nothing to undo it does nothing (Bond.08)
- Reset removes every Bond, as one change that Undo brings back; with no Bonds it does nothing (Bond.09)
- Done: while the Board is solved or shows the solution, changes don't change Bonds; Undo and Reset still work (Bond.10)
- State: the Bonds are a [Board](schemas.md#board) (Bond.11)

Example (Bond.01, Bond.02, Bond.03):

```
Given Puzzle 4, H·C·N
When C·N is made stronger once, twice, three times, four times
Then the Board is H·C─N, H·C═N, H·C≡N, H·C·N
```

Example (Bond.04):

```
Given Puzzle 5, Methanol, with a Bond H 3,1 to H 3,2
When the Dotted line O 2,1 to H 3,1 is made stronger
Then no Bond is made, and the reason is full, with H 3,1
```

Example (Bond.05):

```
Given Puzzle 11, Glycine, with a Bond H 2,1 to C 2,3
When the Dotted line O 1,2 to H 4,2 is made stronger
Then no Bond is made, and the reason is crossing
```

Example (Bond.06):

```
Given Puzzle 4, with C≡N
When it is made weaker, twice
Then it is C═N, then C─N
```

Example (Bond.08, Bond.09):

```
Given Puzzle 2, Ammonia, with Bonds H 1,1 to N 2,1 and N 2,1 to H 3,1
When it is reset
Then there are no Bonds
When the last change is undone
Then both Bonds are back
```

Example (Bond.11):

```
Given Puzzle 1, Water, with a Bond H 1,1 to O 1,2
Then the Board is [[0, 1, 1]]
```

### Valence

- Needs: each Atom needs its valence minus its bond count (Valence.01)
- Complete: an Atom that needs none is complete (Valence.02)

Example:

```
Given Puzzle 3, Formaldehyde, with no Bonds
Then H, C, H and O need 1, 4, 1 and 2
When C═O is made
Then C needs 2, and O is complete
```

## Checking

### Check

After every change to the Bonds, the status is the first that applies:

- Empty: no Bonds (Check.01)
- Open: some Atoms need Bonds, with how many Atoms (Check.02)
- Pieces: every Atom complete, but in more than one piece (Check.03)
- Solved: every Atom complete, in one piece; the Puzzle is solved (Check.04)

Example (Check.01, Check.02):

```
Given Puzzle 2, Ammonia, with no Bonds
Then the status is empty
When H 1,1 to N 2,1 is bonded
Then the status is open, with 3 Atoms
```

Example (Check.03):

```
Given Puzzle 5, Methanol
When H─H and H₂C═O are built apart
    H
    │
  O═C─H
  · ·
  H─H
Then the status is pieces
```

Example (Check.04):

```
Given Puzzle 11
When Glycine is built
Then the status is solved
```

### Help

- Show solution: the Board becomes the solution, and the status is `revealed` instead of solved: the Puzzle isn't solved ([0004](../decisions.md#0004)). On a Board that is already solved, the status stays solved (Help.01)
- Retry: once the Board has no Bonds again, building the Molecule solves the Puzzle as usual (Help.02)

Example (Help.01, Help.02):

```
Given Puzzle 9, Urea
When the solution is shown
Then the status is revealed
When it is reset and Urea is built
Then the status is solved
```
