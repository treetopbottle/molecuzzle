# Architecture

This file describes how the files in `src/` fit together. It is split by component ([decision 0011](decisions.md#0011)) with the addition of Glue that ties it all together.

Each diagram shows the files of one component; an arrow is an import. Arrows are annotated with what happens at runtime (callbacks, the page loading files, the browser's storage).

## Glue

`index.html` is the page and loads `style.css` and `browser.js`; nothing imports them.

## UI

`ui.js` owns all the interface components on the webpage and when the Player does something it calls the handlers provided by `app.js`.

```mermaid
flowchart TD
  uijs["ui.js<br/>owns the page"]
  board["board.js<br/>the Board in SVG"]
  panel["panel.js<br/>the open Puzzle and the rules"]
  list["puzzle-list.js<br/>the list of Puzzles"]
  messages["messages.js<br/>the texts for the Player"]
  looks["elements.js<br/>how Elements look"]

  uijs --> board
  uijs --> panel
  uijs --> list
  uijs --> messages
  board --> looks
  messages --> looks
```

## Puzzle

The Puzzles and the rules. `game.js` keeps the Bonds of a Board and gives its status and the reasons.

`solver.js` and `generate.js` are not part of the game itself: `scripts/generate.js` uses `generate.js` to find new layouts, and the tests use the solver to check the Puzzles in `puzzles.js`.

```mermaid
flowchart TD
  puzzles["puzzles.js<br/>the Puzzles"]
  game["game.js<br/>a Puzzle being played"]
  solver["solver.js<br/>finds the solutions"]
  gen["generate.js<br/>finds layouts for new Puzzles"]
  grid["grid.js<br/>where Bonds can go"]
  elements["elements.js<br/>the Elements and their valence"]

  game --> elements
  game --> grid
  solver --> elements
  solver --> grid
  gen --> grid
  gen --> solver
```

## Storage

One file, so no diagram: `progress.js` loads and updates the Progress in the storage it is given. `localStorage` is used at the moment.
