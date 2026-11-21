# Review of plan 04: The halogens and sulfur

Commit reviewed: 3ea7190 (the plan, its spec changes and decision 0018), read in a separate worktree at that commit. The worktree has been removed.

## What was checked

- **Backlog item.** The plan covers both parts: the five Elements and the "can't read" for an Element the game doesn't know.
- **Rule ids.** No new ids, so there are no conflicts. Every rule id in Scope has a step: Puzzle.01, Valence.01, Generate.02, Board.01, Board.04, Page.01, Panel.01, Panel.03, List.01 and List.02. Every step that has rule ids is split into (a) tests and (b) implementation.
- **Chemistry.** All eight formulas are in Hill notation: CS2, CHCl3, CH4S, CCl2O, C2H3Cl, C2F4, C2H5I, C2HBrClF3. The structures are real and use only S 2, halogens 1 and C 4:
  - S=C=S (carbon disulfide)
  - CHCl3 (chloroform)
  - CH3–SH (methanethiol)
  - Cl2C=O (phosgene)
  - CH2=CHCl (vinyl chloride)
  - F2C=CF2 (tetrafluoroethylene)
  - CH3CH2I (iodoethane)
  - CF3–CHBrCl (halothane)

  For the solver, each one has the same shape as an existing Puzzle or a trivial one: CO2, methane, methanol, formaldehyde, ethylene or ethane. Layouts with exactly one solution are possible for all of them.
- **Spec texts against each other.** The table has 21 rows. Puzzle.01 says "21", and the Panel.01, List.02 and Page.01 texts are generic. The examples say "Puzzle 21 of 21" and "Solved 1 of 21". The List example's "Puzzle 13 opens" (`docs/spec/ui.md:160`) still holds. The schema enum and the Hill pattern accept two-letter symbols. `formulaCount` in `puzzles.test.js` and `formulaNodes` in `panel.js` already handle them.
- **Decision 0018.** It has a why, a cost and alternatives, and it is in the index.
- **Design against the code:**
  - `panel.js` and `ui.js` already count `puzzles.length`.
  - `solve()` throws the TypeError the plan describes.
  - `messages.js` takes the Element names from `ui/elements.js`.

## Findings

1. **should fix**: `src/ui/panel.js:10` (Panel.04). The rules list in the panel hard-codes "Each atom needs exactly its number of bonds (orange badge): H 1, O 2, N 3, C 4." On the new Puzzles a Player sees F, Cl, Br, I and S with no valence given. The plan leaves this out: Panel.04 is not in Scope, `panel.js` is not in Design, and nothing covers the test at `tests/unit/ui/panel.test.js:73-81`. The rule text and `panel-mystery.png` need deciding: list every valence, or group them, e.g. "H, F, Cl, Br, I 1; O, S 2; N 3; C 4".

2. **should fix**: `docs/plans/04-halogens-and-sulfur/README.md:40-41`. Step 3 doesn't name the tests and screenshots that the new count breaks; "where the tests say 13" misses some of them. They are:
   - `tests/unit/ui/ui.test.js:117,126`
   - `tests/unit/ui/panel.test.js:5,24-42` (a list of 13 fake Puzzles)
   - `tests/e2e/check.spec.js:34,48,50,86,95`
   - `tests/e2e/puzzle.spec.js:11,31-38,53,65,75,78`
   - `tests/e2e/narrative.spec.js:8,46,48`
   - `tests/e2e/progress.spec.js:34`
   - `tests/e2e/check.spec.js:66-70`, "Panel.03 the last puzzle has no Next puzzle button". It says no 13 in its text, but it builds `PUZZLES[12]` and expects "It's Alanine.", so it has to become Puzzle 21, `PUZZLES[20]` and Halothane. Building Halothane also needs the two-letter `bond()` in `tests/e2e/helpers.js` (finding 3).

   The screenshots that change are `page-start.png`, `page-solved.png`, `page-phone.png`, `panel-mystery.png`, `panel-solved.png` and `list.png`, plus the new `board-halothane.png`. `board.png` and `actions.png` don't change. "(the count, the list and the new one)" should list them.

3. **should fix**: `docs/plans/04-halogens-and-sulfur/README.md:29`. The `bond()` change in `tests/e2e/helpers.js` is in Design but in no step. It belongs in step 3(a), since the e2e test of the last Puzzle clicks C–Cl and C–Br.

