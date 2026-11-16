# Review of the fixes for the review of step 2 of plan 02

Commits reviewed: a77a921..649d6d2, which is two commits: c802971 "test: check the status line's orange by colour, and Puzzle.02 for every Puzzle (review of step 2)" and 649d6d2 "docs: add the outcome of the review of step 2". 649d6d2 only adds the Outcome to `review-step-2.md`. The Findings there are unchanged.

What was checked:

- `CHROMIUM_PATH=/usr/bin/chromium npm run check` passed in a separate worktree at 649d6d2, since removed. 69 unit tests passed in 7 files. 24 end-to-end tests passed, with 1 skipped (Layout.02 on desktop, as before).
- Each Outcome line matches c802971:
  1. The pieces test (`tests/e2e/check.spec.js:15-23`) now checks `every(isOrange)` on the text and border colour, and no longer checks `toHaveClass("warn")`. Its name now ends "in orange". The plan's wording at `docs/plans/02-components/README.md:86` ("orange for pieces is tested by `tests/e2e/check.spec.js`") is now true, so it didn't need to change.
  2. Valence.02 asserts `game.status()` is `{ kind: "open", open: 3 }` after C═O (`tests/unit/puzzle/game.test.js:188`).
  3. Puzzle.02 has the line for every Puzzle (`tests/unit/puzzle/game.test.js:20`).
  4. `colors`, `hue`, `isGreen` (90 to 180°) and `isOrange` (15 to 50°) moved to `tests/e2e/helpers.js:58-72`. A colour whose largest and smallest channels differ by less than 25 has no hue.
- The hue maths is the standard RGB-to-hue formula, and the `(h * 60 + 360) % 360` wrap handles a negative red-sector value. The `d < 25` check runs before any division, so a grey never divides by zero. Results for the colours in `src/ui/style.css` at 649d6d2:
  - Default, text `--text` #e6ebf5 (230, 235, 245): channel spread 15, so grey (null). Neither green nor orange.
  - Default, border `--line` #2a3550 (42, 53, 80): spread 38, hue 222.6°. Neither.
  - Good, text #b9f7e4: 161.6°. Good, border rgba(60,224,180,.6): 163.9°. Both green.
  - Warn, text #ffe0b3: 35.5°. Warn, border rgba(255,179,71,.5): 35.2°. Both orange.
  - `colors` drops alpha. Blending the borders over `--panel-2` gives the same answers: good about 169°, warn about 34°.
  - Finding 4's fragility is gone: `--text` is a blue-grey (about 220°), so even a more coloured `--text` stays outside both ranges.
- Each changed test can still fail if the behaviour breaks. This was checked by reading the code, not by running mutations:
  - Pieces, `every(isOrange)`: fails if `#status.warn` (`src/ui/style.css:36`) is removed (text grey, border 223°), if it turns green, or if `app.js:67` stops setting `warn` for pieces. The check reads the colour once and doesn't retry. That is safe: `app.js:66-67` sets the text and the class in the same update, and `#status` has no transition.
  - The default check in the green test, `some(isGreen || isOrange)` (`tests/e2e/check.spec.js:55`): fails if the status line is always green or always orange.
  - Valence.02, `status()`: fails if `status()` counts complete Atoms as open (it would say 4), or if `remaining()` is wrong.
  - Puzzle.02, every Puzzle: fails if any Puzzle's `createGame(p).order` starts with a Bond. `order` is a getter that returns a copy of the live state (`src/puzzle/game.js:82`).
- Both commit messages are Conventional Commits with no attribution.

## Findings

1. **note:** `tests/unit/puzzle/game.test.js:20`. If this check fails, Vitest prints every Puzzle that starts with a Bond as a whole Puzzle object (atoms, solution and the rest). Mapping the result with `.map(p => p.id)` before `toEqual([])` would give a short, readable failure. The check itself is correct.
2. **note:** `tests/e2e/helpers.js:66` and `tests/e2e/helpers.js:71`. Two facts about the helpers, neither of them wrong today:
   - The cut-off is an absolute channel spread, not a saturation. So the default border `--line` (spread 38) counts as having a hue: 223°. It is kept out of green and orange by the hue ranges, not by the "(nearly) grey" rule the comment at line 63 describes.
   - The good colours sit at 162 to 164°, 16 to 18° below the top of the green range (180°). Moving `--accent` toward cyan would fail the green test. That is arguably right, since Messages.01 says green.

## Outcome

1. Kept: the check is correct, and a failure still names the Puzzle in the object it prints.
2. Kept: both are right today; a test that fails when the green turns cyan is what Messages.01 asks for.
