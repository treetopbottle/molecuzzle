# Review of step 3 of plan 08

Commits reviewed: eaecf21 (tests) and e3f5ab9 (implementation). At eaecf21, 3 unit and 5 end-to-end tests fail for the expected reason; at e3f5ab9 `npm test` (327), the end-to-end tests (36) and the screenshot tests (10) pass. The code does what Board.05 and Page.01 say, no more; the narrative matches `narrative.spec.js`.

## Findings

1. **note:** the plan says to remake the screenshots with Citric acid on a phone, but there is no such screenshot; Citric acid is covered only by the bounding-box test of `phone.spec.js`, and the orange `warn` state is in no screenshot.
2. **note:** `src/ui/ui.js`: `aria-label` on a plain `span` has no role, and some screen readers ignore it; consider `role="img"`.

## Outcome

1. Kept: the plan's wording asked for more screenshots than the spec has; the fit is tested, and the orange state in unit and end-to-end tests.
2. Fixed: each of the three spans has `role="img"`, so its label is read.
