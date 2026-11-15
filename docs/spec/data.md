# Data

What the game keeps, where and how, and who can read it ([0005](../decisions.md#0005)).

### Progress

- What: which Puzzles are solved, the open Puzzle, and every Puzzle in progress (Progress.05). A Puzzle is marked solved when it is solved ([Check.04](puzzle.md#check)), never unmarked, and becomes the open Puzzle when it opens (Progress.01)
- No storage: if the browser can't store data, the game works and keeps nothing (Progress.02)
- How: in the browser's `localStorage`, under the key `molecuzzle-v2`, as a [Progress](schemas.md#progress); a missing or unreadable value counts as empty, and a field, or a Puzzle's entry, that doesn't fit the schema is left out (Progress.03)
- Who: only the Player's browser has it: the page sends nothing over the network. Pages from the same origin share it, so on GitHub Pages the build of `main` and every branch build read and write the same Progress (Progress.04)
- In progress: a Puzzle with Bonds or something to undo, whose Board isn't solved, is in progress. After every change, each one keeps its Bonds, whether they show the solution, and its undo history, so after opening another Puzzle, a reload, a closed browser or a crash, the Player goes on where they were ([Puzzle.03](puzzle.md#puzzle)). Solving or resetting it ([Bond.09](puzzle.md#bond), [Bond.10](puzzle.md#bond)) removes what was kept, so it opens again with no Bonds ([0015](../decisions.md#0015)) (Progress.05)

Example (Progress.01, Progress.03):

```
Given a new browser
When the Player solves Puzzle 1, opens Puzzle 4 and reloads the page
Then Puzzle 4 is open, with no Bonds, and Puzzle 1 is solved
And the browser stores {"puzzles":{"water":"solved"},"current":"hydrogen-cyanide"}
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
Given Puzzle 4, with H─C·N, and then Puzzle 5 open
When the Player closes the browser, opens the game again and opens Puzzle 4
Then it is H─C·N, and Undo makes it H·C·N
And before that the browser stores {"puzzles":{},"current":"methanol","boards":{"hydrogen-cyanide":{"bonds":[[0,1,1]],"revealed":false,"undo":[[]]}}}
```

Example (Progress.05):

```
Given Puzzle 9, unsolved, with its solution shown
When the Player reloads the page
Then the Board shows the solution, and Puzzle 9 is still unsolved
```

Example (Progress.05):

```
Given Puzzle 1, Water, with H─O
When the Player bonds O 1,2 to H 2,2, and reloads the page
Then Puzzle 1 is solved, and opens with no Bonds
```
