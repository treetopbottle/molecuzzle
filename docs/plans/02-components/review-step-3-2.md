# Review of the fixes for the review of step 3 of plan 02

Commits reviewed: a6654c7 (fixes) and c44dfbd (Outcome); range c3b49f2..c44dfbd.

What was checked:

- **Checks:** `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes at c44dfbd, run in a separate `git worktree` (`npm install`, then the check; the worktree was removed afterwards). Unit tests: 72 passed in 8 files (one more than at f33de91: the new test in `board.test.js`). End-to-end: 24 passed, 1 skipped (Layout.02 on desktop, which runs on the phone project).
- **Outcome against a6654c7:** each line matches the diff.
  1. `tests/unit/puzzle/game.test.js` lost the four lines of stale setup (O–H, C–O, the zero-click `toBeUndefined()`, removing O–H). The snapshot changed from `O─C·H` to `O·C·H`.
  2. `tests/unit/ui/board.test.js:21-23` compares the keys of `ui/elements.js` with those of `puzzle/elements.js`. That covers "a look for every Element … and no more".
  3. `tests/unit/ui/messages.test.js:25-26` expects `null` for `{ changed: false }` and `{ changed: true }`.
  4. `src/puzzle/game.js:38-40` has the suggested wording, plus "other changes that change nothing have no reason". That is true of the code: every return without a reason is `{ changed: false }` (while done at line 43, and at line 51 for weaker on a Dotted line or no change).
- **Bond.04 is the spec's example** (`docs/spec/puzzle.md:135-141`): Methanol, with the Bond H 3,1–H 3,2. Making O 2,1–H 3,1 stronger gives `{ changed: false, reason: "full", atom: 4 }`. Atom 4 is H 3,1 in reading order (H 1,2, O 2,1, C 2,2, H 2,3, H 3,1, H 3,2). O still has room, so the Atom that `change` finds can only be H 3,1. The snapshot shows the Board unchanged apart from H─H.
- **Each changed or new test could fail if the behavior broke:**
  - Bond.04 fails if `change` makes the Bond, gives no reason or the wrong Atom, or changes the Board.
  - The keys test fails if an Element is added to or removed from one table but not the other.
  - The `toBeNull()` lines fail if `reasonText` returns `""`, `undefined`, or any text for a result without a reason.
- **Names follow the plan's renaming rule:**
  - The Bond.04 test is a test of the rules, in `tests/unit/puzzle/`, and keeps its Puzzle id only.
  - The new test in `board.test.js` takes UI ids, Board.01 before Board.04, in ui.md's order.
  - The Messages.02 test keeps its id. See note 1 on the ids of the new test.

## Findings

1. **note**: `tests/unit/ui/board.test.js:21`. The new test's name, "Board.01, Board.04 every Element of the Puzzles has a look and a name", claims more than the test checks, and may be missing an id.
   - The test only compares the keys of the two tables (line 22). An entry in `ui/elements.js` without a `name`, or without colours, would pass. So "has a look and a name" holds only for the keys.
   - What the test protects is the lookup in `board.js` (Board.01, Board.04) and in `messages.js:19`, which words the `full` message with the Element's name (Messages.02).
   - By the plan's rule (the ids of the rules a test is about), Messages.02 could be added after Board.04: "Board.01, Board.04, Messages.02".
   - Either "every Element of the Puzzles has an entry in the UI's table" or a check of `name` per entry would make the name and the test agree.
2. **note**: `src/app.js:41-42`. Only half of the gap in finding 3 of the first review is closed.
   - The unit test now pins `reasonText`'s `null`.
   - Still no test checks that `app.js` shows no message when there is no reason (`if (reason) toast(reason)`).
   - Outcome 3 claims only the Messages.02 test, so it is accurate. The page side fits better in step 8, where `ui.js`'s `say(result)` takes this over and gets happy-dom tests. Worth a test of `say({ changed: false })` there.
3. **note**: a6654c7's message. The subject is `test: …` and lists only the test changes, but the commit also changes the JSDoc in `src/puzzle/game.js:38-40` (Outcome 4).
   - It does no harm, since a comment changes no behavior.
   - The subject doesn't say the commit touches `src/`, so someone reading `git log --oneline` wouldn't find the comment fix.

## Outcome

1. Kept: the other Board and Messages tests check each Element's name and ball where they are drawn and worded; this one adds that no Element of the Puzzles is missing from the UI's table.
2. Fixed in the plan: step 8(a) tests that `say` shows no message for a result with no reason (see the commit marking step 3 done).
3. Kept: the commit is reviewed, and fix forward doesn't rewrite it; this Outcome records the comment fix.
