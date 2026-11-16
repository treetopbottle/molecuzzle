# 02: Components

Status: Active

Deals with the [review of the initial implementation](../01-initial-implementation/review.md): more schemas, four clear components, and features split per component, with screenshots of the UI.

## Scope

Covers every rule of the spec, now split into [puzzle.md](../../spec/puzzle.md), [storage.md](../../spec/storage.md) and [ui.md](../../spec/ui.md), with the schemas in [schemas.md](../../spec/schemas.md):

- Puzzle: Puzzle.01–03, Generate.01–02, Grid.01–02, Bond.01–06, Bond.08–11, Valence.01–02, Check.01–04, Help.01–02
- Storage: Progress.01–05
- UI: Page.01, Layout.01–02, Board.01–04, Input.01–05, Messages.01–02, Panel.01–04, List.01–02

Most of them describe what the game does now, so their tests exist and get the new ids (step 1), or are added and pass at once (step 2). New are: the reasons and statuses without text, the schemas, the generator as a module, the Progress store, the panel and the UI as components, the Glue with its dependencies passed in, every Puzzle in progress kept with its undo history (the review's "UI state"), and the screenshots.

Left out:

- Anything else new for the Player: the game plays and looks as it does now, except that Reset and solving end the undo history ([0015](../../decisions.md#0015)). Progress keeps its key and only gains an optional field, so no Player loses it.

## Design

Four components: Puzzle, Storage and UI each a folder, and the Glue, `app.js` and `browser.js`. Only the Glue imports from more than one ([0011](../../decisions.md#0011)). Schemas are JSON files the tests check against ([0012](../../decisions.md#0012)); screenshots are files the end-to-end tests compare against ([0013](../../decisions.md#0013)).

```
src/
  puzzle/   elements.js grid.js game.js solver.js puzzles.js generate.js
  storage/  progress.js
  ui/       index.html style.css elements.js messages.js board.js panel.js puzzle-list.js ui.js
  app.js      the Glue: wires the components
  browser.js  the Glue: the only file using the browser's globals; makes the dependencies, starts the app
tests/
  unit/puzzle/  unit/storage/  unit/ui/   Vitest, the UI in happy-dom
  unit/app.test.js                       the Glue, with fakes
  e2e/                                   Playwright, was tests/ui/
  helpers/                               draw.js, and schemas.js (Ajv)
docs/spec/schemas/*.schema.json, docs/spec/screenshots/*.png
```

Interfaces that change:

- `puzzle/elements.js`: `ELEMENTS` has only `valence` per symbol; the name, colours and size move to `ui/elements.js`.
- `puzzle/game.js`: `createGame(puzzle, { bonds, revealed, undo } = {})` starts where the Puzzle was left, or with no Bonds and nothing to undo if a Board can't be on the Grid; `saved()` returns `{ bonds, revealed, undo }` while the Puzzle is in progress, and `null` otherwise. `reset()` and solving clear the history. `change(k, dir)` returns `{ changed: true }`, `{ changed: false }`, `{ changed: false, reason: "full", atom }` or `{ changed: false, reason: "crossing" }`, with no message. New: `board()` returns the Bonds as a Board. `statusText` moves to `ui/messages.js`.
- `puzzle/generate.js`, new: `findLayout(bonds, { tries, maxRows, maxCols, seed })` returns `{ rows, cols, atoms, solution }` as in a Puzzle: `atoms` as `[el, r, c]` in reading order, `solution` a Board. It returns `null` if no try has exactly one solution, and throws `can't read <bond>`, text for the developer, not the Player. The search and the reordering move here from `scripts/generate.js`, which keeps reading the arguments and printing the result.
- `storage/progress.js`: `createProgressStore(storage)` returns `{ load(), update(change) }`, in place of `loadProgress` and `saveProgress`; `markSolved` and `STORAGE_KEY` stay. `update(change)` saves `change(progress)` and returns it; the store keeps it, so without storage the Progress of this visit still holds. `load()` checks what it reads by hand, as `loadProgress` does now, `boards` included.
- `ui/messages.js`, new: `statusText(status, puzzle)` and `reasonText(result, atoms)`.
- `ui/panel.js`, new: `renderPanel(panel, view)` fills the panel, the rules included, which leave `index.html`; `formulaNodes` moves here from `puzzle-list.js`.
- `ui/ui.js`, new: `createUi(doc, handlers, { confirm = doc.defaultView.confirm })` returns `{ open(game), render(view), say(result) }`. It owns the page: the Board, the panel, the list, the status line, the message, the buttons and Ctrl+Z; `say` words a `change` result with `reasonText`. `handlers` is `{ onChange(k, dir), onOpen(index), onUndo(), onReset(), onSolve() }`; `onSolve`, and from step 11 `onReset`, come only after the Player confirms. `view` is `{ puzzles, index, progress, status, done, canUndo, hasBonds }`.
- `app.js`: `startApp({ puzzles, createGame, store, createUi })`, with no DOM. From step 10, after every change, Undo, Reset and Show solution, it updates Progress with the open Puzzle's `saved()` in `boards`, or without its entry when that is `null`; on opening a Puzzle it passes its entry to `createGame`. `browser.js` reads `localStorage` in a `try`, as now, and passes `PUZZLES`, `createGame`, `createProgressStore(storage)` and `h => createUi(document, h)`.
- `scripts/build.js` reads `src/ui/index.html` and `src/ui/style.css`; the entry becomes `src/browser.js`. `index.html` keeps `<link href="style.css">` and `<script src="browser.js">` as the strings the build replaces, with a comment saying so.
- `npm run test:ui` becomes `npm run test:e2e`; `ajv` is a new development dependency, used through `ajv/dist/2020`.
- `npm run test:screenshots`, new: `scripts/screenshots.sh` runs `playwright test --project screenshots` in `mcr.microsoft.com/playwright:v<version>-noble`, with the version read from `package.json`, as `--platform linux/amd64`, with the repo mounted, in Podman, or Docker if `CONTAINER=docker`. Arguments pass on, such as `--update-snapshots`. The Playwright config has a `screenshots` project, which only this script runs, with `snapshotPathTemplate` at `docs/spec/screenshots/` and `expect: { toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 0 } }`, Playwright's defaults written out. `npm run check` runs it after `test:e2e`.

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

A test takes the new ids of what it checks: a test of the rules (`tests/unit/puzzle/`) keeps the Puzzle id; a test of a component or of the page takes the UI or Storage id. A test takes the ids of the rules it is about, not of every value it reads on the way, and lists them in the order of the spec: Puzzle ids, then UI ids in the order of ui.md, then Storage ids. The table gives the ids, not their order. So `tests/unit/board.test.js` "Grid.01, Valence.01 names each Atom…" becomes Board.01, Board.04.

## Steps

1. **Move into components.** `[DONE]` ([review](review-step-1.md), [2](review-step-1-2.md), [3](review-step-1-3.md)) Move the files as in Design with `git mv`, renaming `src/main.js` to `src/browser.js`, and fix the imports, `scripts/build.js`, `scripts/generate.js`, the Vitest and Playwright configs and `package.json`. Move the tests the same way, and rename them by the table above. Update the README ("Where things are", the diagram, `test:e2e` under Development) and the paths named in decisions 0007 and 0008, and check that every path the spec and decisions name exists. No behavior or interface changes; the checks pass. The tests of Bond.08–10 keep the old behavior, Undo after Reset and after solving, until step 9.
2. **Tests for the rules without one.** `[DONE]` ([review](review-step-2.md), [2](review-step-2-2.md)) Puzzle.02, Valence.02, Board.04, Messages.01.
   - (a) Tests: a new game has no Bonds; an Atom with all its Bonds is complete, in `tests/unit/puzzle/`; the Board.04 example, Formaldehyde with C═O (the names are tested in parts by the tests of step 1, not as the example); the status line in green for solved and revealed (orange for pieces is tested by `tests/e2e/check.spec.js`).
   - (b) Nothing to implement: these rules describe the game as it is, so the tests pass at once.
3. **Rules without text.** `[DONE]` ([review](review-step-3.md), [2](review-step-3-2.md)) Bond.04, Bond.05, Check.01–04, Help.01, Messages.01, Messages.02.
   - (a) Tests: `change` gives `full` with the Atom, or `crossing`, with no message; `statusText` and `reasonText` in `tests/unit/ui/messages.test.js` give the texts of ui.md, with the Element's name from `ui/elements.js`. The statuses are kinds already: those tests only move and pass at once.
   - (b) Implementation: reasons in `game.js`; `ui/messages.js`, with `statusText` out of `game.js` and its test's import; `app.js` shows `reasonText(result, game.atoms)` in place of `result.message`; split `elements.js` into the Puzzle's valences and the UI's look.
4. **Schemas.** `[DONE]` ([review](review-step-4.md), [2](review-step-4-2.md)) Puzzle.01, Bond.11, Progress.03.
   - (a) Tests: add `ajv` and `tests/helpers/schemas.js`, which loads all of `docs/spec/schemas/` into one `Ajv2020`, so `$ref`s resolve. `board()` is a valid Board, and after Show solution equals the Puzzle's `solution`. Every Puzzle is a valid Puzzle, `saveProgress` stores a valid Progress, and the second Progress.03 example of storage.md holds: these three already hold, so they pass at once.
   - (b) Implementation: `board()` in `game.js`.
5. **The generator in the Puzzle component.** `[DONE]` ([review](review-step-5.md), [2](review-step-5-2.md)) Generate.01, Generate.02.
   - (a) Tests in `tests/unit/puzzle/generate.test.js`: the examples of puzzle.md through `findLayout`; the same seed gives the same layout; `null` when none is found (water on a 1 by 1 Grid). Tests of the script, in their own file `tests/unit/puzzle/generate-script.test.js` so the missing module doesn't stop them, run it for the examples and its "no unique layout found", which already holds and passes at once.
   - (b) Implementation: `puzzle/generate.js`; `scripts/generate.js` keeps only the arguments and the printing.
6. **The Progress store.** `[DONE]` ([review](review-step-6.md), [2](review-step-6-2.md)) Progress.01–04.
   - (a) Tests: `createProgressStore` loads, and `update` saves, as the old functions did; an end-to-end test that, over opening the game, solving a Puzzle and a reload, the only request is for the page (Progress.04 is already true, so that test passes at once).
   - (b) Implementation: `createProgressStore` in `storage/progress.js`, used by `app.js`.
7. **The panel as a component.** `[DONE]` ([review](review-step-7.md), [2](review-step-7-2.md)) Panel.01–04.
   - (a) Tests in happy-dom: `renderPanel` on an empty panel, for Panel.01–04.
   - (b) Implementation: `ui/panel.js`, with the rules out of `index.html`; `app.js` calls it in place of its own DOM code for the panel.
8. **The UI as one component, and the Glue.** `[DONE]` ([review](review-step-8.md), [2](review-step-8-2.md)) Progress.01, List.01–02, Input.03, Input.04.
   - (a) Tests in happy-dom: `createUi`, for the buttons and Ctrl+Z calling their handlers, Undo and Reset disabled as in Input.03 (Reset with no Bonds but something to undo comes in step 10), Show solution asking first (Input.04), `say` showing no message for a result with no reason (Messages.02), and the list and score (List.01–02). In `tests/unit/app.test.js`, `startApp` with a fake store and UI: it opens the stored Puzzle, saves the open Puzzle, and marks a solved one (Progress.01).
   - (b) Implementation: `ui/ui.js`; `app.js` takes its dependencies and has no DOM; `browser.js` makes them. The README's diagram follows.
9. **A Puzzle goes on where it was left.** `[DONE]` ([review](review-step-9.md), [2](review-step-9-2.md), [3](review-step-9-3.md)) Puzzle.03, Bond.08–10, Help.01.
   - (a) Tests in `tests/unit/puzzle/`: `createGame` with `bonds`, `revealed` and `undo` starts where it was left, and Undo goes back through the history; with a Board, or one in the history, that can't be on the Grid (the Puzzle.03 examples, a pair twice, crossing Bonds, too many Bonds on an Atom), with no Bonds, nothing to undo and `revealed` false. Reset and solving leave nothing to undo; Reset also works with no Bonds but something to undo. `saved()` is `null` on a new game, after Reset and after solving, and keeps `revealed` after Show solution and Undo (Help.01). While the solution is shown, changes don't change Bonds, and Undo and Reset work (Bond.10). Undo goes back 100 changes, as in the Bond.08 example, with 100 written in the test: the old test counts with `UNDO_LIMIT`, so it passes with any limit. The old tests of Undo after Reset (in `tests/unit/puzzle/game.test.js` and `tests/e2e/bonding.spec.js`) and after solving, and of the limit, change to match. Undo while the solution is shown already works, so that test passes at once.
   - (b) Implementation: `createGame`'s options, the checks against the Grid, `saved()`, the history cleared on Reset and solving, and `UNDO_LIMIT` 100, in `game.js`.
10. **Keep every Puzzle in progress.** Progress.03, Progress.05, Input.03.
   - (a) Tests: `load()` keeps valid `boards` entries and leaves out one that doesn't fit the schema (`undo` with 101 Boards, `revealed: "yes"`). In `tests/unit/app.test.js`, with a fake store: a change, Undo, Reset and Show solution update the open Puzzle's entry in `boards`, solving or Reset removes it, and opening a Puzzle passes its entry to `createGame`. `createUi`: Reset is enabled with no Bonds but something to undo (Input.03). End-to-end: the Progress.05 example, a shown solution that is still unsolved after a reload, and that what is stored is a valid Progress. Two of these already hold, so they pass at once: the stored value of the Progress.01 example has no `boards`, and a solved Puzzle opens again with no Bonds.
   - (b) Implementation: `boards` in `load`, in `storage/progress.js`; saving and restoring in `app.js`; Reset's enabled state in `ui/ui.js`.
11. **Reset asks first.** Input.05.
   - (a) Tests: `createUi`'s Reset calls `onReset` only after the Player confirms, and cancelling changes nothing; the Input.05 example end-to-end.
   - (b) Implementation: the confirm for Reset in `ui/ui.js`; the end-to-end tests that click Reset accept its dialog.
12. **Screenshots.** Page.01, Layout.01, Board.01–03, Input.03, Panel.02–04, List.01.
   - (a) Tests in `tests/e2e/screenshots.spec.js`, one per screenshot in ui.md, in the `screenshots` project, at 1280×800 and, for the phone one, 390×844; and `scripts/screenshots.sh` with its npm script, to run them. They fail because the screenshots don't exist yet. Board.03: with reduced motion, the solved Atoms don't animate; this already holds, so it passes at once.
   - (b) Implementation: make the screenshots with `npm run test:screenshots -- --update-snapshots`, look at each one against ui.md, and commit them; then `npm run test:screenshots` passes. Add the screenshots to `npm run check`, and Podman or Docker and the new commands to the README's Development.
13. **Close the review.** Add an Outcome to [review.md](../01-initial-implementation/review.md): one line per comment, with the commits that dealt with it.
