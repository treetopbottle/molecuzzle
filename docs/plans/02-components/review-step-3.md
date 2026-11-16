# Review of step 3 of plan 02: Rules without text

Commits reviewed: d7b1b89 (tests, step 3(a)) and f33de91 (implementation, step 3(b)); range 6822904..f33de91.

What was checked:

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes at f33de91. Unit tests: 71 passed in 8 files. End-to-end: 24 passed, 1 skipped (Layout.02 on desktop, which runs on the phone project).
- **Tests commit:** d7b1b89, checked out in a separate worktree (`npm install`, `npm test`, then removed). The new tests fail for the reasons the step expects:
  - `tests/unit/ui/messages.test.js` fails because `src/ui/messages.js` doesn't exist yet.
  - Bond.04 and Bond.05 fail because `change` still returns `message: "Hydrogen already has all its bonds."` and `message: "Bonds can't cross."` where the tests expect `reason`.
  - As the plan says, the status tests in `game.test.js` that now compare kinds (Check.01–04, Help.01) pass at once.
- **Rule ids:** each id the step names has a test whose expected result matches the spec:
  - Check.01 now uses Ammonia, the example's Puzzle.
  - Messages.01 and Messages.02 are covered by both the unit test and the existing end-to-end tests of the ui.md examples, in `tests/e2e/check.spec.js:8` and `tests/e2e/bonding.spec.js:16,24`.
- **Design:**
  - `puzzle/elements.js` keeps only `valence`.
  - `ui/elements.js` has the name, colours and size.
  - `ui/messages.js` has `statusText(status, puzzle)` and `reasonText(result, atoms)`.
  - `change` returns exactly the four shapes the plan lists.
  - `app.js` shows `reasonText(result, game.atoms)`.
  - `statusText` has left `game.js`, and its test's import is gone.
  - The only other change is `board.js`'s import, which now points inside the UI. No interface changed beyond the ones the step names.
- **Decision 0011:** only `app.js` imports from more than one component. `ui/messages.js` and `ui/board.js` import only `./elements.js`.
- **README:** the file list and the diagram match the code. The diagram's imports are `board --> looks`, `messages --> looks` and `app --> messages`, and `board --> elements` is gone.

## Findings

1. **should fix**: `tests/unit/puzzle/game.test.js:62-69`. The Bond.04 test isn't the spec's example, and part of its setup tests nothing.
   - The example (`docs/spec/puzzle.md:135-141`) is "Methanol, with a Bond H 3,1 to H 3,2". The test's Board also has a C–O Bond; its inline snapshot shows `O─C·H`.
   - Lines 64-66 bond O–H and C–O ("O is full"), then run `expect(click(game, "2,1", "3,1", 0)).toBeUndefined()`. That clicks zero times and only checks that the helper returns `undefined`.
   - So the comment suggests a `full` case for O that is never exercised, and the left-over C–O moves the Board away from the example.
   - The step rewrote this test's name and expectation (line 69) but kept this stale setup. The expected result `{ changed: false, reason: "full", atom: 4 }` (H 3,1) is right.
   - Fix: make the test the example (only H 3,1–H 3,2, then strengthen O 2,1–H 3,1) and drop lines 64-67.
2. **note**: `src/puzzle/elements.js:2` and `src/ui/elements.js:2`. There are now two `ELEMENTS` tables, with the same export name and keys that must agree, and no test checks that they do.
   - `tests/unit/puzzle/puzzles.test.js:38` checks every Atom against the Puzzle's table only.
   - If an Element were added to the Puzzle's table without a look, `board.js:57` and `messages.js:19` would throw at runtime.
   - A one-line test that both tables have the same keys would catch this.
3. **note**: `src/ui/messages.js:21` and `src/app.js:41-42`. No test checks that a result with no reason gives no text.
   - Messages.02 says a message shows only for `full` and `crossing`.
   - `reasonText` returns `null` for `{ changed: false }` (for example weaker on a Dotted line, or a change while done) and for `{ changed: true }`, and `app.js` relies on that to show nothing. No unit or end-to-end test covers it.
4. **note**: `src/puzzle/game.js:38-39`. The JSDoc says "When no Bond is made, the reason is "full", with the Atom that has no room, or "crossing"."
   - That reads as if every unmade change has one of those reasons. `change` also returns `{ changed: false }` with no reason: while done, weaker on a Dotted line, and when strengthening wraps nothing.
   - Suggested wording: "When a Bond can't be made, the reason is …".

## Outcome

1. Fixed: the Bond.04 test is the example, Methanol with only H 3,1 to H 3,2 (a6654c7).
2. Fixed: a test checks that `ui/elements.js` has a look for every Element of `puzzle/elements.js`, and no more (a6654c7).
3. Fixed: the Messages.02 test checks that a result with no reason gives no text (a6654c7).
4. Fixed: the comment says "When a Bond can't be made", and that other changes that change nothing have no reason (a6654c7).