4. **should fix**: `tests/helpers/draw.js:16` and `scripts/generate.js:147-148`. Both put a symbol into a single character cell (`grid[..] = a.el`, then `row.join(...)`). A "Cl" or "Br" shifts the rest of its row by one character, so vertical Bonds no longer line up under their Atoms. The Board drawn as text, which step 3(b) uses to check each layout, is then wrong. So are the layout comment the script prints, and any inline snapshot of a new Puzzle. `docs/spec/README.md:139` ("Atoms by Element at the Grid points") doesn't say how a two-letter symbol is drawn. The plan should choose a drawing, for example 2-character cells or a one-character stand-in, and add it to Design and a step.

5. **should fix**: `docs/decisions.md:63-72` (0003), `docs/decisions.md:225`. 0018 changes part of 0003 ("the order, easiest first, only suggests a path"), and its cost says so. But 0003 isn't marked "Partly superseded by 0018", which `docs/decisions.md:5` requires.

6. **should fix**: `docs/architecture.md:49-54`. `generate.js` will import `elements.js` (plan line 25). The Puzzle diagram has no `gen --> elements` arrow, and the plan doesn't mention architecture.md.

7. **note**: `docs/plans/04-halogens-and-sulfur/README.md:34`. The colour test in `tests/unit/ui/board.test.js` reuses "the e2e helpers" `hue`/`isGreen`. Those live in `tests/e2e/helpers.js`, which imports `@playwright/test`, and that is not something a Vitest test should import. Say whether `hue` moves to `tests/helpers/`.

8. **note**: `docs/decisions.md:224`. "Progress is by id ([0016](#0016))": 0016 is about the storage key, not the ids. That Progress is keyed by `id` is in `docs/spec/schemas.md:42`, so the link should point there.

9. **note**: `docs/plans/04-halogens-and-sulfur/README.md:25`. If the check is `ELEMENTS[el]` or `el in ELEMENTS`, a label such as `constructor1` or `toString1` gets past it through `Object.prototype`, and the search fails silently. `Object.hasOwn(ELEMENTS, el)` avoids that.

10. **note**: `docs/spec/ui.md:32,41-43`. The Halothane screenshot shows F, Cl and Br, but not S (yellow) or I (violet); only the unit test checks those two. Also, the complete glow (`--accent` #3ce0b4) is a teal-green, and it may hardly show on the light-green F and green Cl balls. The orange badge (#ffb347) may also be hard to see next to a yellow S. These are worth checking when the screenshots are remade (Board.02).

11. **note**: `docs/spec/puzzle.md:16,18`. The new formulas are in Hill notation, but the existing NH₃ and HCN are not (Hill would be H₃N and CHN), and the spec doesn't name a convention. There is nothing to change for this plan, apart from not claiming Hill notation for the whole table.

12. **note**: Overlap with plan 03 (active). Plan 03 step 2 also changes `tests/unit/ui/board.test.js`, `tests/e2e/check.spec.js` and `tests/e2e/screenshots.spec.js`, and its step 1 changes the narrative test. Plan 04 should say it starts after plan 03 is done, or expect conflicts in those files.

13. **note**: `docs/plans/04-halogens-and-sulfur/README.md:39-41`. Step 3 is the largest step: eight layouts and facts, about 30 count edits in 7 test files, and 7 screenshots. It is mostly mechanical, but it would be easier to review with the files and screenshots listed (finding 2), or with the count edits as their own commit inside (a).

## Outcome

1. Fixed in d959cca: Panel.04 names every Element's valence, in step 1, with the screenshots that show the rules.
2. Fixed in d959cca: step 4(a) names the test files and the last Puzzle's test, and (b) the screenshots that change and the ones that stay.
3. Fixed in d959cca: `bond()` is in step 4(a).
4. Fixed in d959cca: two-letter symbols take two characters in the spec's drawings, `draw.js` and the script's comment; a new step 2, with no rule ids.
5. Fixed in d959cca: 0003 is partly superseded by 0018.
6. Fixed in d959cca: the arrow is in step 3(b), as `generate.js` doesn't import `elements.js` yet.
7. Fixed in d959cca: the colour helpers move to `tests/helpers/colors.js`.
8. Fixed in d959cca: 0018 links the schemas for the ids.
9. Fixed in d959cca: `Object.hasOwn`, in Design.
10. Fixed in d959cca: Design says to check the badge and glow on the new colours when the screenshots are remade.
11. Kept: the plan doesn't claim a notation for the table.
12. Fixed in d959cca: the plan starts once plan 03 is done.
13. Fixed in d959cca: step 4(a) is two commits, the count first.
