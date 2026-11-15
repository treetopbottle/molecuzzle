# 02: Components

Status: Draft

Deals with the [review of the initial implementation](../01-initial-implementation/review.md): more schemas, four clear components, and features split per component, with screenshots of the UI.

## Scope

Covers every rule of the spec, now split into [puzzle.md](../../spec/puzzle.md), [data.md](../../spec/data.md) and [ui.md](../../spec/ui.md), with the schemas in [schemas.md](../../spec/schemas.md):

- Puzzle: Puzzle.01–03, Generate.01–02, Grid.01–02, Bond.01–06, Bond.08–11, Valence.01–02, Check.01–04, Help.01–02
- Data: Progress.01–05
- UI: Page.01, Layout.01–02, Board.01–04, Input.01–04, Messages.01–02, Panel.01–04, List.01–02

Most of them describe what the game does now, so their tests exist and get the new ids (step 1), or are added and pass at once (step 2). New are: the reasons and statuses without text, the schemas, the generator as a module, the Progress store, the panel and the UI as components, the Glue with its dependencies passed in, the open Puzzle's Board kept over a reload (the review's "UI state"), and the screenshots.

Left out:

- Anything else new for the Player: the game plays and looks as it does now. Progress keeps its key and only gains two optional fields, so no Player loses it.
- The Boards of other Puzzles, and the undo history, over a reload ([0014](../../decisions.md#0014)).
- The same fonts for screenshots on every machine ([0013](../../decisions.md#0013) has the cost).

## Design

Four components: Puzzle, Data and UI each a folder, and the Glue, `app.js` and `main.js`. Only the Glue imports from more than one ([0011](../../decisions.md#0011)). Schemas are JSON files the tests check against ([0012](../../decisions.md#0012)); screenshots are files the end-to-end tests compare against ([0013](../../decisions.md#0013)).

```
src/
  puzzle/   elements.js grid.js game.js solver.js puzzles.js generate.js
  data/     progress.js
  ui/       index.html style.css elements.js messages.js board.js panel.js puzzle-list.js ui.js
  app.js    the Glue: wires the components
  main.js   the Glue: makes the dependencies, starts the app
tests/
  unit/puzzle/  unit/data/  unit/ui/   Vitest, the UI in happy-dom
  unit/app.test.js                     the Glue, with fakes
  e2e/                                 Playwright, was tests/ui/
  helpers/                             draw.js, and schemas.js (Ajv)
docs/spec/schemas/*.schema.json, docs/spec/screenshots/*.png
```

Interfaces that change:

- `puzzle/elements.js`: `ELEMENTS` has only `valence` per symbol; the name, colours and size move to `ui/elements.js`.
- `puzzle/game.js`: `createGame(puzzle, { board, revealed } = {})` starts from a Board, or with no Bonds if it can't be on the Grid. `change(k, dir)` returns `{ changed: true }`, `{ changed: false }`, `{ changed: false, reason: "full", atom }` or `{ changed: false, reason: "crossing" }`, with no message. New: `board()` returns the Bonds as a Board, and `revealed` whether they show the solution. `statusText` moves to `ui/messages.js`.
- `puzzle/generate.js`, new: `findLayout(bonds, { tries, maxRows, maxCols, seed })` returns `{ rows, cols, atoms, solution }` as in a Puzzle: `atoms` as `[el, r, c]` in reading order, `solution` a Board. It returns `null` if no try has exactly one solution, and throws `can't read <bond>`, text for the developer, not the Player. The search and the reordering move here from `scripts/generate.js`, which keeps reading the arguments and printing the result.
- `data/progress.js`: `createProgressStore(storage)` returns `{ load(), save(progress) }`, in place of `loadProgress` and `saveProgress`; `markSolved` and `STORAGE_KEY` stay.
- `ui/messages.js`, new: `statusText(status, puzzle)` and `reasonText(result, atoms)`.
- `ui/panel.js`, new: `renderPanel(panel, view)` fills the panel, the rules included, which leave `index.html`; `formulaNodes` moves here from `puzzle-list.js`.
- `ui/ui.js`, new: `createUi(doc, handlers, { confirm })` returns `{ open(game), render(view), say(result) }`. It owns the page: the Board, the panel, the list, the status line, the message, the buttons and Ctrl+Z; `say` words a `change` result with `reasonText`. `handlers` is `{ onChange(k, dir), onOpen(index), onUndo(), onReset(), onSolve() }`; `onSolve` comes only after the Player confirms. `view` is `{ puzzles, index, progress, status, done, canUndo, hasBonds }`.
- `app.js`: `startApp({ puzzles, createGame, store, createUi })`, with no DOM. After every change, and on opening a Puzzle, it saves Progress with the open Puzzle's `board` and `revealed`; on start, it passes them to `createGame`. `main.js` reads `localStorage` in a `try`, as now, and passes `PUZZLES`, `createGame`, `createProgressStore(storage)` and `h => createUi(document, h)`.
- `scripts/build.js` reads `src/ui/index.html` and `src/ui/style.css`; the entry stays `src/main.js`. `index.html` keeps `<link href="style.css">` and `<script src="main.js">` as the strings the build replaces, with a comment saying so.
- `npm run test:ui` becomes `npm run test:e2e`; `ajv` is a new development dependency, used through `ajv/dist/2020`.

Where the old rule ids went, for renaming tests:

| Old | New |
|---|---|
| Puzzle.01 | Puzzle.01 |
| Puzzle.02 | Puzzle.02, Panel.02, Board.04 |
| Puzzle.03 | Panel.01, List.01 |
| Puzzle.04 | List.01, List.02 |
| Puzzle.05 | Panel.01 |
| Help.01 | Help.01, Input.04, Messages.01, Panel.01, List.02 |
| Help.02 | Help.02, Messages.01, Panel.01 |
| Grid.01–02 | Grid.01–02 |
| Bond.01–03 | Bond.01–03, Input.01 |
| Bond.04–05 | Bond.04–05, Messages.02 |
| Bond.06 | Bond.06, Input.01 |
| Bond.07 | Input.02, Board.04 |
| Bond.08 | Bond.08, Input.02, Input.03 |
| Bond.09 | Bond.09, Input.03 |
| Bond.10 | Bond.10 |
| Valence.01–02 | Valence.01–02, Board.02 |
| Check.01–03 | Check.01–03, Messages.01 |
| Check.04 | Check.04, Messages.01, Panel.03, Board.03, Progress.01, List.02 |
| Progress.01 | Progress.01, Progress.03 |
| Progress.02 | Progress.02 |
| Layout.01–02 | Layout.01–02 |

A test takes the new ids of what it checks: a test of the rules (`tests/unit/puzzle/`) keeps the Puzzle id; a test of a component or of the page takes the UI or Data id. So `tests/unit/board.test.js` "Grid.01, Valence.01 names each Atom…" becomes Board.04, Board.02.

## Steps

1. **Move into components.** Move the files as in Design, with `git mv`, and fix the imports, `scripts/build.js`, `scripts/generate.js`, the Vitest and Playwright configs and `package.json`. Move the tests the same way, and rename them by the table above. Update the README ("Where things are", the diagram, `test:e2e` under Development) and the paths named in decisions 0007 and 0008, and check that every path the spec and decisions name exists. No behavior or interface changes; the checks pass.
2. **Tests for the rules without one.** Puzzle.02, Valence.02, Bond.10, Board.04, Messages.01.
   - (a) Tests: a new game has no Bonds; an Atom with all its Bonds is complete, in `tests/unit/puzzle/`; Bond.10 also while the solution is shown, and with Reset; the names of the Board and its Atoms; the status line in green for revealed, in orange for pieces.
   - (b) Nothing to implement: these rules describe the game as it is, so the tests pass at once.
3. **Rules without text.** Bond.04, Bond.05, Check.01–04, Help.01, Messages.01, Messages.02.
   - (a) Tests: `change` gives `full` with the Atom, or `crossing`, with no message; `statusText` and `reasonText` in `tests/unit/ui/messages.test.js` give the texts of ui.md, with the Element's name from `ui/elements.js`. The statuses are kinds already: those tests only move and pass at once.
   - (b) Implementation: reasons in `game.js`; `ui/messages.js`, with `statusText` out of `game.js` and its test's import; `app.js` shows `reasonText(result)` in place of `result.message`; split `elements.js` into the Puzzle's valences and the UI's look.
4. **Schemas.** Puzzle.01, Bond.11, Progress.03.
   - (a) Tests: add `ajv` and `tests/helpers/schemas.js`, which loads all of `docs/spec/schemas/` into one `Ajv2020`, so `$ref`s resolve. `board()` is a valid Board, and after Show solution equals the Puzzle's `solution`; what `saveProgress` stores is a valid Progress. Every Puzzle is a valid Puzzle, and the second Progress.03 example of data.md: both already hold, so these pass at once.
   - (b) Implementation: `board()` in `game.js`.
5. **The generator in the Puzzle component.** Generate.01, Generate.02.
   - (a) Tests in `tests/unit/puzzle/generate.test.js`: the examples of puzzle.md through `findLayout`; the same seed gives the same layout; `null` when none is found (water on a 1 by 1 Grid). One test runs the script for its "no unique layout found", which already holds and passes at once.
   - (b) Implementation: `puzzle/generate.js`; `scripts/generate.js` keeps only the arguments and the printing.
6. **The Progress store.** Progress.01–04.
   - (a) Tests: `createProgressStore` loads and saves, as the old functions did; an end-to-end test that, over opening the game, solving a Puzzle and a reload, the only request is for the page (Progress.04 is already true, so that test passes at once).
   - (b) Implementation: `createProgressStore` in `data/progress.js`, used by `app.js`.
7. **The panel as a component.** Panel.01–04.
   - (a) Tests in happy-dom: `renderPanel` on an empty panel, for Panel.01–04.
   - (b) Implementation: `ui/panel.js`, with the rules out of `index.html`; `app.js` calls it in place of its own DOM code for the panel.
8. **The UI as one component, and the Glue.** Progress.01, List.01–02, Input.03, Input.04.
   - (a) Tests in happy-dom: `createUi`, for the buttons and Ctrl+Z calling their handlers, Undo and Reset disabled as in Input.03, Show solution asking first (Input.04), and the list and score (List.01–02). In `tests/unit/app.test.js`, `startApp` with a fake store and UI: it opens the stored Puzzle, saves the open Puzzle, and marks a solved one (Progress.01).
   - (b) Implementation: `ui/ui.js`; `app.js` takes its dependencies and has no DOM; `main.js` makes them. The README's diagram follows.
9. **Keep the open Puzzle's Board.** Puzzle.03, Progress.05.
   - (a) Tests: `createGame` with a Board, and with `revealed`, starts from it with nothing to undo; with a Board that can't be on the Grid (the Puzzle.03 examples, crossing Bonds, too many Bonds on an Atom), with no Bonds. In `tests/unit/app.test.js`: the fake store gets `board` and `revealed` after a change, Show solution and opening a Puzzle, and a stored Board is passed to `createGame` on start. End-to-end: both Progress.05 examples, and the stored value of the Progress.01 example.
   - (b) Implementation: `createGame`'s options and `revealed`, with the checks against the Grid; saving and restoring in `app.js`.
10. **Screenshots.** Page.01, Layout.01, Board.01–03, Input.03, Panel.02–04, List.01.
   - (a) Tests in `tests/e2e/screenshots.spec.js`, one per screenshot in ui.md, with `snapshotPathTemplate` pointing at `docs/spec/screenshots/`; the phone one in the phone project. They fail because the screenshots don't exist yet. Board.03: with reduced motion, the solved Atoms don't animate; this already holds, so it passes at once.
   - (b) Implementation: make the screenshots with `npm run test:e2e -- --update-snapshots`, look at each one against ui.md, and commit them.
11. **Close the review.** Add an Outcome to [review.md](../01-initial-implementation/review.md): one line per comment, with the commits that dealt with it.
