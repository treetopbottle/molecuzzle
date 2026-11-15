# 02: Components

Status: Draft

Deals with the [review of the initial implementation](../01-initial-implementation/review.md): more schemas, four clear components, and features split per component, with screenshots of the UI.

## Scope

Covers every rule of the spec, now split into [puzzle.md](../../spec/puzzle.md), [data.md](../../spec/data.md) and [ui.md](../../spec/ui.md), with the schemas in [schemas.md](../../spec/schemas.md):

- Puzzle: Puzzle.01–02, Generate.01–02, Grid.01–02, Bond.01–10, Valence.01–02, Check.01–04, Help.01–02
- Data: Progress.01–04
- UI: Page.01, Layout.01–02, Board.01–04, Input.01–04, Messages.01–02, Panel.01–04, List.01–02

Most of them describe what the game does now, so their tests exist and get the new ids (step 1). New are: the reasons and statuses without text, the schemas, the generator as a module, the Progress store, the panel and the UI as components, and the screenshots.

Left out:

- Anything new for the Player: the game plays and looks as it does now, and Progress keeps its format and key, so no Player loses it.
- More UI state in the browser: the review's "UI state" is the open Puzzle, which is already kept ([Progress.01](../../spec/data.md#progress)); the Bonds of the open Puzzle still aren't.
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
  e2e/                                 Playwright, was tests/ui/
  helpers/                             draw.js, and schemas.js (Ajv)
