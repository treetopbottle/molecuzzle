# Review of step 4 of plan 08

Commits reviewed: 5e2f9b4 (tests) and d926c8e (implementation). At 5e2f9b4 the Panel.04 test fails for the expected reason; the two rule texts match `ui.md` word for word, and the step changes nothing else.

## Findings

1. **note:** the Panel.04 test compares each rule's own text, so it needed no change when the key went into the rule in step 5.
2. **note:** the plan lists the screenshots under (a); they are remade in the implementation commit, as in steps 2 and 3.
3. **note:** the screenshots of this commit are intermediate, without the key, and are remade in step 5.

## Outcome

1. Kept: as intended.
2. Kept: a screenshot test can't fail before the picture is remade.
3. Kept: harmless.
