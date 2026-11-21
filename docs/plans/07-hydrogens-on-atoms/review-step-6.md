# Review of step 6 of plan 07: Progress under a new key

Commits reviewed: 2445e54 (tests, step 6(a)) and fb9cdcf (implementation, step 6(b)), range 69b87ca..fb9cdcf. I read and ran each one in a `git worktree` of my own, with `npm install`. I have removed the worktree.

## What was checked

- **Checks.** At fb9cdcf, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0. That covers 255 unit tests in 16 files, 33 e2e tests and 10 screenshot tests. The screenshot tests ran in podman.
- **The new tests fail at 2445e54**, and the other 17 tests in `progress.test.js` pass:
  - "kept under the key molecuzzle-v3": `expected 'molecuzzle-v2' to be 'molecuzzle-v3'`.
  - "what is stored under molecuzzle-v2 … isn't read": the v2 value is loaded, as `{ puzzles: { water: 'solved' }, … }`.
- **Tests against the spec.**
  - **Progress.03** (storage.md:9) says the key is `molecuzzle-v3`. The first test (progress.test.js:30) checks both the exported constant and that a save writes only that key.
  - **The plan's "what is under molecuzzle-v2 isn't read"** (step 6(a)) is the second test (progress.test.js:37). It uses a full v2 Progress, with `boards`, and expects the empty Progress.
  - **The spec's Progress.03 example** (storage.md:23–30, acetonitrile and glycine) is still tested on today's ids (progress.test.js:49). The plan moves it in step 7.
- **Code against the spec.**
  - The only change is `STORAGE_KEY` (`src/storage/progress.js:2`).
  - Every reader and writer uses the constant: `progress.js:21` and `:48`, and the e2e helpers (`tests/e2e/helpers.js:5,14,56`).
  - No literal `molecuzzle-v2` is left in `src/` or `tests/` except the new test's.
  - No migration was added, as the plan's "Left out" and decision 0023 say.
- **Design.** Only `STORAGE_KEY` changed, as the plan names. Decision 0023's cost already covers the new key and why Players start again.
- **Commits.** Both follow Conventional Commits and carry no attribution.

## Findings

1. **should fix**: `docs/decisions.md:206` (decision 0016). It still says "Progress stays under the key `molecuzzle-v2` when a change only adds an optional field".
   - The rule still holds, and is why 0023 moves to a new key, but the key it names is no longer the code's.
   - Two ways to fix it, as was done for 0021:
     - say "keeps its key" without naming it;
     - add a line that 0023 moved Progress to `molecuzzle-v3`.
2. **note**: `src/storage/progress.js:2`. What a Player has under `molecuzzle-v2` stays in their `localStorage` for good, as nothing removes it.
   - It is small, and the builds still on v2 on the same origin keep reading it (Progress.04, decision 0009), so leaving it is defensible.
   - Decision 0023's cost doesn't mention it.

No must-fix findings.

## Outcome

1. Fixed in 0266c89: 0016 says "its key", and notes that 0023 moved it to `molecuzzle-v3`.
2. Fixed in 0266c89: 0023's cost says what is under the old key stays, read only by older builds.
