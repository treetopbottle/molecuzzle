# Review of step 2 of plan 03: The pulse only when solving

Commits reviewed: cf8e6de (tests, step 2(a)) and 6a14f81 (implementation, step 2(b)), range 326b8d1..6a14f81. I read and ran everything in separate worktrees at 6a14f81 and at cf8e6de, and removed both afterwards.

## What was checked

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` at 6a14f81 passes: the build, 159 unit tests, 32 end-to-end tests (1 skipped, Layout.02 on desktop, which was already skipped) and the 9 screenshot tests in Podman.
- **Rule id:** Board.03 (`docs/spec/ui.md:34`) has tests:
  - `tests/unit/ui/board.test.js:93` and `:106`
  - `tests/e2e/check.spec.js:109`
  - `tests/e2e/screenshots.spec.js:53`
- **Expected results against the spec and step 2(a):**
  - Solving during play gives `solved` and `pulse`, and both stay over another render.
  - A Board created solved, on an svg that just had `pulse`, has `solved` but not `pulse`. After Reset it has neither.
  - End to end: solve Puzzle 4, then solve Water (which has `pulse`), then open Puzzle 4 right away. It shows as solved without `pulse`.
  - The reduced-motion test checks `pulse`.
- **Tests commit (cf8e6de):** 2 unit tests, 1 end-to-end test and 1 screenshot-suite test fail, all for the reason the step expects: the svg has only `solved` where `pulse` is expected (`expected [ 'solved' ] to deeply equal [ 'solved', 'pulse' ]`, `Received string: "solved"`). No other test fails. 6a14f81 changes no tests.
- **Code against the Design:**
  - Only `src/ui/board.js` and `src/ui/style.css` change, as the step names.
  - `createBoard` removes `solved` and `pulse` (`board.js:29`).
  - `wasSolved` starts from the game's status, so a Board created solved doesn't pulse (`board.js:30`).
  - `pulse` is added only on a change from not solved to solved, and stays until the status leaves solved (`board.js:89-94`).
  - Both CSS rules, the reduced-motion one included, are now on `.pulse` (`style.css:57`, `:59`). No other `.solved` rule animated the Atoms.
- **Flows traced in the code:**
  - Show solution on a solved Board: `done()` is true and the Board already matches the solution, so nothing changes and `pulse` stays as it was.
  - Show solution on an unsolved Board: the status is `revealed`, so no pulse, as before.
  - Undo: solving clears the history, so Undo can't leave or reach solved.
  - Reset: removes `pulse`. Rebuilding after it pulses again, also on a Board that opened solved, because the Reset render sets `wasSolved` to false.
  - The list, ‹ ›, Next puzzle and a reload all go through `app.js` `open()`, then `ui.open()`, then `createBoard`, so a Puzzle that opens solved doesn't pulse.
  - The Atom elements stay the same across renders, so a later render doesn't restart the animation.
- **Decisions:** the plan's Design covers the choices, and decision 0017 covers keeping the solved Board. Nothing here needs a new decision.

## Findings

1. **note**: `tests/unit/ui/board.test.js:106-120` and `tests/e2e/check.spec.js:98-107`: no test checks that Reset, then rebuilding, pulses again. That matters most on a Board that opened solved, where `wasSolved` starts true (`src/ui/board.js:30`) and only the Reset render clears it. The code handles it, and Board.03 ("when the Player solves the Puzzle") requires it. One more `build(...)` and `render()` after the Reset in the unit test, expecting `["solved", "pulse"]`, would cover it.

2. **note**: `src/ui/puzzle-list.js:21`: the open Puzzle's own button in the list still calls `onOpen`, so clicking it right after solving makes a new Board and stops the pulse part-way (`board.js:29`). Board.03 doesn't forbid this, since that counts as opening a solved Puzzle, and it was already the case before this step. I mention it only because it is a flow where the pulse goes missing.

No other findings.
