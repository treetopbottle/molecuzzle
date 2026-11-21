# Review of plan 03: Solved Puzzles keep their solution

Commits reviewed: 02051d2 (the plan, its spec changes and decision 0017). Read at 02051d2 in a separate worktree. The worktree has been removed.

## What was checked

- **Backlog:** the plan covers the removed item ("Solved puzzles should keep showing the solution...").
- **Rule ids:** Progress.01, .05 and .06 and Board.03 exist in `docs/spec/storage.md` and `docs/spec/ui.md`. They don't conflict with Puzzle.03, Bond.08–10, Help.01/02 or Panel.02/03.
- **Spec examples against the code:** the stored JSON in Progress.01 and Progress.06 matches what `app.js` `withEntry`/`markSolved` would write, key order included.
- **Design against the code:** `game.js` `saved()`, `app.js`, `storage/progress.js`, `ui/board.js`, `ui/ui.js` and `style.css`.
- **Decisions:** 0017 against 0008, 0015 and 0016.
- **Steps:** every rule id has a step, and both steps are split into tests (a) and implementation (b).
- **Tests to change:** every unit and e2e test that asserts what is stored after solving, or what a solved Puzzle looks like when it opens again.

## Findings

1. **should fix**: `tests/unit/app.test.js:43-51` (line 49) will break, but the plan doesn't list it. "Progress.01 a solved Puzzle is marked solved, and the UI shows it" expects `store.saved` to equal `{ puzzles: { water: "solved" }, current: "water" }` after solving. Once `saved()` keeps the solved Board, `boards.water` is there too. Step 1(a) (`docs/plans/03-keep-solved/README.md:32`) lists only the test at `app.test.js:82`. Left out, the fix would land in the implementation commit, which breaks the tests/implementation split. The other tests that break are all listed: `game.test.js:339`, `app.test.js:82`, `progress.spec.js:46` and `:50`, and `puzzle.spec.js:124`.

2. **should fix**: `docs/plans/03-keep-solved/README.md:27`: the Design misses that the svg is reused across Puzzles.
   - `ui/ui.js:38` calls `createBoard` on the same `#board` for every Puzzle.
   - `createBoard` removes only `solved` (`ui/board.js:29`). If it doesn't also remove `pulse`, a `pulse` left from solving one Puzzle stays on the svg.
   - The Atoms are new elements, so the animation runs again on them. Opening another solved Puzzle right after solving would pulse, which Board.03 now forbids.
   - The planned unit test "a Board created for a solved game has `solved` but not `pulse`" can't catch this, because `board.test.js:12-15` makes a fresh svg for every test.
   - Step 2(a) (`:35`) names no file or flow for the e2e test "a solved Puzzle that opens again has no `pulse`". If it opens the Puzzle after a reload, as in the Progress.06 example, it misses the bug.

   Say in the Design that `createBoard` removes `pulse`. Make the tests create a solved Board on an svg that just had `pulse`, and open a solved Puzzle right after solving another one in the same page.

3. **should fix**: `README.md:31` still defines Progress as "...and the Boards of Puzzles in progress". It now also keeps the Boards of solved Puzzles (storage.md:7, Progress.06). The spec commit changed `schemas.md` and the schema description, but not this domain definition.

4. **should fix**: `docs/decisions.md:205-214`: 0017 doesn't say how it fits 0016 (`decisions.md:199`). 0016 says "a field that changes its meaning ... gets a new key". `boards` changes from "Per Puzzle in progress" to "Per Puzzle in progress or solved" (`progress.schema.json`) but keeps `molecuzzle-v2`. The plan (`README.md:26`) treats this as no change.
   - Why: say why the key stays. Entries keep their format, and an older build opens a solved entry as solved.
   - Cost: an older build on the same origin (0009) removes a solved Board the next time it opens that Puzzle, because its `saved()` is `null` when solved and `withEntry` drops the entry.

5. **note**: `docs/plans/03-keep-solved/README.md:25` says "`app.js`: no change". The docstring at `src/app.js:27` ("without its entry when it isn't in progress") becomes wrong, since a solved Puzzle keeps its entry. Step 1(b) should update it, along with the `saved()` docstring in `game.js:128-130`.

6. **note**: `docs/plans/03-keep-solved/README.md:27`: "gets the class `pulse` only when a `render()` finds it solved and the one before didn't" doesn't say whether `pulse` stays on later renders while the Board is still solved. An implementation that turns it off on the next render would stop the animation part-way, for example on Show solution over a solved Board, which calls `keep()` and so `render()`. Say that it stays until the status leaves solved or a new Board is created. Also, `style.css:59` (the reduced-motion rule) changes from `.solved` to `.pulse` along with `:57`.

7. **note**: `docs/spec/storage.md:12` (Progress.06): "a solved Puzzle" can be read as "marked solved" (Progress.01) rather than "status solved" (Check.04). A Puzzle that is marked solved, then reset and half rebuilt, is in progress (Progress.05), not kept as solved. Progress.05 says "whose status isn't solved ([Check.04])", so Progress.06 could say "a Puzzle whose status is solved ([Check.04])" to match. In the same way, storage.md:7, "the Board of every Puzzle ... solved", is only true for Puzzles solved after this change.
