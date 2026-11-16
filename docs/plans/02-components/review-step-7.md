# Review of step 7 of plan 02: The panel as a component

Commits reviewed: 8040b88 (tests, step 7(a)) and 732e8be (implementation, step 7(b), with the README). Range 4044335..732e8be.

What was checked:

- **The checks pass at 732e8be.** `npm install` and `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a clean `git worktree` at 732e8be. Vitest: 11 files, 112 tests passed. Playwright: 26 passed, 1 skipped (Layout.02 on desktop, which was skipped before this step too). A worktree was used because uncommitted step-8 work appeared in the main tree during the review.
- **At 8040b88 the new tests fail for the expected reason.** In a separate worktree, `npm test` fails only `tests/unit/ui/panel.test.js`, with `Failed to resolve import "../../../src/ui/panel.js"`. The other 107 tests pass, including `puzzle-list.test.js`, which no longer imports `formulaNodes`.
- Both worktrees are removed.
- Otherwise the step follows the Design:
  - `renderPanel(panel, view)` fills the open Puzzle part of the panel and the rules, and the rules leave `index.html`.
  - `formulaNodes` moves from `puzzle-list.js`, which has no other change.
  - app.js calls renderPanel in place of its own panel DOM code. `startApp`'s interface is unchanged.
  - `view` (`{ puzzles, index, progress, done }`) is a subset of the createUi `view` in the Design, so step 8 can pass its view straight through.
  - `panel.js` imports nothing, as 0011 requires.
  - The code does what Panel.01–04 say and no more.
  - The README's "Where things are" and diagram match the code.

## Findings

1. **should fix**: `tests/unit/ui/panel.test.js:30-37`. The second half of the Panel.01 test doesn't follow the Panel.01 example (`docs/spec/ui.md:132-138`).
   - The example expects "Puzzle 13 of 13" and "Unsolved", with › disabled. The test renders Puzzle 13 as solved (`solved: ["p13"]`) and expects "✓ Solved".
   - implement-a-step.md's checks say "Each expected result matches the spec's example for its rule."
   - No other test checks the example's state on Puzzle 13. `tests/e2e/puzzle.spec.js:29-38` checks that › is disabled on 13, but not the counter or the badge.
   - Fix: render Puzzle 13 unsolved as in the example, and check "✓ Solved" on its own. Puzzle 11 solved, as in the `panel-solved.png` example at `ui.md:128`, would fit.
   - Smaller gap in the same test: `:24` and `:33` check only that the nav contains "Puzzle <n> of 13", not that it sits between ‹ and › as Panel.01 says. A check on the nav's text in order, e.g. `/‹\s*Puzzle 1 of 13\s*›/`, would cover it.
2. **note**: the delegated `data-open` clicks (`src/ui/panel.js:1-4`, `:52`; `src/app.js:65-68`). The choice is sound.
   - Because the panel is built once and then updated in place, an `onOpen` parameter would be awkward. It would be bound at build time, so later calls would pass handlers that are ignored, or the panel would have to keep the latest one somewhere.
   - With `data-open`, renderPanel stays a function of `view` alone. The `disabled` state guards the out-of-range indexes: -1 on ‹ at Puzzle 1, and 13 on › and "Next puzzle →" at Puzzle 13.
   - Clicking is tested only end-to-end: `tests/e2e/puzzle.spec.js:29` for ‹ and ›, and `tests/e2e/check.spec.js:63` for "Next puzzle →". That is enough while app.js owns the listener.
   - The cost is that it differs from `renderPuzzleList(…, onPick)`. When step 8's createUi takes over with `onOpen`, the list could use `data-open` too, so the UI has one way to open a Puzzle.
   - The contract is written down in panel.js's header comment and in the README diagram. It is temporary and stays inside the UI from step 8 on, so it doesn't need a decision.
3. **note**: building once and updating in place (`src/ui/panel.js:47`). The choice is sound, and the test checks it as element identity (`panel.test.js:32`), which is enough.
   - The gain is limited to ‹ and ›. After a click on "Next puzzle →", that button is hidden on the new Puzzle and loses focus, as it did before this step.
   - The Puzzles list still rebuilds its buttons on every render (`src/ui/puzzle-list.js:12`), so focus there is still lost. That isn't this step's scope, but step 8 could treat it the same way.
4. **note**: `<div id="info" class="info">` with `.info { display: contents; }` (`src/ui/index.html:21`, `src/ui/style.css:22`). No change to layout or reading order was found, by inspection.
   - The div's children (nav, title block, fact, "Next puzzle →", rules) are the same elements in the same order as before. With `display: contents` they stay flex items of `.panel`, so its 12px `gap` applies as before.
   - No selector in `style.css` relies on them being children of `.panel`.
   - The div is generic, so it adds no node to the accessibility tree. The rules' texts are the same as the old `index.html`.
   - The aria snapshots (`tests/e2e/puzzle.spec.js:7`, `tests/e2e/check.spec.js:30`) pass unchanged. But they stop at "Next puzzle →" (Playwright's partial match), so they don't show that the rules and the actions still follow in the same place. Step 12's screenshots will lock that down.
   - Naming: renderPanel's `panel` parameter receives `#info`, while `.panel` is the `<aside>`, which by Page.01 also holds the actions and the list. That matches the spec's Panel section (Panel.01–04), but a reader may trip on it.
5. **note**: `src/ui/panel.js:20-31` keeps the global ids (`prev`, `next`, `counter`, `badge`, `title`, `formula`, `fact`, `nextPuzzle`) inside the component. The end-to-end tests use `#counter` and `#badge`, so keeping them avoids changing those tests. That is fine with one panel per page.
6. **note**: the subscripts are checked twice: through renderPanel (`panel.test.js:54`) and through the moved `formulaNodes` test (`:62-66`). That's harmless. `formulaNodes` is now used only inside `panel.js` and by that test; the Design says it moves here, so the export is within the plan.
7. **note**: `docs/decisions.md:109` (0007) names `src/ui/board.js` and `src/ui/puzzle-list.js` as the components tested in happy-dom. `src/ui/panel.js` is now one too, and step 8 adds `ui.js`. They read as examples, so this is optional, but it could be updated when step 8 lands.

## Outcome

1. Fixed: Puzzle 13 renders unsolved, as in the example, "✓ Solved" has a test of its own with Puzzle 11, and the nav's text is checked in order, "‹ Puzzle 1 of 13 › Unsolved" (7575109).
2. Kept: step 8's createUi takes over the listener; the list keeps its onPick, called with createUi's onOpen.
3. Kept: the list's focus is outside this plan.
4. Kept: the name follows the spec's Panel section; step 12's screenshots lock down the layout.
5. Kept: one panel per page, and the end-to-end tests use the ids.
6. Kept: harmless, as the finding says.
7. Fixed in step 8: decision 0007 names the UI's components tested in happy-dom.
