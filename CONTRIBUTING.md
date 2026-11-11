# Contributing

How we work, for people and coding agents. The details of each task are in [`docs/workflow/`](docs/workflow/):

- [Start a project](docs/workflow/start-a-project.md), fill in any placeholders
- [Write a plan](docs/workflow/write-a-plan.md) for a feature or slice of work
- [Implement a step](docs/workflow/implement-a-step.md) of the plan, one at a time
- [Finish a plan](docs/workflow/finish-a-plan.md) when all the steps are done
- [Review](docs/workflow/review.md) any task above or other work

## Working agreement

- **Spec first.** Write the spec first, review the spec, and then implement it
- **Approval tests.** Use approval tests (also known as snapshot tests) to easily translate the spec into executable tests
- **Testing the spec.** The whole spec should be translated into automated tests
- **Small steps.** Work in small increments that are easy to review
- **If the design doesn't hold up, stop.** Fix the spec or the decisions and adjust the plan before continuing
- **Fix forward.** Once a review of one or multiple commits has started, do not rewrite the commits: a fix is a new commit

## Docs

- The specification says what the software does now, does not include history but may include reasons for design decisions
- Decisions record choices that were made, their alternatives, and the cost
- Be brief: write what is needed, and no more
