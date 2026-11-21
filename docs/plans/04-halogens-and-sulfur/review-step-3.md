# Review of step 3 of plan 04: The generator knows the Elements

Commits reviewed: 4e28322 (tests, step 3(a)) and b245f9a (implementation, step 3(b)), range eef297d..b245f9a. I read and ran them in two separate worktrees, at 4e28322 and at b245f9a, each after `npm install`, and removed both afterwards.

## What was checked

- **Checks.** At b245f9a, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0: the build and unit tests pass, e2e has 32 passed and 1 skipped, and the 9 screenshot tests pass.
- **Tests commit.** At 4e28322 the two new tests fail for the reason the plan expects. `findLayout("H1-Xx1")` throws `TypeError: Cannot read properties of undefined (reading 'valence')` in `solver.js:15`. The script prints that stack trace instead of `can't read H1-Xx1`. The other 9 tests in the two files pass. The commit changes only tests.
- **Against the spec** (docs/spec/puzzle.md:60, 89-94). Both Generate.02 examples are tested, in `generate.test.js` and through the script in `generate-script.test.js`: `"H1-O1 O1~H2"` (already there) and `"H1-Xx1"`. Each expected result matches the spec word for word, and the script test also checks the non-zero exit.
- **Design.** `src/puzzle/generate.js:29` checks both labels with `Object.hasOwn(ELEMENTS, …)`. `ELEMENTS` is imported from `./elements.js` (line 6). The check runs while the Bonds are parsed, before the search. `docs/architecture.md:54` gains `gen --> elements`. Only `generate.js` (its code and doc comment) and `architecture.md` change, and `findLayout`'s signature is the same.
- **Label edge cases, run through `scripts/generate.js` at b245f9a.** At 4e28322 every one of these ended in a `TypeError`:
  - `h1-O1`: `can't read h1-O1`
  - `H1-CL1`: `can't read H1-CL1`
  - `Xx1-H1`: `can't read Xx1-H1`
  - `H1-O1 O1-H2 Q1-H3`: `can't read Q1-H3`

  A label with digits in the middle, such as `C1l`, was already refused by the token regex (line 26). `Cl1` is read as `Cl`, never as C plus l: `element` strips only trailing digits. `constructor1` is refused, and so would be `__proto__` or `toString`.
- **Behaviour unchanged.** The new check doesn't call `random()`, and moving `element` above the loop changes nothing. The script prints the same output at both commits for the Generate.01 water example, `O1=C1 C1-O2 O2-H1 C1-H2`, Glycine (seed 1, 5×6) and chloromethane on 3×3.

## Findings

1. **should fix**: tests/unit/puzzle/generate.test.js:24-25 and tests/unit/puzzle/generate-script.test.js:45. Every new case has the unknown Element in the second label (`H1-Xx1`, `H1-constructor1`). A mutation of line 29 that checks only `y` would pass every test, though Generate.02 covers any Atom of the Bond. Add a case with the unknown Element first, e.g. `findLayout("Xx1-H1")`.
2. **note**: tests/unit/puzzle/generate.test.js:25. At 4e28322 the `constructor1` assertion is never reached, because the `Xx1` assertion before it fails first. So nothing shows it failing without the fix. It does catch the mutations it is there for: with `in` or `ELEMENTS[…]` instead of `Object.hasOwn`, `constructor` passes the check and `findLayout` doesn't throw `can't read`. This is fine as it is.
3. **note**: src/puzzle/generate.js:67, outside this step. Bonds that don't connect into one Molecule, such as `H1-O1 H2-H3`, still end in a `TypeError` (`pos.get(i)` is undefined), not in a message. Generate.02 doesn't cover this, since every Bond can be read. It is a possible backlog item, not something for this step.
