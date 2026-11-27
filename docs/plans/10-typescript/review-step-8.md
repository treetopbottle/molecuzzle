# Review of step 8 of plan 10

Commits reviewed: 50a821f (the renames, with `// @ts-nocheck`) and 1dd45f5 (the typing; what `read()` gets from storage is `unknown`, and its checks narrow it). The step has no rule ids, so there is no tests commit to check failing.

Checks, each in a worktree: at 1dd45f5 and at 50a821f, `npx tsc -p .` passes, `npm run build` writes 49.9 kB, `npm test` passes 413 in 17 files, and Playwright passes 40.

Behaviour: the old `progress.js` and the new `progress.ts` were run on the same 56 stored values: top-level `null`, numbers, strings, booleans, `[]` and an array of a Progress; bad JSON; `puzzles` as an array and with bad states; `current` as a number, `null` or an array; `boards` as an array, a string, `null` and array entries; Bonds with string, boolean, `null`, `2.5`, `-0` and `1e300` members, and of 2 or 4 members; undo at 100 and 101; extra fields; `__proto__` keys. No difference in the JSON, the key order or the prototype of `puzzles`. `!isObject(data)` also rejects arrays, which the old code turned into the empty Progress anyway; `isIndex`'s `typeof` changes nothing at runtime.

Type-check probes: removing the top-level `isObject(data)`, `state === "solved"`, `typeof data.current === "string"` or the filter's guard each fails tsc; dropping `typeof e.revealed === "boolean"` from `isEntry`, or `isBoard` or `isIndex` returning a plain `boolean`, passes. So the `unknown` drives the checks, but tsc trusts each guard's claim.

## Findings

1. **note**, `docs/plans/10-typescript/README.md:18`, `:42`: the plan still names `progress.js` where it describes the code as it is: Scope's "the undo limit in `progress.js` and the schema", and the Design's "`STORAGE_KEY` stays in `progress.js` for the tests". As step 7's finding 4. Step 2's line rightly keeps the old name; nothing else outside the past plans names `progress.js` or `progress.test.js`.
2. **note**, `src/storage/progress.ts:7`, `:8`: the guards are sound only when they return true; a type predicate narrows on false too (`isIndex(-1)` would say "not a number"). Every call passes `unknown` or `any`, so a false result narrows nothing. In the true direction no guard claims more than it checks.

Checked with no finding: both renames recorded (99%), with `git log --follow` past them; the move commit's edits; no casts, `!`, `@ts-` lines or explicit `any`; `createProgressStore` returns a checked `Store`, and `markSolved` is typed; the test's diff adds only types; the commit messages.

## Outcome

1. Fixed with this outcome: Scope and the Design name `progress.ts`.
2. Kept: every guard is called on `unknown` or `any`, where a false result narrows nothing.
