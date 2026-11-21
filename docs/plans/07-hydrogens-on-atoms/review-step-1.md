# Review of step 1 of plan 07: hydrogens in the rules

Commits reviewed: 812a79d (tests, step 1(a)) and eb10798 (implementation, step 1(b)), range 2e84454..eb10798. I read and ran each one in its own `git worktree`, with `npm install` in each. I have removed both worktrees.

## What was checked

- **Checks.** At eb10798, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0. That covers 238 unit tests in 16 files, 33 e2e tests and 10 screenshot tests. The screenshot tests ran in podman.
- **The new tests fail at 812a79d, for the reasons the step expects.** 7 of the 8 new tests fail, and the other 63 tests in `game.test.js` and `solver.test.js` pass:
  - Puzzle.07: `game.atoms` has no `h`. The test gets `Oundefined Cundefined …`.
  - Puzzle.03: the CH₃═C Board is accepted.
  - Bond.03: CH₃─C becomes a double Bond.
  - Bond.04: OH–NH₂ is bonded, with no `full`.
  - Check.04: the status is `open, 2`.
  - Valence.01: the needs are `O 2, C 4, C 4, O 2`.
  - The solver finds `[]`, because C 2,1 needs 4 Bonds and has only one Dotted line.
  - The one test that passes is the control "Puzzle.03 a Board whose Atoms have room … starts where it was left". It is meant to pass both before and after.
- **Tests against the spec.**
  - **The made-up Acetic acid matches the spec's drawing** (puzzle.md:70–80, ui.md:49–52): O 1,2; CH₃ 2,1; C 2,2; OH 3,2.
    - Its solution, C═O, CH₃─C and C─OH, fills every Atom.
    - Its formula C₂H₄O₂ counts 3 + 1 hydrogens.
  - **The made-up Glycine matches the spec's Grid.01 drawing** (puzzle.md:183–187).
    - Each Atom of its solution is full: OH 1, NH₂ 1, C 4, CH₂ 2, O 2.
    - Its formula C₂H₅NO₂ counts 1 + 2 + 2 hydrogens.
  - **Valence.01** (game.test.js:346) checks the spec's numbers: 2, 1, 4 and 1, then C needs 2 and O is complete after C═O.
  - **Puzzle.07** (game.test.js:94) checks the spec's O 0, C 3, C 0, O 1.
  - **Bond.04** (game.test.js:123) is the spec's Bond.04 example on Glycine: `full`, with OH 1,1 (atom 0).
  - **Puzzle.03** (game.test.js:105) is refused only because of the bond count. `[1, 2]` is a Dotted line, order 2 is allowed, and nothing crosses.
  - **The solver test** (solver.test.js:10) asks for up to 5 solutions and gets exactly `[[2, 1, 1]]`, in candidate order O–C, CH₃–C, C–OH.
- **Code against the spec.**
  - In `game.js`, `room(i)` is the valence minus the hydrogens. It is used where the stored Board is checked (`orders`, Puzzle.03) and in `remaining` (Valence.01). Through `remaining` it also covers `full` (Bond.04), the wrap (Bond.03) and the status (Check.02–04).
  - `solver.js` subtracts `h` from `need`.
  - Nothing else changed.
- **Design.**
  - A missing fourth item reads as 0: the default `h = 0` in `game.js:18`, and `a.h ?? 0` in `solver.js:15`.
  - `atoms[i].h` is new on the game, as the plan says.
  - No other interface changed. `board.js` reads `game.remaining`, so it follows without a change.
  - `puzzle.schema.json` still allows 3 items. That is right until step 7, since the made-up Puzzles aren't checked against the schema.
  - `generate.js`, `difficulty.js` and the test helper `draw.js` are untouched, as the later steps expect.
  - Neither choice needed a decision: `room` is a helper, and the default of 0 is the plan's.
- **Commits.** Both follow Conventional Commits and carry no attribution.

## Findings

1. **note**: `tests/unit/puzzle/game.test.js:94`. The "no change touches them" half of the Puzzle.07 test can't fail.
   - `game.atoms` is built once and is the same array that is read before and after the changes.
   - Once the first `expect` passes, the second one is true of any implementation.
   - The second check, and Reset, which it leaves out, would only mean something if the test read the hydrogens back some other way, for example through `remaining` after Undo and Reset. As it stands it is harmless, but it is weaker than its name.
2. **note**: `tests/unit/puzzle/game.test.js:105`. The new Puzzle.03 refusal passes `revealed: false` and checks only that there are no Bonds and nothing to undo.
   - Puzzle.03 also says "the solution not shown". The test.each table above it (game.test.js:77–90) checks that by passing `revealed: true` and building to `solved`.
   - The path is shared (`orders()` returns null), so the gap is small. Passing `revealed: true` and building to `solved` here too would cover the whole rule with hydrogens.
3. **note**: `tests/unit/puzzle/game.test.js:117` and `:129`. Two tests have rule ids but don't use their rule's example in the spec.
   - Bond.03 is tested on Acetic acid's CH₃─C. The spec's Bond.03 example is Acetonitrile's wrap after a triple.
   - Check.04 is tested on Acetic acid. The spec's example is "When Glycine is built", and the made-up Glycine is already in the file.
   - These are useful extra tests, outside the step's list. Step 7 should still make sure the spec's own examples have tests: the Check.04 one on Glycine, and the Bond.03 one on Acetonitrile.
4. **note**: `tests/unit/puzzle/puzzles.test.js:43` and `tests/unit/puzzle/removed.test.js:30` map Atoms with `([el, r, c]) => ({ el, r, c })` and drop the fourth item before calling `solve`.
   - This doesn't matter in this step, since today's and the removed Puzzles have no hydrogens.
   - Once step 7 puts hydrogens on the Puzzles, the uniqueness check in `puzzles.test.js` would ignore them. Today's mapping leaves C 2,1 of Acetic acid needing 4 Bonds, so the check would fail with no solutions.
   - Step 7 lists `puzzles.test.js` among its files but doesn't name this mapping. It should carry `h` through, as `solver.test.js:4` now does. `removed.test.js` can keep the mapping: the plan says it checks only ids and formulas from step 7.

No must-fix or should-fix findings.
