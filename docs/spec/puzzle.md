# Puzzle

The Puzzles and the rules of the game: where Bonds can go, how they change, and when a Puzzle is solved. The rules give a status or a reason, not text: the [UI](ui.md) words and shows them ([decision 0011](../decisions.md#0011)).

## Puzzles

### Puzzle

- Puzzles: there are 20, in the order of the table below: by difficulty ([Puzzle.05](#puzzle)), easiest first, and a new Puzzle after those of the same difficulty ([decision 0021](../decisions.md#0021)). Each is a [Puzzle](schemas.md#puzzle), gives exactly the Atoms and hydrogens of its formula, each Atom at its own point on the Grid, and has exactly one solution, its `solution` ([decision 0008](../decisions.md#0008)) (Puzzle.01)
- Start: a Puzzle starts with no Bonds (Puzzle.02)
- Go on: a Puzzle can also start where it was left: from a [Board](schemas.md#board), whether the solution was shown ([Help.01](#help)), and its undo history. If that Board, or one in its history, can't be on its Grid, it starts with no Bonds, nothing to undo and the solution not shown: a Bond that isn't on a Dotted line, a pair of Atoms bonded twice, or Bonds that cross; an Atom with more Bonds than it needs is fine ([decision 0025](../decisions.md#0025)) (Puzzle.03)
- Size: every Grid has at most 6 rows and 5 columns, so the Board fits a phone ([decision 0019](../decisions.md#0019)) (Puzzle.04)
- Difficulty: a Puzzle's difficulty is the number of its Dotted lines, plus twice the number of those its solution leaves empty. Each Dotted line is a connection to look at, and each empty one a Bond to rule out; a ring that is only traced leaves none empty, so it isn't a choice ([decision 0021](../decisions.md#0021)) (Puzzle.05)
- Removed: Puzzles taken out of the game are kept, in the table of removed Puzzles below and in `src/puzzle/removed.js`; no Puzzle has the id or the formula of a removed one ([decision 0022](../decisions.md#0022)). Each is a [Puzzle](schemas.md#puzzle) with exactly one solution, as Puzzle.01, Puzzle.04 and Puzzle.07 ask, but not in the game's order, and with any number of loops; Ammonia and Water are one Atom each, with no room for a Bond and an empty solution ([decision 0023](../decisions.md#0023)) (Puzzle.06)
- Hydrogens: an Atom has a number of hydrogens bonded to it from the start. They aren't Atoms on the Grid, and no change touches them ([decision 0023](../decisions.md#0023)) (Puzzle.07)
- Loops: every Puzzle after the first three has at least 2 loops ([decision 0024](../decisions.md#0024)) (Puzzle.08)
- Budget: a Puzzle's budget is the number of Bonds its solution makes, a double Bond counting 2 and a triple 3: half of what its Atoms need together. It isn't stored, and it is not a limit: the Player can use more ([decision 0025](../decisions.md#0025)) (Puzzle.09)

| # | Molecule | Formula | Difficulty |
|---|---|---|---|
| 1 | Acetonitrile | C₂H₃N | 2 |
| 2 | Acetic acid | C₂H₄O₂ | 3 |
| 3 | Glycine | C₂H₅NO₂ | 7 |
| 4 | Morpholine | C₄H₉NO | 9 |
| 5 | Cyclohexene | C₆H₁₀ | 9 |
| 6 | Glycerol | C₃H₈O₃ | 11 |
| 7 | 1,4-Benzoquinone | C₆H₄O₂ | 11 |
| 8 | Serine | C₃H₇NO₃ | 12 |
| 9 | Malic acid | C₄H₆O₅ | 17 |
| 10 | Tartaric acid | C₄H₆O₆ | 21 |
| 11 | Glutamic acid | C₅H₉NO₄ | 21 |
| 12 | Glucose | C₆H₁₂O₆ | 24 |
| 13 | Citric acid | C₆H₈O₇ | 27 |
| 14 | Biotin | C₁₀H₁₆N₂O₃S | 32 |
| 15 | N-Acetylglucosamine | C₈H₁₅NO₆ | 33 |
| 16 | Cystine | C₆H₁₂N₂O₄S₂ | 34 |
| 17 | Pantothenic acid | C₉H₁₇NO₅ | 35 |
| 18 | Tetraglycine | C₈H₁₄N₄O₅ | 43 |
| 19 | N-Acetylneuraminic acid | C₁₁H₁₉NO₉ | 51 |
| 20 | Glutathione | C₁₀H₁₇N₃O₆S | 52 |

Removed Puzzles, which aren't added again, and why, in the layout each had when it was removed:

| Molecule | Formula | Why |
|---|---|---|
| Ammonia | NH₃ | No empty Dotted line, nothing to rule out |
| Carbon disulfide | CS₂ | 3 Atoms in a row, with nothing to rule out |
| Chloroform | CHCl₃ | One C with four neighbours, nothing to rule out |
| Methanethiol | CH₄S | Methanol's layout, with S for O |
| Phosgene | CCl₂O | Formaldehyde's layout, with Cl for H |
| Vinyl chloride | C₂H₃Cl | Ethylene's layout, with Cl for an H |
| Tetrafluoroethylene | C₂F₄ | Ethylene's layout, with F for H |
| Iodoethane | C₂H₅I | Halothane's layout, with other symbols |
| Water | H₂O | With its hydrogens on its Atom, one Atom and nothing to bond |
| Hydrogen cyanide | HCN | Two Atoms and one Dotted line |
| Formaldehyde | CH₂O | Two Atoms and one Dotted line |
| Methanol | CH₄O | Two Atoms and one Dotted line |
| Ethylene | C₂H₄ | Two Atoms and one Dotted line |
| Acrylonitrile | C₃H₃N | No loop: every Dotted line is a Bond |
| Urea | CH₄N₂O | No loop: every Dotted line is a Bond |
| Acetone | C₃H₆O | No loop: every Dotted line is a Bond |
| Ethanol | C₂H₆O | No loop: every Dotted line is a Bond |
| Halothane | C₂HBrClF₃ | Its loops close on F, Cl and Br, so nothing is left to choose |
| Lactic acid | C₃H₆O₃ | One loop, closed on its CH₃ and OH |
| Ethyl acetate | C₄H₈O₂ | One loop, closed on its CH₃ |
| Alanine | C₃H₇NO₂ | One loop, closed on its CH₃ |
| Cysteine | C₃H₇NO₂S | Serine's layout, with S for O |
| Threonine | C₄H₉NO₃ | Its loops close on CH₃ and OH; in the layout tried, the obvious moves leave nothing to choose |
| Valine | C₅H₁₁NO₂ | Its loops close on its two CH₃; in the layout tried, the obvious moves leave nothing to choose |
| Cyclohexanol | C₆H₁₂O | A plain ring of single Bonds on a narrow ladder, with one empty Dotted line: the Player traces the ring, with nothing to rule out; found too easy in play |
| Cyclohexane-1,4-dione | C₆H₈O₂ | The same ring, with two C═O at its ends, each on a single Dotted line; found too easy in play |

The Grids, solutions and facts are in `src/puzzle/puzzles.js`.

Example (Puzzle.01, Puzzle.02):

```
Given Puzzle 2, Acetic acid
Then it starts with the Board
      O
      ·
  CH₃·C
      ·
      OH
And its one solution is
      O
      ║
  CH₃─C
      │
      OH
```

Example (Puzzle.04):

```
Given Puzzle 12, Glucose, Puzzle 13, Citric acid, Puzzle 15, N-Acetylglucosamine, and Puzzle 19, N-Acetylneuraminic acid
Then their Grids have 3 rows and 5 columns, 6 rows and 3 columns, 5 rows and 5 columns, and 6 rows and 5 columns
```

Example (Puzzle.05):

```
Given Puzzle 3, Glycine, with 5 Dotted lines, of which its solution leaves 1 empty
Then its difficulty is 5 + 2 × 1 = 7
Given Puzzle 4, Morpholine, a ring with 7 Dotted lines, of which its solution leaves 1 empty
Then its difficulty is 7 + 2 × 1 = 9
```

Example (Puzzle.06):

```
Given Ammonia, NH₃, is removed
Then no Puzzle has the id ammonia or the formula NH3
And Ammonia's Grid is 1 by 1, with one N with 3 hydrogens, and its solution has no Bonds
```

Example (Puzzle.07):

```
Given Puzzle 2, Acetic acid
Then its Atoms are an O with no hydrogens, a C with 3, a C with none and an O with 1
```

Example (Puzzle.08):

```
Given Puzzle 6, Glycerol, with 6 Atoms and 7 Dotted lines
Then it has 7 − 6 + 1 = 2 loops
```

### Generate

- Layout: `node scripts/generate.js "<bonds>" [tries] [maxRows] [maxCols] [seed]` searches for a Grid of at most `maxRows` by `maxCols`, 6 by 5 if they are left out ([Puzzle.04](#puzzle)), on which the Molecule with these Bonds is the only solution, and prints its `rows`, `cols`, `atoms` and `solution` as in a [Puzzle](schemas.md#puzzle), the Atoms in reading order, and its difficulty ([Puzzle.05](#puzzle)); the same arguments print the same layout (Generate.01)
- None: if it can't read a Bond, or a Bond has an Atom whose Element is H or isn't in the [table of valences](#board), or whose hydrogens leave it no room for a Bond, it stops with "can't read <bond>", and if no try has exactly one solution, these Bonds, with "no unique layout found": so also for Bonds that don't give each Atom its valence (Generate.02)
- Rings: as it places each Atom in line with its partners already placed, inside the Grid, and goes back when one has no place, it finds layouts of Molecules with several rings, which Atoms placed as a tree rarely close ([decision 0026](../decisions.md#0026)) (Generate.03)

Bonds are written between labelled Atoms, `-` `=` `#` a single, double and triple Bond. A label is the Atom as in a formula, its Element and then its hydrogens, such as `C`, `CH3`, `OH` or `NH2`; Atoms with the same label are told apart by `:` and a name after it, such as `CH2:a` and `CH2:b`.

Example (Puzzle.03):

```
Given Puzzle 1, Acetonitrile, the Board [[0, 1, 1]] and the undo history [[]]
Then it starts with a single Bond CH₃ 1,1 to C 2,1, and no other
When the last change is undone
Then there are no Bonds
Given the Board [[0, 2, 1]] instead, which isn't on a Dotted line
Then it starts with no Bonds, and nothing to undo
```

Example (Puzzle.09):

```
Given Puzzle 2, Acetic acid, whose solution is C═O, CH₃─C and C─OH
Then its budget is 2 + 1 + 1 = 4, half of 2 + 1 + 4 + 1 = 8, what its Atoms need
```

Example (Generate.01):

```
Given the Bonds "CH3-C C#N", 2000 tries, at most 3 by 3, seed 1
Then it prints rows: 1, cols: 3, atoms: [["N",0,0,0],["C",0,1,0],["C",0,2,3]], solution: [[0,1,3],[1,2,1]] and difficulty 2
```

Example (Generate.03):

```
Given Caffeine's Bonds "N:1-C:2 C:2=O:2 C:2-N:3 N:3-C:4 C:4=C:5 C:5-C:6 C:6=O:6 C:6-N:1 C:4-N:9 N:9=CH:8 CH:8-N:7 N:7-C:5 N:1-CH3:a N:3-CH3:b N:7-CH3:c", 200 tries, seed 1
Then it prints a layout of at most 6 by 5 whose one solution is these Bonds
```

Example (Generate.02):

```
Given the Bonds "CH3-C C~N"
Then it stops with "can't read C~N"
```

Example (Generate.02), an Element the game doesn't have:

```
Given the Bonds "CH3-Xx"
Then it stops with "can't read CH3-Xx"
```

## Board

| Element | Valence (Bonds) |
|---|---|
| H | 1 |
| F, Cl, Br, I | 1 |
| O | 2 |
| S | 2 |
| N | 3 |
| C | 4 |

H is only ever a hydrogen on an Atom ([Puzzle.07](#puzzle)). An Atom's bond count is the sum of its Bonds: single 1, double 2, triple 3. It needs its valence, minus its hydrogens, minus its bond count, which is below 0 when it has too many ([Valence.01](#valence)).

### Grid

- Dotted lines: from each Atom to the nearest Atom in the same row, and in the same column, with no Atom in between (Grid.01)
- Crossing: a Dotted line along a row and one along a column cross when they meet at a point that is not one of their Atoms (Grid.02)

Example (Grid.01):

```
Given Puzzle 3, Glycine
Then the Board is
  OH··NH₂
  ·   ·
  C···CH₂
  ·
  O
```

Example (Grid.02), on a Grid that isn't a Puzzle's:

```
Given a Grid of 3 by 3, with O at 1,2 and 3,2, and CH₂ at 2,1 and 2,3
Then the Dotted line O 1,2 to O 3,2 crosses CH₂ 2,1 to CH₂ 2,3, at 2,2
```

Example (Grid.02):

```
Given Puzzle 3, Glycine
Then the Dotted lines OH 1,1 to NH₂ 1,2 and OH 1,1 to C 2,1 meet at OH 1,1, and don't cross
```

### Bond

A change makes a Dotted line or Bond one stronger or one weaker.

- Bond: stronger on a Dotted line bonds its Atoms with a single Bond (Bond.01)
- Stronger: stronger on a Bond makes it single to double, double to triple (Bond.02)
- Wrap: stronger on a triple Bond removes it, whatever its Atoms have (Bond.03)
- Over: an Atom can have more Bonds than it needs, and the Player can use more Bonds than the budget ([Puzzle.09](#puzzle)); then the Puzzle isn't solved ([Check.04](#check)) (Bond.04)
- No crossing: stronger on a Dotted line that crosses a Bond makes no Bond; the reason is `crossing`, the only reason given when a Bond isn't made (Bond.05)
- Weaker: weaker on a Bond makes it single to none, double to single, triple to double; on a Dotted line it does nothing (Bond.06)
- Undo restores the Bonds as they were before the last change, up to 100 changes back in this Puzzle, since it was last reset or solved: with each change past 100, the oldest is forgotten. With nothing to undo it does nothing (Bond.08)
- Reset removes every Bond and the undo history; with neither, it does nothing ([decision 0015](../decisions.md#0015)) (Bond.09)
- Done: while the Board is solved or shows the solution, changes don't change Bonds; Reset still works, and Undo while it shows the solution. Solving removes the undo history (Bond.10)
- State: the Bonds are a [Board](schemas.md#board) (Bond.11)

Example (Bond.01, Bond.02, Bond.03):

```
Given Puzzle 1, Acetonitrile, with no Bonds
When C 2,1 to N 3,1 is made stronger once, twice, three times, four times
Then it is a single, a double and a triple Bond, and then no Bond
```

Example (Bond.04):

```
Given Puzzle 3, Glycine, with a Bond OH 1,1 to C 2,1
When the Dotted line OH 1,1 to NH₂ 1,2 is made stronger
Then there is a single Bond OH 1,1 to NH₂ 1,2, and OH needs −1
When it is made stronger three more times
Then it is a double Bond, a triple Bond, and then no Bond
```

Example (Bond.05), on the Grid of the Grid.02 example:

```
Given a Bond CH₂ 2,1 to CH₂ 2,3
When the Dotted line O 1,2 to O 3,2 is made stronger
Then no Bond is made, and the reason is crossing
```

Example (Bond.06):

```
Given Puzzle 1, with a triple Bond C 2,1 to N 3,1
When it is made weaker, twice
Then it is a double, then a single Bond
```

Example (Bond.08):

```
Given Puzzle 1, with no Bonds
When C 2,1 to N 3,1 is made stronger 101 times
Then Undo goes back 100 times, to the Board after the first change, a single Bond C 2,1 to N 3,1, and then does nothing
```

Example (Bond.08, Bond.09):

```
Given Puzzle 2, Acetic acid, with Bonds CH₃ 2,1 to C 2,2 and then C 2,2 to OH 3,2
When the last change is undone
Then only CH₃ 2,1 to C 2,2 is left
When it is reset
Then there are no Bonds, and nothing to undo
```

Example (Bond.10):

```
Given Puzzle 1, Acetonitrile, with a Bond CH₃ 1,1 to C 2,1
When C 2,1 to N 3,1 is made stronger three times
Then it is solved, and there is nothing to undo
```

Example (Bond.11):

```
Given Puzzle 1, Acetonitrile, with a Bond CH₃ 1,1 to C 2,1
Then the Board is [[0, 1, 1]]
```

### Valence

- Needs: each Atom needs its Element's valence, in the table above, minus its hydrogens ([Puzzle.07](#puzzle)), minus its bond count; below 0 it has too many Bonds (Valence.01)
- Complete: an Atom that needs none is complete (Valence.02)
- Count: the Atoms with too few Bonds, those that need more than 0, and the Atoms with too many, those that need less than 0; and the Bonds used, the sum of all bond counts halved, that is the sum of the orders of the Bonds; the UI shows only the Bonds used ([decision 0025](../decisions.md#0025)) (Valence.03)

Example:

```
Given Puzzle 2, Acetic acid, with no Bonds
Then O, CH₃, C and OH need 2, 1, 4 and 1
When C═O is made
Then C needs 2, and O is complete
```

Example (Valence.03), Puzzle 2, Acetic acid, with a budget of 4 ([Puzzle.09](#puzzle)):

```
Given Puzzle 2, Acetic acid, with no Bonds
Then 4 Atoms have too few Bonds, none has too many, and 0 Bonds are used
When O≡C and C─OH are made
Then O needs −1, CH₃ needs 1, and C and OH are complete
And 1 Atom has too few Bonds, 1 has too many, and 4 Bonds are used, as many as the budget, and it isn't solved
```

## Checking

### Check

After every change to the Bonds, the status is the first that applies:

- Empty: no Bonds (Check.01)
- Open: some Atom has too few Bonds or too many ([Valence.03](#valence)), with how many of each (Check.02)
- Pieces: every Atom complete, but in more than one piece (Check.03)
- Solved: every Atom complete, in one piece; the Puzzle is solved, and so the Bonds used are the budget ([Puzzle.09](#puzzle)) (Check.04)

Example (Check.01, Check.02):

```
Given Puzzle 2, Acetic acid, with no Bonds
Then the status is empty
When CH₃ 2,1 to C 2,2 is bonded
Then the status is open, with 3 Atoms with too few Bonds and none with too many
```

Example (Check.03):

```
Given Puzzle 6, Glycerol
When OH─OH is built apart from the rest
  OH──CH₂
  ·   │
  CH₂═CH
  ·   ·
  OH──OH
Then the status is pieces
```

Example (Check.04):

```
Given Puzzle 3
When Glycine is built
Then the status is solved
```

### Help

- Show solution: the Board becomes the solution, and the solution was shown until the Board has no Bonds again, also when Undo goes back past it. While it was, a Board with every Atom complete in one piece has the status `revealed` instead of solved: the Puzzle isn't solved ([decision 0004](../decisions.md#0004)). On a Board that is already solved, the status stays solved (Help.01)
- Retry: once the Board has no Bonds again, building the Molecule solves the Puzzle as usual (Help.02)

Example (Help.01, Help.02):

```
Given Puzzle 8, Serine
When the solution is shown
Then the status is revealed
When it is reset and Serine is built
Then the status is solved
```
