# Review of step 5 of plan 07: the Board draws hydrogens

Commits reviewed: d949c54 (tests, step 5(a)) and 69b87ca (implementation with remade screenshots, step 5(b)), range 6ef22b7..69b87ca. I read and ran each one in a `git worktree` of my own, with `npm install`. I have removed the worktree.

## What was checked

- **Checks.** At 69b87ca, `CHROMIUM_PATH=/usr/bin/chromium npm run check` exits 0. That covers 253 unit tests in 16 files, 33 e2e tests and 10 screenshot tests. The screenshot tests ran in podman.
- **The new tests fail at d949c54**, and the other 14 tests in `board.test.js` and `panel.test.js` pass:
  - Panel.04: the old rule text.
  - Board.01, the drawing: no `.hydrogen` elements.
  - Board.01, "can't be clicked": `checked` stays 0, because nothing is drawn.
  - Board.04: the names have no ", with … hydrogen(s)".
  - The Board.01 colour test, without H, passes before and after, as it should.
- **Tests against the spec.**
  - **The made-up Acetic acid is the spec's** (puzzle.md:70–80): O 1,2; CH₃ 2,1; C 2,2; OH 3,2.
  - **Board.04** (board.test.js:142) is the spec's example word for word (ui.md:45–53).
  - **Board.01, the drawing** (board.test.js:105). It checks four hydrogens, three on the CH₃ and one on the OH, on the diagonals in the order below-left, below-right, above-left. Each is a ball of r 8.5, smaller than half a C, white, with an "H", not `.body`, and with one `.fixed` line per hydrogen.
  - **Board.01, "can't be clicked"** (board.test.js:126). The hydrogens are outside every focusable or button element. Each ball's box misses every Dotted line's `.hit` rect. It runs over today's Puzzles too, so in step 7 it covers the real ones.
  - **Panel.04** is the spec's text exactly (ui.md:126).
  - **Board.01's colour list loses H**, as the spec (ui.md:32) and the plan say, and `LOOKS.H` stays.
- **Code against the spec.**
  - `board.js` draws `HYDROGENS.slice(0, a.h)`. Each hydrogen is a line plus a `g.hydrogen` with circle and text, inside the Atom's group and before `.body`.
    - The positions, the line ends (`H_AT - 3` = 25), the radius and the colours from `ELEMENTS.H` are the prototype's (`prototypes/implicit-hydrogens.html:215–223`).
    - The `style.css` rules are the prototype's (prototype lines 50–52).
  - **They don't glow or pulse.** The glow is `.atom.ok .body` and the pulse `.pulse .atom .body` (style.css:56, :60). Neither matches the hydrogens.
  - **They can't be clicked.** `.atom { pointer-events: none }`, and the Atom's group has `role="img"`, so their "H" isn't read separately.
  - **The geometry fits.** The hydrogen's edge lies 19.5–36.5 px out on each axis. That is inside PAD (46), outside a Dotted line's HIT half-width (11), and clear of the badge at (+17, −17) and of the C body (r 22).
  - **The name** gets ", with <h> hydrogen(s)" after the place, singular for 1.
  - A missing fourth item reads as 0 through `game.atoms[i].h` (step 1), so `slice(0, 0)` draws nothing.
- **Screenshots.**
  - The five remade ones are page-start, page-solved, page-phone, panel-mystery and panel-solved. I compared each with the one before.
  - Only the panel's rule 4 changed, and everything below it moved down by its extra lines. The Boards look the same, as no Puzzle has hydrogens yet.
- **Design.** Only `board.js`, `style.css` and `panel.js` changed, plus a comment in `elements.js`, as the plan names. No choice needs a new decision: the look is 0023's and the prototype's.
- **Commits.** Both follow Conventional Commits and carry no attribution.

## Findings

1. **should fix**: `src/ui/panel.js:10` (and the remade `docs/spec/screenshots/page-start.png`, `page-solved.png`, `panel-mystery.png`, `panel-solved.png`, `page-phone.png`). The new rule text wraps between an Element's symbol and its number.
   - On a computer and in the panel screenshots it breaks as "F, Cl, Br and I" / "1. Its small hydrogens…". The line then starts with "1.", which reads like a list number inside item 4 of a numbered list.
   - On the phone it breaks as "bonds: C" / "4, N 3, …".
   - The old text didn't split a pair at these widths. Decision 0013 asks that each remade screenshot be looked at, and this is the kind of thing that look should catch.
   - A non-breaking space between each symbol and its number would keep the pairs together. Rewording would also work, for example putting the counts first. The spec quotes the text literally (ui.md:126), so the fix touches the spec or the test's comparison as well.
2. **note**: `docs/spec/screenshots/page-start.png`. The page at 1280×800 is now 814 px tall (it was 800), so it scrolls a little on a computer. `page-solved.png` went from 900 to 942.
   - No rule forbids scrolling up and down; Layout.01 only forbids sideways.
   - Step 7's 15 Puzzles take one row of list buttons less, which should give back about 41 px.
   - Worth checking in step 7 that a 6 by 5 Board and the panel still fit as decision 0019 expects.
3. **note**: no screenshot or e2e test shows a hydrogen until step 7. The look is unit-tested only for its shape: the line's length, how it sits next to the badge and the glow, and the size on a phone.
   - Step 7(b) plans to look at that, with Glucose and Citric acid on a phone.
   - Until then, the only evidence is that the code matches the prototype's numbers.
4. **note**: `tests/unit/ui/board.test.js:120`. "Doesn't glow or pulse" is tested as "the ball isn't `.body`". That is correct only as long as the glow and pulse rules in `style.css:56,60` stay scoped to `.body`.
   - happy-dom can't compute the styles, so this is a reasonable proxy.
   - The code comment at `src/ui/board.js:64` records the link.

No must-fix findings.
