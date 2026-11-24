# Review of step 3 of plan 09

Commits reviewed: 98fc809 (spec and tests) and fd8902c (implementation and five screenshots). At 98fc809, in a worktree, the 2 new unit tests fail for the reasons the step expects (`difficulty` undefined; the element after the nav is `.mystery`); at fd8902c all 408 pass. The code does what Page.01 and Panel.01 say and no more, and fits decision 0011; the JSDoc, comments and `architecture.md` are as the Design asks. The five screenshots show "Difficulty <d>" right under the nav with the right values; on the phone the actions end at about y 738 of 844.

## Findings

1. **note**, `tests/e2e/phone.spec.js:23-27`: the new Page.01 phone test is a guard that passes before the change too; acceptable, as the ARIA snapshots and the panel test check the new order. Its title ends "under the mystery molecule's title", which it doesn't check: drop the clause or add the check.
2. **note**, `tests/unit/ui/ui.test.js:21-24`: its view helper has no `difficulty`, so its panels show "Difficulty undefined"; it no longer matches the view's JSDoc in `src/ui/ui.js:52-55`.
3. **note**, `src/ui/panel.js:2`: the rewrapped top comment's second line is 90 characters, longer than those around it.
4. **note**, `src/app.js:57`: `difficulty(puzzle)` runs on every render, though it changes only when another Puzzle opens; cheap, mention only if `update()` is touched again.
5. **note**, `src/ui/style.css:24`: the new order rule selects by id where those around it use classes; it works, and `#difficulty` is the plan's name.

## Outcome

1. Fixed (460939c): the title ends at "within the screen"; the guard stays, as the plan asks.
2. Fixed (460939c): the helper's view has the open Puzzle's difficulty, from `difficulty.js`.
3. Fixed (460939c): the comment is rewrapped.
4. Kept: cheap, and the view is rebuilt as a whole on each render, as `counts` is.
5. Kept: `#difficulty` is the element's name in the plan, and an id is as clear as a class here.
