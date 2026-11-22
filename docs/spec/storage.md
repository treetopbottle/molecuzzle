# Storage

What the game keeps, where and how, and who can read it ([decision 0005](../decisions.md#0005)).

### Progress

- What: which Puzzles are solved, the open Puzzle, and the Boards of Puzzles in progress (Progress.05) or solved (Progress.06). A Puzzle is marked solved when it is solved ([Check.04](puzzle.md#check)), never unmarked, and becomes the open Puzzle when it opens; if the open Puzzle is missing or unknown, Puzzle 1 opens (Progress.01)
- No storage: if the browser can't store data, the game works and keeps nothing (Progress.02)
- How: in the browser's `localStorage`, under the key `molecuzzle-v4`, as a [Progress](schemas.md#progress); a missing or unreadable value counts as empty, and a field, or a Puzzle's entry, that doesn't fit the schema is left out (Progress.03)
- Who: only the Player's browser has it: the page sends nothing over the network. Pages from the same origin share it, so on GitHub Pages the build of `main` and every branch build read and write the same Progress (Progress.04)
- In progress: a Puzzle with Bonds or something to undo, whose status isn't solved ([Check.04](puzzle.md#check)), is in progress. After every change, Undo, Reset and Show solution, it keeps its Bonds, whether the solution was shown ([Help.01](puzzle.md#help)), and its undo history, so after opening another Puzzle, a reload, a closed browser or a crash, the Player goes on where they were ([Puzzle.03](puzzle.md#puzzle)). Resetting it ([Bond.09](puzzle.md#bond)) removes what was kept, so it opens again with no Bonds ([decision 0015](../decisions.md#0015)); solving it keeps it as solved (Progress.06) (Progress.05)
- Solved: a Puzzle whose status is solved ([Check.04](puzzle.md#check)) keeps its Bonds, with nothing to undo ([Bond.10](puzzle.md#bond)) and the solution not shown, so it opens again solved, as the Player built it, until it is reset ([Bond.09](puzzle.md#bond)), which removes what was kept. A Puzzle marked solved with nothing kept opens with no Bonds, as after a reset ([decision 0017](../decisions.md#0017)) (Progress.06)

Example (Progress.01), solved Puzzles and the open one are kept over a reload:

```
Given a new browser
When the Player solves Puzzle 1, opens Puzzle 2 and reloads the page
Then Puzzle 2 is open, with no Bonds, and Puzzle 1 is solved
And the browser stores {"puzzles":{"acetonitrile":"solved"},"current":"acetic-acid","boards":{"acetonitrile":{"bonds":[[0,1,1],[1,2,3]],"revealed":false,"undo":[]}}}
```

Example (Progress.03), wrong data is left out, and the rest still loads:

```
Given the browser stores {"puzzles":{"acetonitrile":"solved","glycine":"seen"},"current":7}
When the game opens
Then only Puzzle 1 is solved: "seen" isn't a state, so Glycine's entry is left out
And Puzzle 1 is open: 7 isn't a Puzzle's id, so current is left out
```

Example (Progress.04), nothing leaves the browser:

```
Given the game is opened, a Puzzle solved and the page reloaded
Then the only request the page made is for the page itself
```

Example (Progress.05), a Puzzle in progress, Undo included, is kept after the browser closes:

```
Given Puzzle 1, with a Bond CH₃ 1,1 to C 2,1, and then Puzzle 2 open
When the Player closes the browser, opens the game again and opens Puzzle 1
Then it has that Bond, and Undo leaves no Bonds
And before that the browser stores {"puzzles":{},"current":"acetic-acid","boards":{"acetonitrile":{"bonds":[[0,1,1]],"revealed":false,"undo":[[]]}}}
```

Example (Progress.06), a solved Puzzle opens again solved, until it is reset:

```
Given a new browser
When the Player solves Puzzle 1, Acetonitrile, opens Puzzle 2, reloads the page and opens Puzzle 1
Then it is solved, as it was built, and Undo is disabled
  CH₃
  │
  C
  ⦀
  N
When the Player resets it, opens Puzzle 2 and opens Puzzle 1
Then it has no Bonds, and it is still marked solved
And the browser stores {"puzzles":{"acetonitrile":"solved"},"current":"acetonitrile"}
```
