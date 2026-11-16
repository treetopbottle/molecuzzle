# Review of step 10 of plan 02: Keep every Puzzle in progress

Commits reviewed: 447602c (test: every Puzzle in progress is kept, with its undo history, until solved or reset) and 5c8c915 (feat: keep every Puzzle in progress in Progress, and enable Reset with something to undo), range fa9637e..5c8c915.

What was checked:

- `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check`, in a clean worktree at 5c8c915: 144 unit tests pass (13 files), and 30 end-to-end tests pass with 1 skipped (the desktop project skips Layout.02, which is for phones). In the main checkout one more test fails, the untracked `tests/e2e/reset.spec.js` (Input.05, step 11 in progress), which is not part of these commits.
- At 447602c, in a worktree of its own, these tests fail for the reason the step expects:
  - the three new Progress.05 tests in `app.test.js`. Nothing is written to `boards`, and `createGame` gets `undefined` where the entry should be.
  - the `load()` test of kept entries: no `boards` comes back.
  - Input.03 "Reset is enabled with no Bonds but something to undo": Reset is still disabled.
  - three of the four new end-to-end tests: nothing is stored under `boards`, and after a reload the shown solution is gone.
- These pass at once, as the commit message says:
  - "Progress.05 a solved Puzzle opens again with no Bonds"
  - "Progress.03 boards that don't fit, or have no entry left, are left out"
- The other "already holds" case is covered: `tests/e2e/puzzle.spec.js:60` compares the stored value of the Progress.01 example with `toEqual`, so a leftover `boards` would fail it.
- Rule ids have matching tests:
  - Progress.03: `tests/unit/storage/progress.test.js:41,55`, and `tests/e2e/progress.spec.js:35`, which checks the stored value against `progress.schema.json`.
  - Progress.05: `tests/unit/app.test.js:67-104`, and `tests/e2e/progress.spec.js`. That file covers the example word for word, using a new page in the same context as the closed browser; a shown solution still unsolved after a reload; and a valid stored Progress.
  - Input.03: `tests/unit/ui/ui.test.js:62`.
- The design is followed:
  - `load()` checks `boards` by hand. Compared with `board.schema.json` and `progress.schema.json` in full, the check matches: exactly 3 items per Bond, the first two non-negative integers, the order in 1–3; an entry must be an object (not an array) with all three fields; `undo` holds at most 100 Boards; a `boards` that isn't an object is left out. Extra fields in an entry are kept, which the schema allows.
  - `app.js` runs `keep()` after every change, Undo, Reset and Show solution. It drops the entry when `saved()` is `null` and drops `boards` when it is empty. On opening, it passes the entry to `createGame`.
  - In `ui/ui.js`, Reset is enabled when there are Bonds or something to undo.
  - Only the interfaces the step names changed. The code matches decisions 0012 and 0015: Show solution writes to Progress but never a solved mark, Reset and solving remove the entry, and every save rewrites the whole Progress.

## Findings

1. **should fix** `tests/unit/storage/progress.test.js:41-59`: several parts of the hand-written check in `src/storage/progress.js:7-11` are never tested, so each could be removed or changed and every test would still pass. Decision 0012 counts on the tests to show that the hand-written check agrees with the schema. The tests try only these entries: `undo` with 101 Boards, `revealed: "yes"`, order 4, a missing `undo`, `bonds: "x"`, and `boards` as a string or an array. Untested:
   - the Bond length (`bond.length === 3`, the schema's `prefixItems`, `items: false` and `minItems: 3`), e.g. `[0, 1]` or `[0, 1, 1, 1]`;
   - `isIndex`, the integer type and `minimum: 0`, e.g. `[-1, 1, 1]` or `[0.5, 1, 1]`;
   - a Bond that isn't an array, e.g. `bonds: [5]`;
   - `isObject(e)`, an entry of `null` or `[]`. This one matters most: without the check, `null.bonds` throws inside the `try`, and `read` returns empty, so one bad entry would lose every solved mark. That breaks Progress.03's "the rest still loads".
   - `e.undo.every(isBoard)`, e.g. `undo: [[[0, 1, 4]]]`, and `undo` that isn't an array.

   Each such case could also assert that `schemaErrors` is non-empty for it, so the tests show the bad data really doesn't fit the schema.
2. **note** `src/app.js:39-45`: on opening, an entry that `createGame` rejects stays in what is stored. That is an entry whose Board, or one in its history, can't be on the Grid (Puzzle.03), or one for an unknown Puzzle id. It is written back on every save, and is replaced only when the Player changes that Puzzle. `schemas.md` says "`boards` has an entry only for a Puzzle in progress … each Board in it is one of that Puzzle's", which such a stored value no longer meets. This is harmless, since it is rejected again on every opening, and the plan's Design asks only to pass the entry on. So it needs either a `keep()` on opening or a sentence in the spec, not necessarily a code fix. The same holds already for `puzzles` with unknown ids.
3. **note** `src/storage/progress.js:24`: `puzzles` is not checked to be an object, unlike the new `boards` check. Stored `{"puzzles": ["solved"]}` loads as `puzzles: {"0": "solved"}`, where Progress.03 says a field that doesn't fit is left out. The result is still a valid Progress. The behavior is older than this step, but the new `isObject` helper next to it would fix it.
4. **note** `tests/e2e/progress.spec.js:17-20`: the Progress.05 example says "Then it is H─C·N, and Undo makes it H·C·N". The test checks only the H–C Bond (1,1 to 1,2), before and after Undo. It never checks that C–N (1,2 to 1,3) has no Bond. The stored value checked earlier makes a wrong restore unlikely, but the example's Board is not checked in full.
5. **note** `tests/unit/ui/ui.test.js:51`: the older test "Input.03 Undo is disabled with nothing to undo, Reset with no Bonds" now names only half of the rule. Reset is disabled with no Bonds *and* nothing to undo, which is what the test actually sets up.
