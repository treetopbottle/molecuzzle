# Architecture

How the files in `src/` fit together, one diagram per component ([0011](decisions.md#0011)). The overview of the components is in the [README](../README.md#how-src-fits-together).

In the diagrams, solid arrows are imports, dotted arrows are calls at runtime (the page loading files, callbacks, the browser's storage), and boxes with a dashed border belong to another component.

## Glue

`browser.js` is the entry point and the only file using the browser's globals: it makes the dependencies and passes them to `startApp` in `app.js`, which wires the components and has no DOM.

```mermaid
flowchart TD
  browser["browser.js<br/>(entry point)"]
  app["app.js<br/>wires the components, no DOM"]

  html["ui/index.html"]
  uijs["ui/ui.js<br/>createUi"]
  puzzles["puzzle/puzzles.js<br/>PUZZLES"]
  game["puzzle/game.js<br/>createGame"]
  progress["storage/progress.js<br/>createProgressStore, markSolved"]
  local[("localStorage")]

  html -.-> browser
  browser --> app
  browser --> puzzles
  browser --> game
  browser --> progress
  browser --> uijs
  browser -. "passes to the store" .-> local

  app --> progress
  app -. "createGame, passed in" .-> game
  app -. "store: load, update" .-> progress
  app -. "open, render, say" .-> uijs
  uijs -. "onChange, onOpen, onUndo,<br/>onReset, onSolve" .-> app

  classDef other stroke-dasharray: 5 5
  class html,uijs,puzzles,game,progress other
```

## UI

`ui.js` owns the page: it draws the Board, the panel and the list of Puzzles, words every status and reason, and calls the Glue back when the Player does something.

```mermaid
flowchart TD
  html["index.html"]
  css["style.css"]
  uijs["ui.js<br/>createUi: owns the page"]
  board["board.js<br/>Board in SVG"]
  panel["panel.js<br/>open Puzzle, name, formula, rules"]
  list["puzzle-list.js<br/>puzzle buttons"]
  messages["messages.js<br/>status and reason texts"]
  looks["elements.js<br/>names, colours"]

  browser["browser.js"]
  app["app.js"]
  game["puzzle/game.js"]

  html -.-> css
  html -.-> browser

  uijs --> board
  uijs --> panel
  uijs --> list
  uijs --> messages
  board --> looks
  messages --> looks

  board -. "reads state of" .-> game
  uijs -. "reads atoms of" .-> game
  app -. "open, render, say" .-> uijs
  uijs -. "onChange, onOpen, onUndo,<br/>onReset, onSolve" .-> app

  classDef other stroke-dasharray: 5 5
  class browser,app,game other
```

## Puzzle

The Puzzles and the rules, with no DOM. `game.js` keeps the Bonds of a Board and gives its status and the reasons; the rules produce no text for the Player.

`solver.js` and `generate.js` are not part of the game itself: `scripts/generate.js` uses `findLayout` to find new layouts, and the tests use the solver to check the Puzzles in `puzzles.js`.

```mermaid
flowchart TD
  puzzles["puzzles.js<br/>PUZZLES"]
  game["game.js<br/>Bond orders, undo, status, reasons"]
  grid["grid.js<br/>candidate Bonds, crossings, connected"]
  solver["solver.js<br/>finds solutions"]
  gen["generate.js<br/>findLayout"]
  elements["elements.js<br/>ELEMENTS, valence"]

  browser["browser.js"]
  generate["scripts/generate.js"]
  tests["tests/"]

  browser --> puzzles
  browser --> game

  game --> elements
  game --> grid
  solver --> elements
  solver --> grid
  gen --> grid
  gen --> solver

  generate --> gen
  generate --> grid
  tests -. "check every Puzzle<br/>has one solution" .-> solver

  classDef other stroke-dasharray: 5 5
  class browser,generate,tests other
```

## Storage

What is kept in the browser: `progress.js` loads and updates the Progress in the storage it is given, `localStorage` in the game.

```mermaid
flowchart TD
  progress["progress.js<br/>store: load, update; markSolved"]
  local[("localStorage")]

  browser["browser.js"]
  app["app.js"]

  browser --> progress
  browser -. "passes to the store" .-> local
  app --> progress
  app -. "store: load, update" .-> progress
  progress -.-> local

  classDef other stroke-dasharray: 5 5
  class browser,app other
```
