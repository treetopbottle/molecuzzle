# Second review of plan 04: The halogens and sulfur

Commits reviewed: d959cca (fixes to the plan, the spec and the decisions) and d5b0891 (the Outcome of the first review), against the plan as written in 3ea7190. I read them in a separate worktree at d5b0891, which has been removed.

## What was checked

- **Outcome lines against d959cca.** All 13 match the diff:
  - Panel.04 is in Scope, Design and step 1.
  - Step 4(a) is two commits and names the test files and the last Puzzle's test.
  - Step 4(b) lists the screenshots that change and the ones that stay.
  - `bond()` is in step 4(a).
  - Two-letter symbols are drawn as in the spec README, and step 2 is new.
  - 0003 is marked "Partly superseded by 0018".
  - The architecture arrow is in Design and step 3(b).
  - `tests/helpers/colors.js` is in Design.
  - 0018 links `schemas.md#progress`, and that anchor exists.
  - `Object.hasOwn` is in Design.
  - The badge and glow check is in Design.
  - The plan now says it starts once plan 03 is done.
- **Rule ids.** No new ids. Every id in Scope has a step:
  - Valence.01, Board.01, Board.04 and Panel.04 in step 1.
  - Generate.02 in step 3.
  - Puzzle.01, Board.01, Page.01, Panel.01, Panel.03, List.01 and List.02 in step 4.
  - Each step with rule ids is split into (a) and (b).
- **Design against the code:**
  - `findLayout` reaches `solve()` with an unknown Element and throws a TypeError there.
  - The script rethrows anything that isn't "can't read".
  - `hue` isn't exported yet.
  - `draw(game)` needs a game, so step 2's made-up Puzzle needs Cl in `puzzle/elements.js`. Step 1 comes first, so the order works.
  - The schema enum already has the five symbols.
- **Tests failing at the right commit:**
  - Steps 1(a) and 3(a) fail as expected: no new Element keys, names or rule text, and a TypeError instead of "can't read H1-Xx1".
  - Step 4(a), second commit: the Puzzles list snapshot, Phosgene from `puzzles.js` and the Halothane screenshot all fail.
- **Spec texts:**
  - The Phosgene drawing fits "two characters wide, three apart".
  - The Panel.04 text matches step 1.
  - The Panel.01 and List examples fit 21 Puzzles.

## Findings

1. **should fix**: `docs/plans/04-halogens-and-sulfur/README.md:46-47`. The first commit of step 4(a) says "all fail as there are only 13 Puzzles". That isn't true for `tests/unit/ui/panel.test.js`:
   - It renders its own fake list (`tests/unit/ui/panel.test.js:5`), and `renderPanel` counts `puzzles.length`.
   - So with 21 fake Puzzles, "Puzzle 21 of 21" passes at once.
   - Leave `panel.test.js` at 13 fake Puzzles (it doesn't test the real count), or drop it from the "all fail" claim.

2. **should fix**: `docs/spec/README.md:25,37-45` and plan line 30. The rule for two-letter symbols leaves out things that step 4's layouts will run into:
   - Where a one-letter symbol sits in a two-character point. The example implies the first character, with vertical Bonds under it.
   - What fills the second character when a horizontal Bond or Dotted line leaves a one-letter Atom: is it `C─Cl` drawn as `C──Cl` or as `C ─Cl`?
   - How a Dotted line or Bond crosses an empty two-character point.
   - How an empty point looks in the script's comment, which uses `·` for empty points (`scripts/generate.js:29-31`).

   The Phosgene example has none of these, since Cl is on the left and no line crosses an empty point. Glycine is one-letter only. So step 2's tests can't pin them down, and the Chloroform, Vinyl chloride and Halothane snapshots in step 4 would set the convention by accident. Say it in the README, and add a case to step 2's test, e.g. a one-letter Atom bonded to the left of Cl.

3. **should fix**: `docs/plans/04-halogens-and-sulfur/README.md:41,51-52` and `docs/spec/README.md:37-45`. Step 4(a) expects the spec's Phosgene drawing from `puzzles.js` before step 4(b) makes the layout with `scripts/generate.js`, and the generator may not give this layout:
   - The generator ranks layouts by how many candidate Bonds go unused (`src/puzzle/generate.js:121`). This drawing has none.
   - Formaldehyde has the same shape, and its generated layout is the mirror image, with the one-Bond Atom on the right (`src/puzzle/puzzles.js:23`).

   The plan should say one of two things:
   - Phosgene's layout is the drawing's (rows 3, cols 2, `[["Cl",0,1],["Cl",1,0],["C",1,1],["O",2,1]]`), checked for one solution by `puzzles.test.js`.
   - Or the spec drawing follows the generated layout.

   Either way the test needs the drawing's convention from finding 2.

4. **note**: `docs/plans/04-halogens-and-sulfur/README.md:39`. "The screenshots that show the rules fail as they are, until (b) remakes them" is in (a), but at the (a) commit `panel.js` hasn't changed, so those screenshot tests still pass. They fail only inside (b), before they are remade.
   - It would be clearer in (b), with the files named: `page-start.png`, `page-solved.png`, `page-phone.png`, `panel-mystery.png` and `panel-solved.png`. All of them show `.rules`.
   - Step 4(b) remakes the same five again. That is fine, but worth knowing.

5. **note**: `docs/plans/04-halogens-and-sulfur/README.md:27` (Outcome 10 of the first review). The badge and glow check is tied to "when the screenshots are remade", but no screenshot shows S or I. Halothane has F, Cl and Br. Yet the orange badge (#ffb347) on a yellow S was the likeliest problem. Say how S and I are checked, e.g. a look at Carbon disulfide and Iodoethane in the browser, not in a screenshot.

6. **note**: `docs/plans/04-halogens-and-sulfur/README.md:34,39`. Judging the new colours "by hue and lightness" needs more than the helpers that move:
   - `hue`, `isGreen` and `isOrange` take `[r, g, b]`, but `ui/elements.js` holds hex strings.
   - Nothing measures lightness, which is what tells Br (dark red) from O (red) and F (light green) from Cl (green).

   Name the hex parser and the lightness helper in `colors.js`.

7. **note**: Step 2 changes the comment that `scripts/generate.js` prints, but the step only tests `draw.js`, and `tests/unit/puzzle/generate-script.test.js` doesn't check the comment. The two copies of the drawing code (`tests/helpers/draw.js:16`, `scripts/generate.js:29-31`) can drift apart unseen.

8. **note**: `src/puzzle/puzzles.js:1` says "The puzzles, easiest first". After 0018 that is only true within each batch. No step updates it; step 4(b) could.
