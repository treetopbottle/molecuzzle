# Review of step 5 of plan 02: The generator in the Puzzle component

Commits reviewed: 70388da (tests, 5(a)), 2df0b4d (implementation, 5(b)), a10d0ed (README); range 1fba465..a10d0ed.

What was checked:

- **Checks:** `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check` at a10d0ed. They pass: Vitest 105 passed; Playwright 24 passed, 1 skipped (Layout.02 desktop, skipped by design).
- **Tests commit:** 70388da in its own worktree. `tests/unit/puzzle/generate.test.js` fails with "Cannot find module '../../../src/puzzle/generate.js'", as the plan expects. `tests/unit/puzzle/generate-script.test.js` passes at once, as the plan says.
- **Script output, before and after:** `scripts/generate.js` at 1fba465 and at a10d0ed, comparing stdout, stderr and exit code. Inputs: water `2000 3 3 1`, Glycine `3000 5 5 3`, water `100 1 1`, formaldehyde `300 4 4 7`, `H1-C1 C1#N1` with the defaults, `O1=C1 C1=O2 5000 3 5 42`, water with seed 0, `tries` set to `abc`, and no arguments (the usage line). Every result is identical. The one difference is `"H1-O1 O1~H2"`: before, Node printed an uncaught error with a stack and exited 1. Now it prints only `can't read O1~H2` and exits 1, so the exit code is the same. This fits Generate.02 ("it stops with "can't read <bond>"") better than the stack did.
- **The move:** `findLayout` in `src/puzzle/generate.js` is the old script body unchanged. The only differences are the dropped dead `order` and `unused` fields and the return shape. The return shape follows the Design: `{ rows, cols, atoms, solution }`, `atoms` as `[el, r, c]` in reading order, `solution` a sorted Board, `null` when no try gives one solution, and it throws `can't read <bond>`. The first parameter is called `text` rather than `bonds`, because `bonds` is used inside. Callers can't see this.
- **Decision 0011:** `src/puzzle/generate.js` imports only `./grid.js` and `./solver.js`. The script is outside the components and imports only from `src/puzzle/`. Nothing in `dist/index.html` refers to `findLayout`.
- **Tests against the spec:** Generate.01's test is the puzzle.md example value for value. The same-seed test calls `findLayout` twice in one process, so it would also catch shared RNG state. Generate.02's tests are the puzzle.md example (`O1~H2`) and the `null` case (water on a 1 by 1 Grid).
- **README:** "Where things are", the diagram (`generate --> gen`, `gen --> grid`, `gen --> solver`, and `generate --> grid`, still correct because the script counts unused candidates) and the paragraph under it match the code.

## Findings

1. **should fix**: The script's own behaviour for both rules is rewritten in this step, but no test covers it, even though puzzle.md words both rules as script behaviour. See `tests/unit/puzzle/generate-script.test.js:5-9` and `scripts/generate.js:15-31`.
   - Generate.01 (`docs/spec/puzzle.md:51`, example at :70-71) says "it prints rows: 3, cols: 1, atoms: …, solution: …". The printing now builds `atoms` with `JSON.stringify`, takes `solution` from `findLayout` and recounts `unused` itself (`scripts/generate.js:25-31`).
   - Generate.02 (`docs/spec/puzzle.md:52`, example at :77-78) says it "stops with "can't read <bond>"". That path changed from a stack trace to message only plus `process.exit(1)` (`scripts/generate.js:16-21`).
   - Only "no unique layout found" is tested through the script. The plan's 5(a) asked only for that one, so the step follows the plan. But nothing would catch a regression in the printed lines or in the "can't read" exit. Both were confirmed by hand (see above), not by test.
   - Fix: in `generate-script.test.js`, add the Generate.01 example's stdout and the Generate.02 example's stderr and non-zero exit. Both pass at once.
2. **note**: `scripts/generate.js:18-21` catches every error, not only `can't read …`, and prints only `e.message`. A bug in `findLayout`, `grid.js` or `solver.js` would now show as a one-line message with no stack, which is what the developer running this script needs to debug it. Two options: rethrow anything that isn't a "can't read" error, or print `e.message` only for that case.
3. **note**: The script test is in its own file, `tests/unit/puzzle/generate-script.test.js`. The plan's 5(a) put all the step's tests in `tests/unit/puzzle/generate.test.js`.
   - The split is sound. The test runs the script as a subprocess, so it tests a different unit (the script, not the module). Keeping it out of the file that imports the missing module is the only way it can "pass at once" at the tests commit, as the plan says. Inside `generate.test.js`, the import error would fail the whole suite. The deviation is fine, but the plan doesn't record it.
   - Separately, `generate-script.test.js:6` runs the relative path `"scripts/generate.js"`. It works only when the working directory is the repo root, as it is under `npm test`. Resolving it from `import.meta.url` would remove that dependence.
4. **note**: The defaults (20000 tries, 5 by 6, seed 1) are now written twice, at `src/puzzle/generate.js:15` and `scripts/generate.js:12`. The script always passes all four values, so the module's defaults are never used by it, and the two copies can drift apart. `findLayout` also keeps the old string-to-number conversions (`+tries`, `+maxRows`, `+maxCols`, `Number(seed)`), which do nothing now that it gets numbers. These were left in on purpose to keep behaviour unchanged and are harmless.

## Outcome

1. Fixed: `generate-script.test.js` runs the script for the Generate.01 example's printed lines and the Generate.02 example's "can't read O1~H2" (3d817cf).
2. Fixed: the script prints only the message of a "can't read" error and rethrows any other, with its stack (3d817cf).
3. Fixed: the plan's step 5(a) says the script tests are in their own file, and why (a37f13c); the test finds the script from `import.meta.url` (3d817cf).
4. Fixed: the script passes only the arguments given, so findLayout's defaults are the only ones, and findLayout drops the string-to-number conversions; the script's output is the same as before for the inputs compared in this review (3d817cf).
