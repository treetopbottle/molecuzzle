# Implement a step

One step of an active plan at a time. Read the step, the plan's Design and the spec rules it names. If something is unclear, ask first. A step with no rule ids skips (a).

A bug fix or small task needs no plan: do it as one step, with the same checkpoints and review.

## (a) Tests

1. Write one test per behavior, with the expected result written by hand from the spec.
2. Run the tests. The new ones should fail, or not compile, for the reason the step expects.
3. **Checkpoint.** Show the tests, each rule id matched to its test. Wait for an OK, then commit.

## (b) Implementation

1. Write the least code that makes the tests pass.
2. Run the [checks](#checks).
3. **Checkpoint.** Show the diff. Wait for an OK, then commit.

## Review

[Review](review.md) the step's commits. Deal with the findings in new commits. Then mark the step `[DONE]` in the plan, linking the review.

## Checks

- The README's Development commands run clean.
- Each rule id the step names has a test, or the check its rule names.
- Each expected result matches the spec's example for its rule.
