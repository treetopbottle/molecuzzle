# Review of step 5 of plan 08

Commits reviewed: 991332a (tests), c210306 (docs) and 48b9f01 (implementation). At 991332a 3 unit tests and the phone test fail for the expected reason; at 48b9f01 `npm test` (330), the end-to-end tests (37) and the screenshot tests (10) pass. The code matches Panel.05 and decision 0011: only `browser.js` reads `puzzle/elements.js`. The key is clear on a phone, in two rows of four.

## Findings

1. **should fix:** `docs/decisions.md:166`: decision 0011's Cost still says the valences are written in `puzzle/elements.js` and in the panel.
2. **should fix:** `src/ui/panel.js:76`: the key is appended to `.rules li` number 3, tied to the position of the rule.
3. **note:** the key's balls have no highlight, unlike the Board's.
4. **note:** `.key .sym` is 11px, and the key's `margin-left: -20px` relies on the padding of `.rules`.
5. **note:** the tests check the number of sticks, not their angles.
6. **note:** `phone.spec.js` checks only the last figure and `scrollWidth`.
7. **note:** the docs commit changed the spec before the code.
8. **note:** `architecture.md` is already right.

## Outcome

1. Fixed: the Cost says the key gets the valences from the Glue, and only the rule's text is a copy.
2. Fixed: the rule is found by its text.
3. Kept: the spec asks for a ball as on the Board, a flat ball is close enough at this size.
4. Kept: legible in the screenshots.
5. Kept: the spec asks for the count.
6. Kept: enough for no sideways scroll.
7. Kept: allowed.
8. Kept.