docs/spec/schemas/*.schema.json, docs/spec/screenshots/*.png
```

Interfaces that change:

- `puzzle/elements.js`: `ELEMENTS` has only `valence` per symbol; the name, colours and size move to `ui/elements.js`.
- `puzzle/game.js`: `change(k, dir)` returns `{ changed: true }`, `{ changed: false }`, `{ changed: false, reason: "full", atom }` or `{ changed: false, reason: "crossing" }`, with no message. New: `board()` returns the Bonds as a Board. `statusText` moves to `ui/messages.js`.
- `puzzle/generate.js`, new: `findLayout(bonds, { tries, maxRows, maxCols, seed })` returns `{ rows, cols, atoms, solution }`, or `null` if no try has exactly one solution; it throws `can't read <bond>`. The search moves here from `scripts/generate.js`, which keeps reading the arguments and printing.
- `data/progress.js`: `createProgressStore(storage)` returns `{ load(), save(progress) }`, in place of `loadProgress` and `saveProgress`; `markSolved` and `STORAGE_KEY` stay.
- `ui/messages.js`, new: `statusText(status, puzzle)` and `reasonText(result, atoms)`.
- `ui/panel.js`, new: `renderPanel(doc, view)`, the panel's DOM, out of `app.js`; `formulaNodes` moves here from `puzzle-list.js`.
- `ui/ui.js`, new: `createUi(doc, handlers, { confirm })` returns `{ open(game), render(view), say(text) }`. It owns the page: the Board, the panel, the list, the status line, the message, the buttons and Ctrl+Z. `handlers` is `{ onChange(k, dir), onOpen(index), onUndo(), onReset(), onSolve() }`; `onSolve` comes only after the Player confirms. `view` is `{ puzzles, index, progress, status, done, canUndo, hasBonds }`.
- `app.js`: `startApp({ puzzles, createGame, store, createUi })`, with no DOM; `main.js` passes `PUZZLES`, `createGame`, `createProgressStore(localStorage)` and `h => createUi(document, h)`.
- `scripts/build.js` reads `src/ui/index.html` and `src/ui/style.css`; the entry stays `src/main.js`.
- `npm run test:ui` becomes `npm run test:e2e`; `ajv` is a new development dependency.

Where the old rule ids went, for renaming tests:

| Old | New |
|---|---|
| Puzzle.01 | Puzzle.01 |
| Puzzle.02 | Puzzle.02, Panel.02 |
| Puzzle.03 | Panel.01, List.01 |
| Puzzle.04 | List.01, List.02 |
| Puzzle.05 | Panel.01 |
| Help.01 | Help.01, Input.04, Messages.01 |
| Help.02 | Help.02 |
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
| Check.04 | Check.04, Messages.01, Panel.03, Board.03, Progress.01 |
| Progress.01 | Progress.01, Progress.03 |
| Progress.02 | Progress.02 |
| Layout.01–02 | Layout.01–02 |

A test of the rules (`tests/unit/puzzle/`) keeps the Puzzle id; a test of a component or of the page takes the UI or Data id.

## Steps

1. **Move into components.** Move the files as in Design, with `git mv`, and fix the imports, `scripts/build.js`, `scripts/generate.js`, the Vitest and Playwright configs and `package.json`. Move the tests the same way, and rename them by the table above. Update the README: "Where things are", the diagram, and `test:e2e` under Development. No behavior or interface changes; the checks pass.
2. **Rules without text.** Bond.04, Bond.05, Check.01–04, Help.01, Messages.01, Messages.02.
   - (a) Tests: `change` gives `full` with the Atom, or `crossing`; the statuses as kinds; `statusText` and `reasonText` in `tests/unit/ui/messages.test.js` give the texts of ui.md, with the Element's name from `ui/elements.js`.
   - (b) Implementation: reasons in `game.js`; `ui/messages.js`; split `elements.js` into the Puzzle's valences and the UI's look.
3. **Schemas.** Puzzle.01, Bond.07, Progress.03.
   - (a) Tests: add `ajv` and `tests/helpers/schemas.js`, which loads `docs/spec/schemas/`. Every Puzzle is a valid Puzzle; `board()` is a valid Board, and after Show solution equals the Puzzle's `solution`; what `save` stores is a valid Progress; the second Progress.03 example of data.md.
   - (b) Implementation: `board()` in `game.js`.
4. **The generator in the Puzzle component.** Generate.01, Generate.02.
   - (a) Tests in `tests/unit/puzzle/generate.test.js`: the examples of puzzle.md through `findLayout`; the same seed gives the same layout; `null` when none is found (water on a 1 by 1 Grid). One test runs the script for its "no unique layout found".
   - (b) Implementation: `puzzle/generate.js`; `scripts/generate.js` keeps only the arguments and the printing.
5. **The Progress store.** Progress.01–04.
   - (a) Tests: `createProgressStore` loads and saves, as the old functions did; an end-to-end test that, over opening the game, solving a Puzzle and a reload, the only request is for the page (Progress.04 is already true, so that test passes at once).
   - (b) Implementation: `createProgressStore` in `data/progress.js`, used by `app.js`.
6. **The UI as components, and the Glue.** Panel.01–04, List.01–02, Input.03, Input.04.
   - (a) Tests in happy-dom: `renderPanel` for Panel.01–04; `createUi` for the buttons and Ctrl+Z calling their handlers, Undo and Reset disabled as in Input.03, Show solution asking first (Input.04), and the list and score (List.01–02).
   - (b) Implementation: `ui/panel.js`, `ui/ui.js`; `app.js` takes its dependencies and has no DOM; `main.js` makes them. The README's diagram follows.
7. **Screenshots.** Page.01, Layout.01, Board.01–03, Input.03, Panel.02–04, List.01.
   - (a) Tests in `tests/e2e/screenshots.spec.js`, one per screenshot in ui.md, with `snapshotPathTemplate` pointing at `docs/spec/screenshots/`; the phone one in the phone project. Board.03: with reduced motion, the solved Atoms don't animate. They fail because the screenshots don't exist yet.
   - (b) Implementation: make the screenshots with `npm run test:e2e -- --update-snapshots`, look at each one against ui.md, and commit them.
8. **Close the review.** Add an Outcome to [review.md](../01-initial-implementation/review.md): one line per comment, with the commits that dealt with it.
