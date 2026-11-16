# Review of step 13 of plan 02: Close the review

Commits reviewed: dab3720 (docs: close the review of the initial implementation, with the commits that dealt with each comment). Step 13 has no rule ids, so there is no tests commit and no worktree check.

What was checked:

- **Coverage:** each of the seven comments in `docs/plans/01-initial-implementation/review.md` has its own line. That is the three top-level comments (lines 13, 14, 19) and the four component sub-points (lines 15–18).
- **Hashes:** all 26 cited commits exist and are ancestors of HEAD. `git show --stat` on each shows it does what its line says.
- **Claims against HEAD:**
  - The three schemas are in `docs/spec/schemas/`.
  - Decisions 0011, 0012, 0013 and 0015 say what the lines say.
  - The spec is in `puzzle.md`, `storage.md` and `ui.md`, and the Glue has no spec file of its own.
  - The eight screenshots in `docs/spec/screenshots/` each have a `toHaveScreenshot` test, including `actions.png` for the buttons.
  - `browser.js` passes `PUZZLES`, `createGame`, the store and `createUi` to `startApp`, and `app.js` has no DOM code.
  - No component imports from another one.
- **Tests:** `npm test` passes (13 files, 156 tests). `npm run check` wasn't run, because it needs Podman.
- Nothing the comments asked for is left out. The Data store and retrieval (the Progress store's `load` and `update`, and the `boards` entries) and the snapshot-tested screenshots of UI elements, buttons included (`actions.png`), are both done and both claimed.

## Findings

1. **should fix** `docs/plans/01-initial-implementation/review.md:19`: "compared pixel for pixel in Playwright's image" reads as an exact comparison, and the commits cited for it describe an older version of decision 0013.
   - At HEAD, `playwright.config.js:27` sets `threshold: 0.2, maxDiffPixels: 0`.
   - Decision 0013 says a pixel's colour may drift within that threshold.
   - `docs/spec/ui.md:5` says "pixel for pixel with Playwright's default tolerance".
   - The line cites eacc7b5, whose subject is "compared exactly". That wording was replaced by e5a3b50 ("set Playwright's default screenshot tolerance explicitly (0013)"), which the line doesn't cite.
   - Fix: add "with Playwright's default tolerance" and cite e5a3b50.
2. **note** `docs/plans/01-initial-implementation/review.md:15`: two parts of the Puzzle line say more than is true.
   - "creates new Puzzles with `findLayout`": `findLayout` only finds a layout (`rows`, `cols`, `atoms`, `solution`). The developer runs it through `scripts/generate.js`, and the `id`, `name`, `formula` and `fact` are still written by hand in `src/puzzle/puzzles.js`. "finds the layout of a new Puzzle" would be accurate.
   - "has the Puzzle schema" cites no commit. The schema isn't in the component: it is in `docs/spec/schemas/puzzle.schema.json`, and decision 0012 rejected putting schemas in `src/`. It belongs to the Puzzle part of the spec through Puzzle.01 (`docs/spec/puzzle.md:9`), added in 735d74c, so say that and cite it.
3. **note** `docs/plans/01-initial-implementation/review.md:13`: the `boards` field of the Progress schema came in 978e173, which this line doesn't cite (it is only cited on line 16). The line also doesn't say where the rest of the comment's "board state" is kept.
   - "Progress also keeps each Puzzle in progress as a Board (447602c, 5c8c915)": those two commits are the code and its tests.
   - The Board schema holds only the Bonds. Whether the solution was shown, and the undo history, are kept in the `boards` entry (`docs/spec/schemas.md`, Board section).
4. **note** `docs/plans/01-initial-implementation/review.md:19`: the line leaves two parts of the comment for the reader to work out, and one citation is incomplete.
   - **Data features:** the comment asked them to say "what data is stored, where and how, and how it's accessible and by who". `storage.md` does this, in its What / How / Who rules (`docs/spec/storage.md:3-10`), but the line doesn't say so.
   - **Pages:** the comment asked for "screenshots of the different pages in the application, like the homepage". The game has one page (`docs/spec/ui.md:3`), so its start, solved and phone screenshots stand in for pages. The line doesn't say this.
   - **Citation:** `storage.md` is cited only to 735d74c, which created `data.md`. The rename to `storage.md` is 7a4979e.
5. **note** `docs/plans/01-initial-implementation/review.md:13-19`: the review-fix commits are cited unevenly. For screenshots, b078266 is cited but the later `screenshots.sh` fixes 6805805 and 0c255c4 are not. Other fixes that are also left out: `boards`: 0a80baf and 4924a5a; the undo history: bfd794e and 6008bbe; the UI and the Glue: 1ccfd8e and 17ab93f; the Progress store: 0786db0. Either cite them, or say that only the main commits of each step are listed.
6. **note** `docs/plans/01-initial-implementation/review.md:16`: "the UI state is every Puzzle in progress" states the plan's reading of the comment (`docs/plans/02-components/README.md:15`) as a fact. The open Puzzle is also UI state, and was already kept as `current` before plan 02. Naming it, or writing "taken to be", would let the comment's author check the reading.

## Outcome

1. Fixed: "compared pixel for pixel with Playwright's default tolerance", citing e5a3b50 (6518025).
2. Fixed: the Puzzle line says `findLayout` finds the layout and the rest is written by hand, and that its schema is in the spec as part of Puzzle.01, citing 735d74c (6518025).
3. Fixed: the schemas line says a Board is only the Bonds and where the rest of its state is kept, citing 978e173 (6518025).
4. Fixed: `storage.md`'s what, where, how and who, the one page standing in for pages, and 7a4979e for `storage.md` (6518025).
5. Fixed: the Outcome says it lists each step's tests and implementation, with the review fixes in the plan's review files (6518025).
6. Fixed: the UI state is "taken to be" the open Puzzle, kept already, and every Puzzle in progress (6518025).
