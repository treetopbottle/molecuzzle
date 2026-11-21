# Architecture

This file describes how the files in `src/` fit together. It is split by component ([decision 0011](decisions.md#0011)) with the addition of Glue that ties it all together.

Each diagram shows the files of one component; an arrow is an import. Arrows are annotated with what happens at runtime (callbacks, the page loading files, the browser's storage).

## Glue

`browser.js` is the only file using the browser's globals: it makes the dependencies and starts `app.js`, which wires the components together.

## UI

`index.html` is the page and loads `style.css` and the Glue's `browser.js`; nothing imports them.

`ui.js` owns all the interface components on the webpage and when the Player does something it calls the handlers provided by `app.js`.

```mermaid
flowchart TD
  uijs["<code>ui.js</code><br/>owns the page"]
  board["<code>board.js</code><br/>the Board in SVG"]
  panel["<code>panel.js</code><br/>the open Puzzle and the rules"]
  list["<code>puzzle-list.js</code><br/>the list of Puzzles"]
  messages["<code>messages.js</code><br/>the texts for the Player"]
  looks["<code>elements.js</code><br/>how Elements look"]

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
  puzzles["<code>puzzles.js</code><br/>the Puzzles"]
  game["<code>game.js</code><br/>a Puzzle being played"]
  solver["<code>solver.js</code><br/>finds the solutions"]
  gen["<code>generate.js</code><br/>finds layouts for new Puzzles"]
  grid["<code>grid.js</code><br/>where Bonds can go"]
  elements["<code>elements.js</code><br/>the Elements and their valence"]

  game --> elements
  game --> grid
  solver --> elements
  solver --> grid
  gen --> grid
  gen --> solver
```

## Storage

One file, so no diagram: `progress.js` loads and updates the Progress in the storage it is given. `localStorage` is used at the moment.
