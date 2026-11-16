# Review of step 8 of plan 02: The UI as one component, and the Glue

Commits reviewed: 9ad8d21 (tests, step 8(a)) and f7cf6b0 (implementation, step 8(b), with the README diagram and decision 0007). Range 18e47e5..f7cf6b0. The docs commits that close step 7 are not part of this review.

What was checked:

- `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check` at f7cf6b0: 124 unit tests passed; 26 end-to-end tests passed and 1 was skipped (Layout.02 on desktop, as before).
- At 9ad8d21, in a separate worktree (since removed), the new tests fail for the reason the step expects. `tests/unit/ui/ui.test.js` fails with "Failed to resolve import ../../../src/ui/ui.js". All 4 tests in `tests/unit/app.test.js` fail with `doc.getElementById is not a function`, because `startApp` still takes a document.
- Each rule id the step names has a test whose expected result matches ui.md and storage.md:
  - Progress.01: `tests/unit/app.test.js:26`, `:33`, `:42`
  - Input.03: `tests/unit/ui/ui.test.js:51`
  - Input.04: `tests/unit/ui/ui.test.js:62`
  - Messages.02 `say`: `tests/unit/ui/ui.test.js:72` (atom 4 is H 3,1, as in the spec's example)
  - List.01–02: `tests/unit/ui/ui.test.js:97` (the spec's example)
- The code follows the plan's Design:
  - `createUi` takes `(doc, handlers, { confirm })` and returns `{ open, render, say }`. It owns the Board, panel, list, status line, message, buttons and Ctrl+Z. `say` words a result with `reasonText`. `onSolve` is called only after the Player confirms.
  - `startApp({ puzzles, createGame, store, createUi })` uses no DOM. The view it passes is exactly `{ puzzles, index, progress, status, done, canUndo, hasBonds }`.
  - `browser.js` reads `localStorage` in a `try` and passes `PUZZLES`, `createGame`, `createProgressStore(storage)` and `h => createUi(document, h)`.
- Decision 0011 holds:
  - `src/ui/*` imports only from `ui/`.
  - `app.js` imports only `markSolved` from storage.
  - `browser.js` imports from all components.
- The game plays as before: the behaviour moved over line for line (toast, button handlers, Ctrl+Z with `preventDefault`, order of `say` and update), and the end-to-end tests pass unchanged.

## Findings

1. **should fix**, `README.md:99`: the diagram edge `app -. "createGame, store, createUi<br/>passed in" .-> game` points at `game.js`, but it names two dependencies that are not in `game.js`. `createUi` already has its own edge (`app -. "open, render, say" .-> uijs`). The store's runtime calls to `progress.js` (`load`, `update`) are not drawn at all; the solid `app --> progress` only stands for the `markSolved` import. Label this edge `createGame`, and add a dotted `app -. "store: load, update" .-> progress`, or something like it.
2. **should fix**, `tests/unit/ui/ui.test.js:82`: the test name "Panel.01 ‹, › and Next puzzle → open their Puzzle" claims more than the test does. It clicks only "Previous puzzle" and "Next puzzle", which are the aria-labels of ‹ and ›. The "Next puzzle →" button (Panel.03, `#nextPuzzle`) is never shown or clicked. This step moved the `data-open` click delegation into `ui.js`, so Next puzzle → calling `onOpen` has no unit test (only `tests/e2e/narrative.spec.js:18` covers it). Either render a done view and click "Next puzzle →", or drop it from the name.
3. **note**, `src/ui/ui.js:18`: about the confirm default. The code's `question => doc.defaultView.confirm(question)` differs from the plan's `confirm = doc.defaultView.confirm` only in form, and behaves the same. However, the reason given for it is not right for this code.
   - Under WebIDL, an operation on a `[Global]` interface such as `Window` treats an undefined or null `this` as the global object. The destructured `confirm` is called as a plain function, `confirm("Show the solution?")`, so `this` is undefined and the plan's form would also work in browsers.
   - "Illegal invocation" comes from a non-Window `this`, for example if it were called as `options.confirm(q)`.
   - Keeping the wrapper is fine: it is what `app.js` had before, it doesn't depend on how it is called, and the end-to-end Input.04 test (`tests/e2e/check.spec.js:73`) exercises it in Chromium. But don't record "Illegal invocation" as the reason in the Outcome. Changing the plan's Design line to the code's form is optional.
4. **note**, `tests/unit/ui/ui.test.js:89` and `tests/unit/app.test.js:52`: "Panel.01, List.02 a shown solution leaves the Puzzle unsolved" can't fail for the reason in its name. The test passes in a Progress with nothing solved, so `createUi` only shows what it is given. Not marking a revealed Puzzle as solved is the Glue's job, and the Glue test at `app.test.js:52` calls `onSolve` without checking that `store.saved.puzzles` stays `{}`. The end-to-end test covers it (`tests/e2e/check.spec.js:73`). An assertion in `app.test.js` would put the unit check where the behaviour lives.
5. **note**, `tests/unit/ui/ui.test.js:72`: the Messages.02 test checks only the toast's `textContent`, not that it is shown (the `show` class), nor that no `show` appears for a result with no reason. The end-to-end Messages.02 tests cover what shows. The step's ask ("say showing no message for a result with no reason") is met.
6. **note**, `src/ui/ui.js:64-65`: `ui.js` uses the global `setTimeout` and `clearTimeout`. The README's "Where things are" and the comment at the top of `browser.js` say `browser.js` is "the only file using the browser's globals". Timers are also globals in Node, and the old `app.js` used them the same way. Either use `doc.defaultView.setTimeout` and `doc.defaultView.clearTimeout`, or read the claim as being about DOM and storage globals.
7. **note**, `src/app.js:46`: `startApp` still returns `{ get game() { return game; }, open }`. That is not part of the plan's interface, and nothing uses it any more (`browser.js` ignores it; the tests read the game through the fake UI). Leftover API surface; could be dropped.
8. **note**, `docs/decisions.md:109`: decision 0007 now reads "Rules, the UI's components (`src/ui/`, in happy-dom) and the Glue (`src/app.js`, with fakes) are tested with Vitest".
   - It calls the files of `src/ui/` "the UI's components", while 0011 calls the UI itself one component.
   - It leaves out Storage, whose tests (`tests/unit/storage/`) also run in Vitest.
   - Suggested wording: "Puzzle, Storage, the UI (in happy-dom) and the Glue (`src/app.js`, with fakes) are tested with Vitest".
9. **note**, `README.md:43`: the `tests/` entry lists `unit/` as "`puzzle/`, `storage/` and `ui/`". It doesn't mention `unit/app.test.js`, the Glue tested with fakes, which the plan's Design lists.
