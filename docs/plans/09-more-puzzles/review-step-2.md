# Review of step 2 of plan 09

Commits reviewed: 072e0d0 (tests and spec) and 6389bf6 (`src/puzzle/puzzles.js` and six screenshots). At 072e0d0, in a worktree, `npm test` fails the 5 tests the step expects; at 6389bf6 all 406 pass. `node scripts/generate.js "<bonds>" 2000 6 5 <seed>` prints each of the ten's layout as in `puzzles.js`, with the Grid, Dotted lines, loops and difficulty of the plan's table. Formulas, valences and structures match the real Molecules; the order follows decision 0021; no new Puzzle shares more than 9 points of the same need with another or a removed one. The six screenshots are the plan's and show 30 Puzzles; no reference to 20 Puzzles is left.

## Findings

1. **should fix**, `src/puzzle/puzzles.js:129` (Uridine): "One of the four building blocks of RNA" isn't quite right: uridine is a nucleoside, and RNA is built from nucleotides, with a phosphate. A chemist Player would notice.
2. **note**, `src/puzzle/puzzles.js:213` (Prostaglandin E2): aspirin and ibuprofen block cyclooxygenase, which makes its precursor, not "the enzyme that makes it"; and "at an injury and in a fever, causing pain and swelling" reads as if it causes pain and swelling in a fever, where it raises the temperature.
3. **note**, `src/puzzle/puzzles.js:143` (Streptozotocin): "this glucose with an N═O on it" is loose, as the N═O is on a methylnitrosourea in place of the OH at carbon 2; at 195 characters it is also the longest fact.
4. **note**, `src/puzzle/puzzles.js:206` (Mugineic acid): barley sends out mugineic acid itself; most other grasses mainly send out 2'-deoxymugineic acid.
5. **note**, `docs/spec/puzzle.md:103-108` and `tests/e2e/phone.spec.js:23`: the phone test, tagged Puzzle.04, also opens Prostaglandin E2, which the Puzzle.04 example doesn't name.
