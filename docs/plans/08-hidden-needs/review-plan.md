# Review of plan 08

Commits reviewed: d40096d (spec, decision 0025, README entity) and 262c1b8 (plan 08 and the plans table). The reviewer ran no commands. The arithmetic of the Acetic acid, Acetonitrile and Glycine examples is right.

## Findings

1. **must fix:** step 1 can't keep `npm run check` green alone (README:40-45, :54). `status()` loses `open`, but `messages.js:9` reads it; `full` goes, but `bonding.spec.js` and `ui.test.js:98` test it; `app.test.js:66` and `game.test.js:281-283`, :381 use `open: n`. Move the minimum of `messages.js` and those tests into step 1.
2. **must fix:** step 2's narrative test needs the counts line of step 3 (README:43-44). Move `narrative.spec.js` to step 3.
3. **should fix:** how `elements` reaches `renderPanel` is undefined (README:34): the view is built in `app.js`, and `browser.js` only passes handlers. Pick `startApp` or `createUi` and name it; say the valences are now read through the glue. `counts` should come in the view, as `status` does.
4. **should fix:** stale spec text: Page.01 Parts (`ui.md:11`, no counts line), Board.01 "don't glow" (`ui.md:32`), and the tests `board.test.js:90` and `screenshots.spec.js:72-73`.
5. **should fix:** "badge" is also the Solved/Unsolved pill (`#badge`, `.puzzle-nav .badge`); the plan must say only the Atom's badge goes (`style.css:56-59`, `board.js`).
6. **should fix:** step 5 doesn't match the repo: `architecture.md` doesn't name the badge or `full`; the backlog entry and the table row exist already.
7. **should fix:** Bond.04's example says "twice more" ambiguously; Bond.05 says "the only reason" but Bond.10 also blocks changes.
8. **should fix:** decision 0001's status should read `Partly superseded by 0025`.
9. **note:** Board.05 is ambiguous on what is orange, and on the " · " separators.
10. **note:** steps 3 and 4 are large; split Board.02/04 from Board.05, and Panel.04 from Panel.05.
11. **note:** `check.spec.js:12` and `puzzle.spec.js:24-28` are not named; they fall under "each step also changes the end-to-end tests".

## Outcome

1. Fixed: step 1 now holds the texts, with the tests named; the narrative's old status test goes with it.
2. Fixed: the narrative test is in step 3, with the counts line.
3. Fixed: `createUi` gets `elements` from `browser.js`; `counts` is in the view; the Design says the valences are written once.
4. Fixed: Page.01 and Board.01 in `ui.md`, and the tests are named in step 2.
5. Fixed: the Design says only the Atom's rules go; `#badge` stays.
6. Fixed: step 6 is only the status, and `architecture.md` if it needs it.
7. Fixed: the Bond.04 example, and "the only reason given" in Bond.05.
8. Fixed: decision 0001 says `Partly superseded by 0025`.
9. Fixed: the whole first part is orange; the separators are text.
10. Fixed: steps 2 and 3 split Board.02/04 from Board.05, and steps 4 and 5 Panel.04 from Panel.05.
11. Kept: those tests fall under the closing line of the steps, and step 1 and 2 name them now.
