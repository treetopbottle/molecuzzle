# Plans

One folder per slice of work, `NN-<slug>/`: the plan is its `README.md`, next to its reviews. Finished plans stay as history.

The first version of the game was built before the GAAD template was in place, without a plan; the [spec](../spec/README.md) and [decisions](../decisions.md) describe it as it is.

| Plan | Status |
|---|---|

## Backlog

- Setup: test tooling and helpers that turn the spec's rules into tests, settling [decision 0012](../decisions.md#0012); then tests for the existing rules.
- Accessibility: bonding and moving Atoms with the keyboard, and names for screen readers.
- More Levels, with targets that fit the valence model ([decision 0002](../decisions.md#0002)).

Small tasks, done without a plan:

- Remove the unused `body` field kept per Atom in `atomEls` in `index.html`.
- Order the Collection by Atom count: the current sort counts non-hydrogen Atoms twice.
