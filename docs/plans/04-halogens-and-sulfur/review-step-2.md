# Review of step 2 of plan 04: Two-letter symbols drawn as text

Commits reviewed: 8dc1370 (step 2, tests and code; it has no rule ids), range f3edfb8..8dc1370. I read and ran it in a separate worktree at 8dc1370 after `npm install`, then removed the worktree.

## What was checked

- **Checks.** `CHROMIUM_PATH=/usr/bin/chromium npm run check` passes:
  - build and unit tests;
  - e2e: 32 passed, 1 skipped;
  - screenshots: 9 passed.
- **Against the spec** (docs/spec/README.md:25, the paragraph before the Glycine and Chloroform drawings):
  - `tests/helpers/draw.js:11-20` makes each point two characters wide when any symbol has two letters. Columns are then three apart, and a one-letter symbol sits in a point's first character.
  - A line along a row fills every character between its two Atoms' symbols. A line along a column runs under the first character.
  - `scripts/generate.js:31-34` pads each point, `·` included, to the widest symbol, and trims the end of each line.
  - With one-letter symbols only, both drawings are the same as before. None of the existing inline snapshots in `tests/unit/puzzle/game.test.js` changed, and all of them pass.
- **Edge cases, drawn in a scratch test in the worktree.** All match the spec's rule:
  - unsolved Chloroform, with dotted lines on both sides of C and on its column;
  - `Br····Cl` over `H·····C`: a two-letter Atom at the left and the right end of a Dotted line that crosses an empty point, and a vertical line under Br and under the C of Cl;
  - `H·····Cl` on one row.
- **Mutations.** Each of these makes a test fail:
  - a horizontal line starting at `A.c * step + width`;
  - a vertical line in the second character;
  - width always 2;
  - no `trimEnd` in the script.

  `A.c * step + 1` survives. That mutation is equivalent: the Atoms are drawn after the lines, so they overwrite the extra character.
- **Design and scope.** The step changes only the two drawings named in the Design, plus their tests. No interface of `src/` changed.
  - In `tests/unit/draw.test.js`, Chloroform is a made-up Puzzle until step 4 adds it, and Glycine is drawn with no Bonds and solved, as the plan says.

## Findings

1. **should fix**: tests/unit/puzzle/generate-script.test.js:9-15. No test pins the script's comment for a layout with only one-letter symbols. The Generate.01 water test checks only `rows`, `atoms` and `solution`, so a mutation of `scripts/generate.js:34` to `p.padEnd(2)` passes every test. That mutation draws one-letter layouts with points three apart. The Design says "Boards with only one-letter symbols are drawn as now", so the comment lines of the water layout (or another one-letter layout) should be checked too.
2. **note**: tests/unit/puzzle/generate-script.test.js:18. The plan's step 2 asks for the comment for "H1-Cl1" with an empty point. The test uses chloromethane, "C1-H1 C1-H2 C1-H3 C1-Cl1", on 3×3. That is a reasonable change: H-Cl alone would most likely be laid out without an empty point. It still meets the plan's intent, a two-letter symbol and an empty point.
3. **note**: tests/unit/draw.test.js:36-49. The two-letter case is tested only solved: Chloroform has no Dotted line, no line crossing an empty point, and no two-letter Atom at the left end of a line. The code draws Dotted lines and Bonds the same way, and Glycine covers crossing an empty point in the one-letter case, so this is no gap today. An unsolved Chloroform in the test would pin the Dotted lines at no cost.

## Outcome

1. Fixed in da824a3: the script's comment for a one-letter layout (methanol) is pinned; `padEnd(2)` now fails it.
2. Kept: chloromethane has the empty point that H-Cl wouldn't, as the finding says.
3. Fixed in da824a3: Chloroform is drawn with no Bonds too.

Only tests changed, and they pass, so there is no second review.
