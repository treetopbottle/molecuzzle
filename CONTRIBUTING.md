# Contributing

How we work, for people and coding agents. The steps for each task are in [`docs/workflow/`](docs/workflow/):

- [Start a project](docs/workflow/start-a-project.md), once.
- [Write a plan](docs/workflow/write-a-plan.md) for a slice of work.
- [Implement a step](docs/workflow/implement-a-step.md) of the plan, one at a time.
- [Finish a plan](docs/workflow/finish-a-plan.md) when its steps are done.
- [Review](docs/workflow/review.md) each of the above.

## Working agreement

- **Tests first, with a checkpoint.** Write a step's tests, show them, and wait for an OK before implementing. Tests and implementation are separate commits.
- **If the design doesn't hold up, stop.** Fix the spec or the decisions and adjust the plan before going on.
- **Fix forward.** Once a review of some commits has started, don't rewrite them: a fix is a new commit.

## Docs

- The spec says what the software does now: no history, no reasons.
- Decisions say why. Append-only.

## Style

- Be brief. Write what is needed, and no more.
