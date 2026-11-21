# Review of step 2 of plan 06: fewer Puzzles, in order of difficulty

Commits reviewed, range efc6cdf..8f1c626:
- Tests: 34570ca (renumbered tests, Formaldehyde for Ammonia), d8e7860 (the list with its difficulties, the order, the removed Puzzles), a363717 (app.test.js `onOpen` indexes) and 48d66c1 (progress.spec.js reopens Puzzle 2). a363717 and 48d66c1 add tests the first commit missed.
- Implementation: 8f1c626.

I read and ran 8f1c626 and 48d66c1 in separate `git worktree`s, each with `npm install`. Both worktrees have since been removed.

## What was checked

- **Checks.** `CHROMIUM_PATH=/usr/bin/chromium npm run check` at 8f1c626 exits 0: 230 unit tests, 33 e2e tests and 10 screenshot tests pass.
- **The tests fail at 48d66c1, for the expected reasons.**
  - Unit tests: 8 fail, and `removed.test.js` can't load because `src/puzzle/removed.js` doesn't exist yet. The other failures come from the old list: index 8 is not 7, the list has 28 Puzzles where the test expects 20, `PUZZLES[19]` is Iodoethane, "Solved 0 of 28", and `onOpen(1)` opens Ammonia.
  - e2e: 20 tests fail, all because they open the old Puzzle at that number ("Here is Acetic acid", "It's Iodoethane", "Puzzle 1 of 28"). Some time out because the Atom they look for isn't on that Puzzle's Grid.
  - The tests in `game.test.js` and `draw.test.js` still pass at 48d66c1. That is expected: they find their Puzzle by id, and Formaldehyde and Halothane already exist.
- **Tests against the spec.**
  - Puzzle.01 and Puzzle.05: `puzzles.test.js:14-40` checks the 20 names, formulas and difficulties against the table in `docs/spec/puzzle.md:16-37`, and checks that they are in ascending order.
  - Puzzle.04: `puzzles.test.js:70-73` checks Valine at `PUZZLES[19]`.
  - Puzzle.06: `removed.test.js` checks the table's eight Puzzles in order, that each is schema-valid with one solution, and that no Puzzle has a removed id or a formula with the same Atoms. It also checks the example, ammonia / NH3.
  - The old Puzzle.05 test, "Puzzles 22 to 28", is gone.
  - Every renumbered example in `docs/spec/{puzzle,ui,storage,narratives}.md` matches its test: Puzzle.03, Bond.01–10, Check.01–04, Help.01–02, Input.01–05, Messages.01–02, Panel.01, Panel.03, List.01–02, Progress.01, Progress.05, Progress.06 and the narrative. This includes Formaldehyde with H 1,1 to C 2,1 and C 2,1 to H 2,2 in place of Ammonia, and the Halothane drawing in `draw.test.js`, which matches `docs/spec/README.md`.
- **Code.**
  - I compared each Puzzle's `{ … }` block with a script. All 20 in `puzzles.js` and all 8 in `removed.js` are byte-identical to their entries at efc6cdf, and together they are exactly the old 28.
  - The order matches the table, and tied Puzzles keep their old order (Water before HCN, Urea before Halothane, then Glycerol, Serine, Cysteine).
  - `REMOVED` is in the table's order.
  - The top comment of `puzzles.js` is rewritten, and the batch comments are gone.
- **Design.** 8f1c626 changes only `puzzles.js`, the new `removed.js`, `docs/architecture.md` (`removed.js` added to the text and the diagram) and six screenshots. It makes no change to the UI or Storage, and nothing in `src/` imports `removed.js`.
- **Screenshots.** I looked at all six against ui.md: `page-start.png`, `page-phone.png`, `page-solved.png`, `panel-mystery.png`, `panel-solved.png` and `list.png`. Each matches: "of 20", Puzzle 12 is Glycine, Puzzle 3 is marked, and the list has 20 buttons. `actions.png` is unchanged and still matches.
- **Grep of `tests/`.** I searched for `openPuzzle(`, `PUZZLES[…]`, `onOpen(`, `show(`, "of 28" and the names of the removed Puzzles. What is left is listed below.

## Findings

1. **should fix**: `tests/e2e/screenshots.spec.js:14` and `:48`: two test names still use the old number. "Page.01 Puzzle 11 solved" and "Panel.01, Panel.03 the panel of Puzzle 11, solved" now open Puzzle 12, Glycine, as `docs/spec/ui.md:13` and `:132` say. Both names should say Puzzle 12.
2. **note**: `tests/unit/ui/panel.test.js:5-6`, `:24`, `:41-42`: this fixture of 13 made-up Puzzles has Glycine at index 10, so the tests show "Puzzle 11 of 13". It doesn't use `PUZZLES`, so the result is still correct. Its numbers just echo the old list.
3. **note**: some unit-test fixtures still name Ammonia, which is now removed:
   - `tests/unit/ui/puzzle-list.test.js:5`
   - `tests/unit/storage/progress.test.js:66` and `:85`

   They are made-up lists and stored data, not `PUZZLES`. In the storage tests, `ammonia` is now an id the game doesn't know, which is still a valid case. These tests are correct, but they don't meet the brief's "no test names a removed Puzzle".
4. **note**: `tests/unit/ui/ui.test.js:72`: `show(8, …)` in the Input.04 test now opens Halothane instead of Urea. The test doesn't depend on which Puzzle it opens and has no comment naming one, so nothing goes stale.
5. **note**: `tests/unit/puzzle/removed.test.js:25-28`: it checks that each removed Puzzle has one solution, but not that this is its `solution`, nor that its Atoms match its formula, as `puzzles.test.js` checks for the 20. All eight entries are byte-identical to entries that passed those checks before, so this is minor.

No must-fix findings.

## Outcome

1. Fixed in fdd00ce: both test names say Puzzle 12.
2. Kept: a made-up list of its own, which counts its own Puzzles.
3. Kept: made-up lists and stored data; in the storage tests, an id the game doesn't know is a case worth keeping.
4. Kept: the test doesn't depend on the Puzzle, as the finding says.
5. Fixed in fdd00ce: each removed Puzzle has the Atoms of its formula, and its one solution is its `solution`.

Only tests changed, and they pass, so there is no second review.
