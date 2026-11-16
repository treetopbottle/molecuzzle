# Second review of step 5 of plan 02: The generator in the Puzzle component

Commits reviewed: 3d817cf (tests, `scripts/generate.js`, `src/puzzle/generate.js`), a37f13c (plan), 8919fda (Outcome); range bfec148..8919fda.

What was checked:

- **Checks:** `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check`, in a separate worktree at 8919fda, since removed. Both pass. Vitest: 107 passed, which is the 105 from the first review plus the 2 new script tests. Playwright: 24 passed and 1 skipped (Layout.02 desktop, skipped by design).
- **Outcome against the commits:**
  1. Matches. `generate-script.test.js:9-15` checks the Generate.01 example's `rows`/`cols`, `atoms` and `solution` lines with status 0. `:17-21` checks that stderr is exactly `can't read O1~H2` and that the exit code is not 0. The values are the ones in puzzle.md:67-78.
  2. Matches. `scripts/generate.js:21` rethrows any error whose message doesn't start with `can't read `.
  3. Matches. The plan's 5(a) (`docs/plans/02-components/README.md:95`) names the own file and says why. The test finds the script from `import.meta.url` (`generate-script.test.js:6`).
  4. Matches. The script passes only the arguments given (`scripts/generate.js:13-14`), and undefined ones fall to `findLayout`'s defaults. `+tries`, `+maxRows`, `+maxCols` and `Number(seed)` are gone from `src/puzzle/generate.js:16,62,82`.
- **Script output, 1fba465 against 8919fda:** stdout, stderr and exit code compared for 28 inputs:
  - The first review's inputs: water `2000 3 3 1`, Glycine `3000 5 5 3`, water `100 1 1`, formaldehyde `300 4 4 7`, `H1-C1 C1#N1` with the defaults, `O1=C1 C1=O2 5000 3 5 42`, water with seed 0, and `tries` set to `abc`.
  - Left-out arguments: water, formaldehyde and Glycine with every argument left out, and water `2000 3` (`maxCols` and `seed` left out).
  - Non-numeric arguments: `abc` as `maxRows`, as `seed`, and as both `maxRows` and `maxCols`.
  - Other numbers: `tries` as `""`, `0`, `1e3`, `" 5 "` and `0x10`; seed `-1`, `1.5` and `4294967297`.
  - Other text: an extra sixth argument, no arguments, an empty spec, and a spec of only spaces.
  - Bad input: `H1-O1 O1~H2`, and `Xx1-H1` (an Element the solver doesn't know).

  Results:
  - All are byte-identical except three.
  - `H1-O1 O1~H2` and the spaces-only spec now print only `can't read O1~H2` and `can't read ` instead of an uncaught error with its stack. The exit code is 1 in both versions. This is the intended change from the first review.
  - `Xx1-H1` throws a `TypeError` in `solver.js:15`. Both versions print the full stack and exit 1. The only difference is the stack frames, which now go through `findLayout` in `src/puzzle/generate.js`. So an error other than "can't read" still propagates with its stack.
- **Could the new tests fail if the printing or the exit broke?** Mostly yes:
  - Each printed line is matched as the spec's full text, trailing comma included. A change to the `JSON.stringify` atoms, to the solution format or to rows/cols fails Generate.01.
  - Removing `process.exit(1)` after a "can't read" falls through to `if (!layout)`. That adds "no unique layout found" to stderr and exits 2, so the exact `toBe` fails.
  - Exiting 0, writing to stdout instead, or printing the error with its stack each fail the Generate.02 test. For the last one, the 1fba465 stderr for this input is the proof: it is the stack, not the bare message.
  - If the success path exits non-zero, Generate.01's `status` check fails.
  - If the script ignored `maxRows`/`maxCols`, the "no unique layout found" test would fail.
  - What isn't covered is in findings 1 and 3.

## Findings

1. **note**: No test covers the rethrow that Outcome 2 added (`scripts/generate.js:21`). If that line were removed, every error would again be cut to its message and no test would fail. Inverting the check would be caught, because the "can't read" test would then see a stack. This is developer-facing behaviour, not in the spec, and the first review raised it only as a note, so leaving it untested is a fair choice. `Xx1-H1` is an input that triggers it, but see finding 2 before pinning that input's output in a test.
2. **note**: A Bond that matches the pattern but names an Element the solver doesn't know, such as `Xx1-H1`, is not reported as "can't read". It ends in `TypeError: Cannot read properties of undefined (reading 'valence')` with a stack, from `src/puzzle/solver.js:15`. The behaviour is the same at 1fba465, so these commits didn't cause it, and it is outside this round. With the rethrow now in place, this is the one ordinary input mistake that shows the developer a stack. Puzzle.md:52 says "if it can't read a Bond"; whether an unknown Element counts is open.
3. **note**: The script's grid comment lines and its `// N unused candidate bonds` count are not tested (`scripts/generate.js:28-32`). Step 5 changed the count: it is now recomputed from `candidateBonds` over the Atoms in reading order. A broken count would pass the tests. The spec doesn't ask for either line, and the before/after comparison shows both unchanged for all 28 inputs.
4. **note**: `scripts/generate.js:21` assumes the caught value is an `Error`. A thrown non-`Error` (a string, `undefined`) would raise a new `TypeError` from `e.message.startsWith` and hide the original. Nothing reachable from `findLayout` throws one today, so this is harmless now. Matching on the message prefix ties the script to the module's wording, but that wording is fixed by Generate.02, so the tie is acceptable.
5. **note**: The plan's 5(a) (`docs/plans/02-components/README.md:95`) now lists the script tests "for the examples" under 5(a). They were added by 3d817cf after the review, not in the tests commit 70388da, so someone comparing 70388da with the plan won't find them. The "passes at once" clause applies only to "no unique layout found", so the sentence is not wrong. The Generate.02 script test would have failed at 70388da, where the script still printed a stack. That failure would have had the right reason for a tests commit.

No must-fix or should-fix findings.

## Outcome

1. Kept: developer-facing and not in the spec, as the finding says.
2. Kept: it was so before step 5; whether an unknown Element counts as "can't read" is a question for the spec, outside this plan.
3. Kept: the spec doesn't ask for those lines, and the comparison shows them unchanged.
4. Kept: nothing reachable throws anything but an Error.
5. Kept: this review and the first one record when the tests came.
