# Data

What the game keeps, where and how, and who can read it ([0005](../decisions.md#0005)).

### Progress

- What: which Puzzles are solved, and the open Puzzle with its Board (Progress.05). A Puzzle is marked solved when it is solved ([Check.04](puzzle.md#check)), never unmarked, and becomes the open Puzzle when it opens (Progress.01)
- No storage: if the browser can't store data, the game works and keeps nothing (Progress.02)
- How: in the browser's `localStorage`, under the key `molecuzzle-v2`, as a [Progress](schemas.md#progress); a missing or unreadable value counts as empty, and a field, or a Puzzle's entry, that doesn't fit the schema is left out (Progress.03)
- Who: only the Player's browser has it: the page sends nothing over the network. Pages from the same origin share it, so on GitHub Pages the build of `main` and every branch build read and write the same Progress (Progress.04)
- Board: after every change, the Bonds of the open Puzzle are kept, and whether they show the solution, so after a reload, a closed browser or a crash the Player goes on where they were ([Puzzle.03](puzzle.md#puzzle)), with nothing to undo. Opening another Puzzle starts it with no Bonds, and its Board takes their place ([0014](../decisions.md#0014)) (Progress.05)

Example (Progress.01, Progress.03):

```
Given a new browser
When the Player solves Puzzle 1, opens Puzzle 4 and reloads the page
Then Puzzle 4 is open, with no Bonds, and Puzzle 1 is solved
And the browser stores {"puzzles":{"water":"solved"},"current":"hydrogen-cyanide","board":[],"revealed":false}
```

Example (Progress.03):

```
Given the browser stores {"puzzles":{"water":"solved","urea":"seen"},"current":7}
When the game opens
Then only Puzzle 1 is solved, and Puzzle 1 is open
```

Example (Progress.04):

```
Given the game is opened, a Puzzle solved and the page reloaded
Then the only request the page made is for the page itself
```

Example (Progress.05):

```
Given Puzzle 4 is open, with H─C·N
When the Player closes the browser and opens the game again
Then Puzzle 4 is open, with H─C·N, and Undo is disabled
And the browser stores {"puzzles":{},"current":"hydrogen-cyanide","board":[[0,1,1]],"revealed":false}
```

Example (Progress.05):

```
Given Puzzle 9, unsolved, with its solution shown
When the Player reloads the page
Then the Board shows the solution, and Puzzle 9 is still unsolved
```
