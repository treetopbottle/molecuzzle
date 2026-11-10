# Write a plan

1. Take a slice from the backlog in `docs/plans/README.md`. Read the spec rules it covers and the code it touches. If a rule is missing or unclear, fix the spec first, or record the question as an `Undecided` decision.
2. Write `docs/plans/NN-<slug>/README.md`:
   - A title and `Status: Draft`.
   - **Scope:** the rule ids it covers, and what it leaves out.
   - **Design:** what code changes, and the interfaces it changes. A choice that isn't obvious goes into `docs/decisions.md`.
   - **Steps**, in dependency order, each naming its rule ids and split into (a) tests and (b) implementation. A step with no rule ids (setup, refactoring, docs) has no split.
3. Add it to the table in `docs/plans/README.md`; remove it from the backlog. Commit.
4. [Review](review.md) the plan. Deal with the findings in new commits.
5. **Checkpoint.** Show the plan and the review. After an OK, set the status to `Active`, in the plan and in the table, and commit.
