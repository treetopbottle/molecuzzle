# Features

## Puzzles

### Puzzle

- Puzzles: there are 13, in the order of the table below. Each gives exactly the Atoms of its Molecule on a Grid, and has exactly one solution (Puzzle.01)
- Start: a Puzzle opens with no Bonds and its Molecule hidden: the panel shows "Mystery molecule", "?" and "Bond every atom to find out what it is." (Puzzle.02)
- Open: any Puzzle opens from the Puzzles list, or with ‹ and › next to "Puzzle <n> of 13"; ‹ is disabled on Puzzle 1 and › on Puzzle 13 (Puzzle.03)
- List: per Puzzle a button with its number, ✓ if solved and 👁 if its solution was seen, named "Puzzle <n>: <name>, solved" or "…, solution seen" once it is either; the open Puzzle is marked. The header shows "Solved <k> of 13" (Puzzle.04)
- Badge: next to the counter, "Unsolved", "✓ Solved" or "Solution seen" for the open Puzzle (Puzzle.05)

Example (Puzzle.02):

```
Given no Puzzle is solved
When the Player opens Puzzle 3
Then the panel shows "Puzzle 3 of 13", "Unsolved", "?" and "Bond every atom to find out what it is."
And the Board is
  H
  ·
  C·H
  ·
  O
```

Example (Puzzle.03, Puzzle.04, Puzzle.05):

```
Given Puzzle 1 is solved and the solution of Puzzle 3 was seen
When the Player opens the game
Then the list shows "1 ✓", "2", "3 👁", and the header "Solved 1 of 13"
When the Player picks 13
Then Puzzle 13 opens, its badge says "Unsolved", and › is disabled
```

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

The Grids, solutions and facts are in `src/puzzles.js`.

### Help

- Show solution asks "Show the solution?"; after OK the Board shows the solution, the status says "Here is <name>. Reset and build it yourself to mark it solved.", and the Puzzle is marked solution seen, unless it was solved (Help.01)
- Retry: once the Board has no Bonds again, building the Molecule solves the Puzzle as usual (Help.02)

Example (Help.01, Help.02):

```
Given Puzzle 9, unsolved
When the Player clicks Show solution and confirms
Then the status is "Here is Urea. Reset and build it yourself to mark it solved." and the badge "Solution seen"
When the Player clicks Reset and builds Urea
Then the status is "✓ Solved! It's Urea." and the badge "✓ Solved"
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

- Bond: clicking a Dotted line bonds its Atoms with a single Bond (Bond.01)
- Stronger: clicking a Bond makes it one stronger: single to double, double to triple (Bond.02)
- Wrap: clicking a triple Bond, or a Bond one of whose Atoms has no room, removes it (Bond.03)
- Full: clicking a Dotted line where an Atom has no room makes no Bond; the message "<Element> already has all its bonds." shows (Bond.04)
- No crossing: clicking a Dotted line that crosses a Bond makes no Bond; the message "Bonds can't cross." shows (Bond.05)
- Weaker: right-clicking a Bond makes it one weaker; on a Dotted line it does nothing (Bond.06)
- Keys: Tab reaches each Dotted line and Bond, named "<Element> <place> to <Element> <place>: <no, single, double or triple> bond"; Enter or Space acts as a click, Backspace, Delete or - as a right-click (Bond.07)
- Undo, or Ctrl+Z / Cmd+Z, restores the Bonds as they were before the last change, up to 300 changes back in this Puzzle; disabled with nothing to undo (Bond.08)
- Reset removes every Bond, and Undo brings them back; disabled with no Bonds (Bond.09)
- Done: while the Board is solved or shows the solution, clicks don't change Bonds; Undo and Reset still work (Bond.10)

Example (Bond.01, Bond.02, Bond.03):

```
Given Puzzle 4, H·C·N
When the Player clicks C·N once, twice, three times, four times
Then the Board is H·C─N, H·C═N, H·C≡N, H·C·N
```

Example (Bond.04):

```
Given Puzzle 5, Methanol, with a Bond H 3,1 to H 3,2
When the Player clicks the Dotted line O 2,1 to H 3,1
Then no Bond is made and the message is "Hydrogen already has all its bonds."
```

Example (Bond.05):

```
Given Puzzle 11, Glycine, with a Bond H 2,1 to C 2,3
When the Player clicks the Dotted line O 1,2 to H 4,2
Then no Bond is made and the message is "Bonds can't cross."
```

Example (Bond.06, Bond.07):

```
Given Puzzle 4, with C≡N
When the Player right-clicks it
Then it is C═N
When the Player tabs to it and presses Delete
Then it is C─N
```

Example (Bond.08, Bond.09):

```
Given Puzzle 2, Ammonia, with Bonds H 1,1 to N 2,1 and N 2,1 to H 3,1
When the Player clicks Reset
Then there are no Bonds
When the Player presses Ctrl+Z
Then both Bonds are back
```

### Valence

- Needs: each Atom shows an orange badge with the Bonds it still needs, its valence minus its bond count (Valence.01)
- Complete: an Atom that needs none glows and has no badge (Valence.02)

Example:

```
Given Puzzle 3, Formaldehyde, with no Bonds
Then H, C, H and O need 1, 4, 1 and 2
When the Player makes C═O
Then C needs 2, and O glows with no badge
```

## Checking

### Check

After every change to the Bonds, the status line shows the first that applies:

- No Bonds: "Click a dotted line between two atoms to bond them." (Check.01)
- Open: "<N> atom(s) still need(s) bonds." (Check.02)
- Pieces: every Atom complete, but in more than one piece: "Every atom has its bonds, but they form more than one molecule. Everything must join up." (Check.03)
- Solved: every Atom complete, in one piece: "✓ Solved! It's <name>."; the Atoms pulse, the panel shows the name, formula and fact and "Next puzzle →" (not on Puzzle 13), and the Puzzle is marked solved (Check.04)

Example (Check.01, Check.02):

```
Given Puzzle 2, Ammonia, with no Bonds
Then the status is "Click a dotted line between two atoms to bond them."
When the Player bonds H 1,1 to N 2,1
Then the status is "3 atoms still need bonds."
```

Example (Check.03):

```
Given Puzzle 5, Methanol
When the Player builds H─H and H₂C═O apart
    H
    │
  O═C─H
  · ·
  H─H
Then the status is "Every atom has its bonds, but they form more than one molecule. Everything must join up."
```

Example (Check.04):

```
Given Puzzle 11, unsolved
When the Player builds Glycine
Then the status is "✓ Solved! It's Glycine.", the panel shows "Glycine", "C₂H₅NO₂", its fact and "Next puzzle →", and the badge "✓ Solved"
```

## Browser

### Progress

- Saved: which Puzzles are solved or seen, and the open Puzzle, are kept in the browser in the format of [Progress](schemas.md#progress); a reload opens the last Puzzle, with no Bonds (Progress.01)
- No storage: if the browser can't store data, the game works and keeps nothing (Progress.02)

Example (Progress.01):

```
Given a new browser
When the Player solves Puzzle 1, opens Puzzle 4 and reloads the page
Then Puzzle 4 is open and the list shows "Puzzle 1: Water, solved"
```

### Layout

- Screens: wider than 820 px, the Board is left of the panel; narrower, the Board is above it; the page never scrolls sideways. Tested at 1280×800 and 390×844 (Layout.01)
- Touch: tapping a Dotted line or Bond works as a click (Layout.02)
