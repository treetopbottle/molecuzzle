# Second review of step 8 of plan 02: the fixes for the review of step 8

Commits reviewed: 1ccfd8e (tests), 17ab93f (`ui.js` timers, `app.js` return), e96e80b (README, decision 0007) and 782075b (Outcome). Range `f7cf6b0..782075b`. The docs commits that close step 7 (7d0ac8e, 6e43ce4) and the review commit 3733b5c are not part of this review.

What was checked:

- `npm install` and then `CHROMIUM_PATH=/usr/bin/chromium npm run check` at 782075b, in a separate worktree, since removed. 124 unit tests passed. 26 end-to-end tests passed and 1 was skipped (Layout.02 on desktop, as before).
- Each Outcome line matches its commit:
  - 1: e96e80b changes the edge to `game.js` to say `createGame, passed in`, and adds `app -. "store: load, update" .-> progress` (`README.md:99-100`). `createProgressStore` in `src/storage/progress.js` returns exactly `{ load, update }`, so the edge is right.
  - 2: 1ccfd8e shows the solution, renders the done view, clicks "Next puzzle →" and expects `[[0], [2], [2]]`. The test name now starts with "Panel.01, Panel.03".
  - 3: the kept reason no longer cites "Illegal invocation", as the finding asked. It is sound: the wrapper works however it is called, and it is what `app.js` had before.
  - 4: 1ccfd8e adds `expect(store.saved.puzzles).toEqual({})` right after `onSolve` (`tests/unit/app.test.js:61`).
  - 5: the kept reason is sound. The finding was a note, and the end-to-end Messages.02 tests check that the message shows.
  - 6: 17ab93f calls `doc.defaultView.clearTimeout` and `doc.defaultView.setTimeout` (`src/ui/ui.js:64-65`). A grep of `src/` now finds browser globals (`window.`, `document.`, `localStorage`, timers) only in `src/browser.js`. That makes the README's "only file using the browser's globals" and the comment at the top of `browser.js` true.
  - 7: 17ab93f removes the `return` line. Nothing used the return value: `src/browser.js:11` ignores it, and `tests/unit/app.test.js` reads the game through the fake UI's `opened`. The plan gives only the signature (`docs/plans/02-components/README.md:49`).
  - 8: 0007's body now reads "Puzzle, Storage, the UI (in happy-dom) and the Glue (`src/app.js`, with fakes)". These are 0011's four components, by 0011's names. Naming only `src/app.js` for the Glue is right, because `browser.js` has no unit test.
  - 9: the README's `tests/` entry names `app.test.js`, "the Glue with fakes".
- The changed tests can fail if the behaviour breaks:
  - The Glue assertion fails if `onSolve` (or `update` on a `revealed` status) marked the Puzzle solved, because `store.saved.puzzles` would then hold `ammonia`.
  - The UI test fails if `ui.js`'s `data-open` click handling missed `#nextPuzzle`: the calls would be `[[0], [2]]`. It also fails if the button were missing: `button()` would return undefined, so the click throws.
  - At 1ccfd8e, before the refactor, both changed test files pass (11 tests). That is expected: these tests pin behaviour that already existed.

## Findings

1. **note**, `tests/unit/ui/ui.test.js:86-87`: the test passes without its `game.showSolution()` and `ui.render(view(1, game))` lines. `#nextPuzzle` is in the panel from the first render, with `data-open` set and only `hidden` toggled. `.click()` fires on a hidden button too, and the click handler in `ui.js` checks only `disabled` (`src/ui/ui.js:24`). So the test checks that `ui.js` routes the click to `onOpen`, which is the part `ui.js` owns. It doesn't check that the button is shown once the Puzzle is done; `tests/unit/ui/panel.test.js:54-63` checks that, and so do the end-to-end tests. Nothing to change. The two lines keep the scenario realistic but aren't what makes the test fail.
2. **note**, `docs/decisions.md:105`: 0007's title, "Vitest for rules and components, Playwright for the UI", no longer matches its fixed body. The body now has Vitest test the UI (in happy-dom), and Playwright test the built page. A title such as "Vitest for the components, Playwright for the built page" would match the body and 0011.
3. **note**, `README.md:110`: the diagram shows only `board -. "reads state of" .-> game`, but `ui.js` also reads the game: `say` passes `game.atoms` to `reasonText` (`src/ui/ui.js:59`). This has been the case since step 8 moved `say` into `ui.js`, and the first review didn't raise it. A `uijs -. "reads atoms of" .-> game` edge, or adding `uijs` to the existing label, would complete the diagram. It is minor, because `app` already passes the game to `uijs` through `open`.

## Outcome

1. Kept: the test checks what `ui.js` owns, as the finding says.
2. Fixed: 0007 is "Vitest for the components, Playwright for the built page" (7dca712).
3. Fixed: the diagram shows `ui.js` reading the game's Atoms (7dca712).
