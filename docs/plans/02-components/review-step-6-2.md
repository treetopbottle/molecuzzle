# Second review of step 6 of plan 02: the fixes for the review of step 6

Commits reviewed: 0786db0 (tests), f75de7c (plan Design) and f5a83ff (Outcome), range 7bbaa10..f5a83ff (fe14060 is the review itself).

What was checked:

- **Checks:** `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check`, in a clean worktree at f5a83ff, since removed. Vitest: 108 of 108 passed. Playwright: 26 passed and 1 skipped (Layout.02 on desktop, as before). The 26 include the new "Progress.01, Progress.03 wrong data is left out, and Puzzle 1 opens when the open one is unknown".
- **Outcome 1 (fixed, f75de7c):** matches. docs/plans/02-components/README.md:45 now says that `update(change)` saves `change(progress)` and returns it, and that the store keeps it. This matches src/storage/progress.js:30–34 and what app.js uses (src/app.js:35, :49). It is also what step 8 needs for a fake store.
- **Outcome 2 (fixed, 0786db0):** matches. tests/unit/storage/progress.test.js:51–52 check that, with storage that throws, two updates in a row return `{ puzzles: {}, current: "water" }` and then `{ puzzles: { water: "solved" }, current: "water" }`. This could fail if the behavior broke:
  - A store that re-read storage on every `update` would return `current: null` on the second update.
  - A store that returned nothing would fail both lines.
  - This matches Progress.02: the game works, and nothing is stored.
- **Outcome 3 (fixed, 0786db0):** matches. tests/e2e/puzzle.spec.js:70–76 store the Progress.03 example `{ puzzles: { water: "solved", urea: "seen" }, current: 7 }`. They check that Puzzle 1 is open, Water is solved, and the score is "Solved 1 of 13". The test could fail:
  - If the `Math.max(0, …)` in src/app.js:20 were removed, `createGame(undefined)` would throw and `#counter` would stay empty (src/ui/index.html:23). So the Progress.01 "missing or unknown, Puzzle 1 opens" path is now tested.
  - If `load()` dropped the whole value because of one bad entry, Water would not show as solved, so "the rest still loads" is tested too.
- **Outcome 4 (kept):** the reason holds. That `markSolved` never unmarks already held before the step, so its test passing at once is expected. The review is the record of that, since commit 78b63d4's message can't change.
- **Outcome 5 (kept):** the reason holds. The build inlines everything and the page has no worker or socket, so `page.on("request")` is enough for now.
- **Scope:** the fix commits change only tests and docs, with no code changes. The commit messages follow the earlier rounds' pattern.

## Findings

1. **note**: tests/e2e/puzzle.spec.js:74–75. These two checks can't catch Urea's entry being kept, which is the "seen isn't a state, so Urea's entry is left out" line of the Progress.03 example.
   - The page shows any state other than "solved" the same way as no entry: see src/ui/puzzle-list.js:13 and src/app.js:72.
   - So "Puzzle 9" (exact) and "Solved 1 of 13" would still pass if `load()` kept `urea: "seen"`. They fail only if "seen" turned into solved.
   - The leaving-out itself is tested only by the unit test at tests/unit/storage/progress.test.js:38, and that is enough.
   - If the end-to-end test should show it too, check `storedProgress(page)` after the page opens. It should equal `{ puzzles: { water: "solved" }, current: "water" }`.
2. **note**: tests/unit/storage/progress.test.js:54. The first review's finding 2 named storage that "throws or is missing". The two-update check covers only the storage that throws.
   - With storage that is missing (`undefined`), the test still checks only `not.toThrow()`. Yet src/browser.js:4 passes `undefined` whenever `localStorage` can't be reached.
   - Today both cases run the same lines in src/storage/progress.js:30–34, so a store that re-read storage would already fail line 52. The risk is low.
   - The Outcome describes only what was done ("with storage that throws"), so it is accurate.
   - Repeating the two updates with `createProgressStore(undefined)` would cover both ways the browser can lack storage.

## Outcome

1. Kept: the unit test checks that the entry is left out, as the finding says, and that is enough.
2. Kept: missing and throwing storage run the same lines, so the test of throwing storage covers both.
