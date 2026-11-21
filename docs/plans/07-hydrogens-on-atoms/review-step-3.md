# Review of step 3 of plan 07: labels in the generator

Commits reviewed: 52b8a8f (tests, step 3(a)) and 588b5f7 (implementation, step 3(b)). I read and ran each one in its own `git worktree`, with `npm install` in each, and have removed both worktrees.

## What was checked

- **Checks.** At 588b5f7, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0: 248 unit tests in 16 files, 33 e2e tests and 10 screenshot tests (podman).
- **The new tests fail at 52b8a8f, for the reasons the step expects.** 13 of the 21 tests in `generate.test.js` and `generate-script.test.js` fail, and every other test file passes:
  - Labels with hydrogens throw "can't read CH3-C", since `CH` isn't an Element. This fails the two Acetonitrile Generate.01 tests, the `:` names test, the same-seed test, both drawing tests, the 6 by 5 test, the C~N tests and the "no unique layout" tests.
  - `C2-O` and `H-C` are read by the old parser, so they don't throw.
  - The other 8 pass at 52b8a8f; see finding 2.
- **Tests against the spec.**
  - **Generate.01** (puzzle.md:139) is in `generate.test.js:4`, in the same words as the spec. `generate-script.test.js:9` also checks `rows: 3, cols: 1`, the atoms, the solution and "difficulty 2".
  - **Generate.02** (puzzle.md:146, 153): "can't read C~N" for `CH3-C C~N`, and "can't read CH3-Xx". Both are checked in `generate.test.js` and through the script (`generate-script.test.js:48`, `:54`).
  - **The cases the plan names**, H as an Element and `CH4-C`, are can't read (`generate.test.js:30-41`). So are `HH-C`, `C-OH2`, `C2-O` and `CH3-C:`.
  - **The old examples with H Atoms are gone.** No `H1`-style label is left in the tests, the scripts, `src/`, `docs/spec/` or `docs/architecture.md`. The backlog item at `docs/plans/README.md:31` already uses the new labels.
- **Code against the spec.**
  - `atom()` (`src/puzzle/generate.js:27-33`) reads `<Element>[H[<count>]][:<name>]`. It refuses H as an Element, an Element not in `ELEMENTS`, and hydrogens that leave room for less than one Bond. That is puzzle.md:124-126.
  - The hydrogens reach the solver (`generate.js:77`, through `kinds`) and the output (`generate.js:111`).
  - The script prints the 4-item Atoms, and draws them by label, padded to the widest (`scripts/generate.js:34-38`).
  - The difficulty comment is unchanged, which is right: it changes in step 4.
- **Layouts.** At 588b5f7, with `100000 6 5 1`, I compared label Bonds with stand-in Elements, for Acetonitrile, Acetic acid and Glycerol: the label run gives the same Atom positions and solution as the stand-in run. Acetic acid and Glycine (`NH2-CH2 CH2-C C=O C-OH`) give exactly the made-up Puzzles of steps 1 and 2. Glycerol gives 6 Atoms and 7 Dotted lines, as Puzzle.08's example says.
- **Design.** It follows the plan's line for `generate.js` and the script. No other interface changed. The label grammar is the plan's, so it needs no decision.
- **Commits.** Both follow Conventional Commits and carry no attribution.

## Findings

1. **should fix**: `src/puzzle/generate.js:81-93`. `check()` never checks that the given Bonds give every Atom what it needs, nor that the solver's one solution is those Bonds.
   - So Bonds with a wrong hydrogen count or a wrong order still print a layout, and its `solution` isn't a solution. For example, `node scripts/generate.js "CH3-C C-O C-OH" 2000 3 3 1` exits 0 with `solution: [[0,2,1],[1,2,1],[2,3,1]]`. On that Grid the only solution has C═O, and O 1,2 is left needing 1.
   - `"CH3-C C=O C=OH"` does the same: OH gets 2 Bonds and has room for 1.
   - Generate.01 (puzzle.md:123) promises a Grid "on which the Molecule with these Bonds is the only solution".
   - This is older than this step. At 181ea19, `"H1-C1 C1-H2 C1-H3 C1-C2 C2-O1 C2-O2 O2-H4" 2000 4 4 1` prints a solution with O 4,2 single-bonded. But labels make it easier to hit: a hydrogen count written one off now gives a wrong Puzzle with no error, and step 7 makes 15 Puzzles this way.
   - Two possible fixes: compare `solve(p.atoms, 2)[0]` with `order` in `check()`, or refuse such Bonds in Generate.02. Or add a backlog item next to the one at `docs/plans/README.md:31`. Separately, the script still ends in a TypeError on Bonds that don't join, for example `CH3-C CH#N`; that backlog item already covers it.
2. **note**: `tests/unit/puzzle/generate.test.js:30-41` and `tests/unit/puzzle/generate-script.test.js:54`. 8 of the new or changed tests already pass at 52b8a8f, for another reason.
   - They are seven of the nine "can't read" rows (`CH3-Xx`, `Xx-CH3`, `CH3-constructor`, `CH3-C:`, `HH-C`, `CH4-C`, `C-OH2`), and the script's `CH3-Xx` test.
   - The old parser refuses any label with hydrogens, since `CH` and `OH` aren't Elements.
   - At 588b5f7 they do test the new code: without the room check, `CH4-C` would return null rather than throw. This can't be avoided for refusals, and is recorded only because the workflow asks that new tests fail.
3. **note**: `src/puzzle/generate.js:31`, with `generate.test.js:36-37`. Refusing H as an Element follows the plan's Design and puzzle.md:171 ("H is only ever a hydrogen on an Atom").
   - Generate.02's own text (puzzle.md:124) refuses only an Element "that isn't in the table of valences", and H is in that table (puzzle.md:162).
   - The tests named Generate.02 check more than that rule's text says. The spec could name H in Generate.02.
4. **note**: `src/puzzle/generate.js:28`. The pattern `H([1-9]\d*)?` accepts `H1`, as in `CH1` or `OH1`.
   - That isn't "as in a formula" (puzzle.md:126).
   - `CH1` and `CH` then become different Atoms with the same hydrogens, the way a name after `:` would.
   - Harmless for a developer tool, but `[2-9]` (or refusing `H1`) would match the spec's wording.
5. **note**: `scripts/generate.js:34` copies the label formatting of `tests/helpers/draw.js:14`, subscripts included.
   - The script can't import a test helper, so two copies are understandable, but they can drift apart.
   - One `label` in `src/puzzle/` would remove the copy. That would be an interface the plan doesn't name, so leave it unless it changes again.

No must-fix findings.

## Outcome

1. Fixed in 7bd9169: `check()` takes a layout only if the solver's one solution is the given Bonds, so wrong Bonds end in "no unique layout found"; Generate.02 says so, with a test of both examples.
2. Kept: a refusal test can't fail for the old parser's reason alone, as the finding says.
3. Fixed in 7bd9169: Generate.02 names H.
4. Fixed in 7bd9169: a count of hydrogens is 2 to 9, so `CH1` can't be read, with a test.
5. Kept: the script can't import the test helper, and the plan names no shared label.
