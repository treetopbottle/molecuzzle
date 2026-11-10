# Review

Review a plan, a step's commits, or the decisions, as someone who didn't write them. Report findings; don't fix anything. Review commits, never uncommitted changes.

## Checks

- **Plan:** it covers a backlog item; its rule ids exist in the spec and don't conflict; the design fits the code and the decisions; every rule id has a step; each step is small enough to review, and split into tests and implementation unless it has no rule ids.
- **Step:** the [checks](implement-a-step.md#checks) pass; at the tests commit, checked out in a separate `git worktree`, the new tests fail; the code does what the spec says, and no more; it follows the plan's Design, and changes only the interfaces the step names; a choice that isn't obvious has a decision.
- **Decisions:** each keeps the why, the cost and the alternatives, and says why, not what (the what is the spec's); each still matches the code and the spec; a choice that isn't obvious isn't missing one.

## Report

A file in the plan's folder: `review-plan.md`, `review-step-<N>.md` or `review-decisions.md`, with `-2`, `-3` for later rounds. A review with no plan goes in its own `docs/plans/NN-review-<slug>/README.md`. It has:

- A title, and the commits reviewed.
- **Findings**, most severe first, each tagged **must fix**, **should fix** or **note**, with `file:line` and what is wrong. "No findings" is fine.

A reviewer that can't write files returns the report; whoever ran the review writes it and commits it before any fix. Findings aren't edited after that. Whoever fixes adds an **Outcome**: one line per finding, fixed (with the commit) or kept (and why). A must-fix is never just kept. If code changed, review again.
