# Review of step 6 of plan 02: The Progress store

Commits reviewed: 78b63d4 (tests, step 6(a)) and 7bbaa10 (implementation, step 6(b)), range 36c93f5..7bbaa10.

What was checked:

- **Checks:** `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check` in a clean worktree at 7bbaa10. Vitest: 108 of 108 passed. Playwright: 25 passed and 1 skipped (Layout.02 on desktop, as before).
- **At the tests commit:** in a separate worktree at 78b63d4, four store tests fail with `TypeError: createProgressStore is not a function`. These are Progress.01+03, both Progress.03 tests and Progress.02. The Progress.04 end-to-end test passes at once, as the plan says. So does the new markSolved test (see the fourth finding).
- **app.js behaves as before:** opening a Puzzle saves `current` every time, as it did. A solved Puzzle is saved only once, as before: the old `next !== progress` test became a check of `progress.puzzles[id]` before calling `update`.
- **Decision 0011:** `storage/progress.js` imports nothing, and only the Glue (`app.js`) imports it.
- **README diagram:** the label "store: load, update; markSolved" matches the module.
- **Progress.04 test:** the listener is attached before the first `goto`. The test compares the whole list of requests, both loads and everything between them, to exactly `[GAME_URL, GAME_URL]`. Any extra fetch, XHR, image, script, style sheet or beacon from the page would be listed and fail it. The test already shows that Playwright records file:// requests.

## Findings

1. **should fix**: src/storage/progress.js:21 and :30–33, against docs/plans/02-components/README.md:45. `update(change)` also returns the new Progress, and app.js depends on that (src/app.js:35 and :49). The Design only says that it "saves `change(progress)`".
   - Returning it is a reasonable choice. Without storage (Progress.02), only the store's copy in memory keeps the session's Progress: calling `load()` again would lose it.
   - But the Design doesn't say so, and step 8 will write `tests/unit/app.test.js` against a fake store. Add "and returns it" to the Design's `storage/progress.js` line.
2. **should fix**: tests/unit/storage/progress.test.js:47–54. No test checks what `update` returns, nor that the next `update` builds on it when storage throws or is missing. The Progress.02 test only checks `not.toThrow()`.
   - Progress.02 says "the game works and keeps nothing". After this step, "works" depends on the store keeping Progress in memory and returning it.
   - If a store re-read storage on every `update`, or returned nothing, these unit tests would still pass. The game would lose its solved Puzzles during a session without storage, or break.
   - With the `broken` storage, check that two updates in a row return `{ puzzles: { water: "solved" }, current: "water" }`.
3. **should fix**: tests/unit/storage/progress.test.js:36–39 and tests/e2e/puzzle.spec.js. Part of Progress.01, and the last line of the Progress.03 example, have no test.
   - The rule says "if the open Puzzle is missing or unknown, Puzzle 1 opens". The example ends "And Puzzle 1 is open: 7 isn't a Puzzle's id".
   - The unit test stops at `current: null`, which is how the store represents it. No test stores an unknown `current` (7, or an id that isn't a Puzzle) and then checks that Puzzle 1 opens with only Water solved. The code handles it in app.js with `Math.max(0, findIndex(...))`, untested.
   - The step names Progress.01 and Progress.03. An end-to-end test of the example, `start(page, { puzzles: { water: "solved", urea: "seen" }, current: 7 })`, would cover both.
4. **note**: tests/unit/storage/progress.test.js:30–34. The new test "Progress.01 a Puzzle marked solved stays solved" only uses `markSolved`, which already existed, so it passes at once at 78b63d4. Neither the plan's step 6(a) nor the message of 78b63d4 says so: the message says only Progress.04 passes at once.
5. **note**: tests/e2e/puzzle.spec.js:70–79. `page.on("request")` covers what the page loads over HTTP(S) and file://. It doesn't see WebSockets (Playwright's separate `websocket` event), WebRTC, or a request sent after the last assertion, for example on a timer. That is enough for the page as it is now, since the build inlines everything. If the page ever gains a worker or a socket, the test will need more than this event.
