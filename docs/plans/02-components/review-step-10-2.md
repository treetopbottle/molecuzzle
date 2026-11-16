# Review of step 10 of plan 02, round 2: the fixes for the review of step 10

Commits reviewed: 0a80baf (test: every branch of load()'s check of boards, and the whole Progress.05 Board), 4924a5a (fix: replace an entry createGame can't use on opening, and leave out puzzles that isn't an object) and 228e275 (docs: add the outcome of the review of step 10). Range 5c8c915..228e275, with a850183 (the review itself) in it.

What was checked:

- `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check`, in a clean worktree at 228e275 (since removed):
  - First run: 155 unit tests pass (13 files). End-to-end, 29 pass, 1 is skipped and 1 fails: `tests/e2e/puzzle.spec.js:78` Progress.04. After the reload, Water was not solved (finding 3).
  - Second run: 155 unit tests and 30 end-to-end tests pass, with 1 skipped.
  - `npm run test:e2e -- --repeat-each=10`, three times: 900 of 900 pass.
- At 0a80baf, in a worktree of its own (since removed), exactly the two tests aimed at the code change fail, for the reason expected:
  - "Progress.05 an entry whose Board can't be on the Grid is removed when its Puzzle opens": `boards` is still stored.
  - "Progress.03 puzzles that isn't an object is left out": `puzzles` comes back as `{"0":"solved"}`.
  - The nine new `test.each` cases pass at once. That is right, since they cover code that was already there. The commit message has no body that says so.
- The Outcome lines against the commits:
  1. Matches. Each listed case is in `tests/unit/storage/progress.test.js:55-69`, and each asserts `schemaErrors(...)` is non-empty, so the data really doesn't fit the schema. Two of the cases can't fail if their check is removed (finding 2).
  2. Partly matches (finding 1).
  3. Matches: `src/storage/progress.js:86`, test at `progress.test.js:71`.
  4. Matches: `tests/e2e/progress.spec.js:20,23`. The names used ("C 1,2 to N 1,3") fit hydrogen-cyanide's atoms `[H,0,0],[C,0,1],[N,0,2]`.
  5. Matches: `tests/unit/ui/ui.test.js:51`.
- The tests against `docs/spec/storage.md` and `docs/spec/schemas/`:
  - The `test.each` cases each break one part of `board.schema.json` or `progress.schema.json`: `prefixItems`/`items: false`/`minItems: 3`, `type: integer`, `minimum: 0`, the item type, undo items as Boards, `undo` as an array, and the entry as an object.
  - Each case checks that the rest still loads (the solved marks), which is Progress.03's "the rest still loads".
  - Mutation reasoning, case by case:
    - Removing `bond.length === 3` is caught by the four-number case. The two-number case is still rejected by the order check.
    - Changing `isIndex` is caught by the -1 or the 0.5 case.
    - Removing the null branch of `isObject(e)` is caught: `null.bonds` throws and `read` returns empty.
    - Removing `Array.isArray(e.undo)` is caught: `"x".every` throws.
    - Removing `e.undo.every(isBoard)` is caught by the bad undo Board case.
    - Removing `isObject(data.puzzles)` is caught.
- `withEntry` on opening (`src/app.js:28-34,46`):
  - It runs after `createGame`, with `index` and `game` already set.
  - For an entry written by `saved()`, `createGame` gives the same `saved()` back. This is pinned by `tests/unit/app.test.js:98-109`: the kept entry is still `toEqual` after it was opened and another Puzzle was opened.
  - For a rejected entry the Game starts empty, so `saved()` is `null` and the entry is dropped. If it was the only one, `boards` is dropped too. Pinned by `app.test.js:93-96`.
  - The Progress.01 example still stores exactly `{"puzzles":{"water":"solved"},"current":"hydrogen-cyanide"}`: `tests/e2e/puzzle.spec.js:67` and `app.test.js:38`.
  - The Progress.05 example still stores exactly the spec's value, key order included, because `{...p, current}` keeps `p`'s key order and `boards` goes last: `tests/e2e/progress.spec.js:10-13`.
  - This matches `schemas.md:35` ("`boards` has an entry only for a Puzzle in progress"). Decisions 0012 and 0015 still hold.

## Findings

1. **should fix** `docs/plans/02-components/review-step-10.md` (Outcome line 2), and `src/app.js:42`.
   - Finding 2 named two kinds of entry that stay stored:
     - one whose Board can't be on the Grid;
     - one for an unknown Puzzle id.
   - The Outcome says "Fixed", but only the first kind is fixed. An unknown id's entry never reaches `createGame`, so `withEntry` never touches it. It is still written back on every save, for good.
   - The same holds for a known Puzzle's bad entry until that Puzzle is opened. That one is fine, since it is fixed on opening.
   - So the stored value can still break `schemas.md:35` ("`boards` has an entry only for a Puzzle in progress … each Board in it is one of that Puzzle's").
   - Fix: either the Outcome line says the unknown-id case is kept, and why (as with `puzzles` with unknown ids, which the finding already pointed to), or `load()`/`startApp` drops entries whose id isn't a Puzzle's.
2. **note** `tests/unit/storage/progress.test.js:60,64`: two of the cases Outcome line 1 counts as "a test per untested part of the check" pass even with that part removed.
   - "a Bond that isn't a list" (`bonds: [5]`): without `Array.isArray(bond)` in `src/storage/progress.js:70`, `5` is still rejected by `bond.length === 3`. Only a stored object such as `{"0":0,"1":1,"2":1,"length":3}` would show the check is needed.
   - "an entry that is a list" (`[]`): without the `!Array.isArray` part of `isObject`, `[].bonds` is `undefined` and `isBoard` rejects it anyway. JSON can't make an array that would get through, so this part can't be tested through `load()` for entries. The test is harmless, but it pins nothing.
   - The harm if `Array.isArray(bond)` went is small: `createGame` rejects such a Board, and now `withEntry` drops it on opening.
3. **note** `tests/e2e/puzzle.spec.js:84-85`, Progress.04: it failed once in the first full `npm run check` at 228e275.
   - After the reload, Water wasn't solved: "Solved 0 of 13", an empty Board.
   - It passed in a second full run and in 900 repeats (`--repeat-each=10`, three times), so it looks like a timing flake on a cold first run. One guess, not confirmed: the reload comes right after the solve, and Chromium may not have finished writing `localStorage` for the `file://` page.
   - The solve-then-reload path writes the same things it did before 4924a5a, so the fix doesn't look like the cause. `withEntry` on opening rewrites what was loaded, as the old `current` update did. Worth watching if it comes back.
4. **note** `src/app.js:42-46`: `open()` writes the open Puzzle's entry as `saved()` gives it, not only "an entry createGame couldn't use".
   - So some entries that fit the schema are also rewritten on opening:
     - Bonds not in candidate order (e.g. `[[1,2,1],[0,1,1]]`) come back sorted.
     - `revealed: true` with no Bonds becomes `false`.
     - Extra fields in an entry are dropped. The first review noted `load()` keeps them, and the schema allows them.
     - A stored solved Board, or one with no Bonds and nothing to undo, is removed. A solved Board is also marked solved by `update()`, as before this fix.
   - All of these fit `schemas.md:35`, the board schema's description ("by first Atom, then second") and `revealed`'s meaning, and none is an entry the game writes. So nothing is wrong.
   - But the JSDoc, the commit subject and Outcome line 2 describe only the rejected-entry case. Something like "the open Puzzle's entry is saved again as saved() gives it" would say what happens.

## Outcome

1. Kept: entries for ids that aren't a Puzzle's stay, as in `puzzles`. Pages from one origin share Progress (Progress.04), so a branch build with other Puzzles writes ids this build doesn't know; dropping them would lose that build's Progress. This line corrects Outcome 2 of the first review: only the entry of a Puzzle that opens is removed.
2. Kept: the object with a `length` is made up, and `createGame` would reject such a Board on opening anyway.
3. Kept: it passed in 900 repeats; to watch, as the finding says.
4. Fixed: the comment on `open()` says it saves the entry again as `saved()` gives it (0fa6726).
