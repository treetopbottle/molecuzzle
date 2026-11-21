# Review of step 1 of plan 04: The new Elements

Commits reviewed: d87b6bd (step 1(a), tests) and 273a692 (step 1(b), implementation and remade screenshots), range fe04aec..273a692. I read and ran them in separate worktrees at each commit, which have been removed.

## What was checked

- **Checks.** At 273a692, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0:
  - unit tests;
  - e2e: 32 passed, 1 skipped;
  - screenshots in Podman: 9 passed.
- **Rule ids each have a test:**
  - Valence.01: `tests/unit/puzzle/game.test.js:275`.
  - Board.04: `tests/unit/ui/board.test.js:26`.
  - Board.01: `tests/unit/ui/board.test.js:33`.
  - Panel.04: `tests/unit/ui/panel.test.js:73`.
- **Expected results match the spec:**
  - Valence.01: the valences match puzzle.md's table, H, F, Cl, Br, I 1; O, S 2; N 3; C 4.
  - Board.04: the nine names match ui.md.
  - Board.01: the colours checked match ui.md's list.
  - Panel.04: the rule text is ui.md's, word for word.
- **Tests fail at d87b6bd for the expected reason.** `npm test` gives 4 failures, the new tests only:
  - the valences are `{ H, C, N, O }` only;
  - the names have 4 keys, not 9;
  - the colour test reads `LOOKS["S"]`, which is undefined (TypeError);
  - the rule is the old text.
- **Code against the spec and the Design.** The change is the least code that passes:
  - five keys in `src/puzzle/elements.js`;
  - five looks in `src/ui/elements.js`, with r 22 as for C, N and O, dark text on yellow and the greens, white text on dark red and violet;
  - one string in `src/ui/panel.js`.

  The helpers moved to `tests/helpers/colors.js` with `rgb` and `lightness`, and `tests/e2e/helpers.js` re-exports `isGreen` and `isOrange`. No other interface changed. No choice here needs a decision.
- **Screenshots.** In all five remade screenshots, `page-start`, `page-solved`, `page-phone`, `panel-mystery` and `panel-solved`, only the valence rule changes. It now wraps over three lines, and nothing else moves or gets cut off. None of the five shows a new Element.
- **Colours** (WCAG contrast of each symbol's text on its ball, and HSL hue and lightness):
  - S `#f2d22e`: contrast 9.0, hue 50, lightness 0.57.
  - F `#a8e07a`: contrast 9.8, hue 93, lightness 0.68.
  - Cl `#3cb44b`: contrast 6.1, hue 128, lightness 0.47.
  - Br `#9e2a2b`: contrast 7.5, hue 360, lightness 0.39.
  - I `#7d3fa8`: contrast 6.7, hue 275, lightness 0.45.

  All five are above AA (4.5), and above the existing N (4.4) and O (4.0). The pairs that could be mixed up are told apart:
  - F from Cl by lightness (difference 0.21) and hue (35°);
  - Br from O by lightness (difference 0.18);
  - I from N by hue (51°).

## Findings

1. **note**: `tests/unit/ui/board.test.js:42-44`. The range for S is loose at both ends.
   - The hue range 40–65 lets in amber. Hue 40 is orange, and the orange badge (`--warn` #ffb347) is hue 35. A hue range from about 45 would keep "yellow" away from the badge.
   - `lightness > 0.5` in HSL turns down pure yellow, since `#ffff00` has lightness exactly 0.5.
   - The present S (hue 50, lightness 0.57) passes, but it sits on the orange side of yellow, right at `isOrange`'s upper bound of 50.

   Also, F (hue 92.9) is 3° inside the green range's lower edge of 90. That is right for a light, slightly yellow green, but there is little margin.

2. **note**: `src/ui/elements.js:8-9` and Board.02. The ball colours of S and F are close to the badge and to the glow:
   - S against the badge: contrast 1.19.
   - S against the glow (`--accent` #3ce0b4): contrast 1.12.
   - F against the badge: contrast 1.15.
   - F against the glow: contrast 1.09.

   Only the badge's dark stroke (#3a2600), the balls' darker strokes and the dark stage keep them apart. No screenshot in this step shows a new colour, so the Design's check of the badge and glow can't be made at step 1. It falls to step 4(b): the Halothane screenshot for F, Cl and Br, and the browser for S and I. Step 4(b) should also check that "Cl" and "Br" fit in the ball, since that wasn't seen either.

3. **note**: `src/ui/panel.js:10`, the text from `docs/spec/ui.md:126`. In the screenshots' sans-serif font, "Cl" reads like "CI", and "and I 1;" reads like "l 1". This is how the spec writes the rule, so it is not a defect of the step. A different order or separator, e.g. "1: H, F, Cl, Br, I", would read better if this ever bothers anyone.

4. **note**: `tests/helpers/colors.js:20-23`. `inHue` is now exported and wraps past 360 (for O and Br at hue 345–15). The Design names `rgb`, `lightness`, `hue`, `isGreen` and `isOrange`, not this. It is a test helper only, and `isGreen` and `isOrange` behave as before. `tests/e2e/helpers.js:63` doesn't re-export `hue`, which the Design's "re-exports them" implies, but no e2e test uses it.
