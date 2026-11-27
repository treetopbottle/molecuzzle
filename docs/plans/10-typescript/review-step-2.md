# Review of step 2 of plan 10

Commits reviewed: da3c59a (refactor: Storage's interface is storage/api.ts, and the Glue imports Storage only from it). The step has no rule ids, so there is no tests commit to check in a worktree.

Checks at da3c59a, in a worktree: `npx tsc -p .` exits 0; `npm run build` writes `dist/index.html`, 49.9 kB; `npm test` passes 408; `npx playwright test` passes 40.

The wrong JSDoc type, repeated in the worktree: `createProgressStore`'s `@returns {Progress}` for `{Store}` fails tsc at `src/browser.ts:15`, so the `@import` resolves; `@returns {Stor}` passes, as `any`; `@param {Progress | undefined} storage` fails at `browser.ts:15`; `markSolved`'s `@returns {Store}` fails at `src/app.ts:62`; `markSolved`'s `@param {number} id` passes (finding 1); an `@import` from `./apix.ts`, which doesn't exist, passes.

## Findings

1. **note**, `src/app.ts:37-41` (`withEntry`): tsc still doesn't check `game.saved()` against `BoardEntry`, and not because of step 1's placeholder `Progress`: `puzzles` is `any[]`, so `id` is `any`, and a computed key of type `any` leaves `[id]: saved` out of the object's type. For the same reason `markSolved`'s `id` isn't checked (`:62`). Once step 3 types `puzzles` as `Puzzle[]`, the check runs, and fails unless `saved()` returns the Puzzle's `Saved`, with tuples. Until then only `BoardEntry` into `createGame`'s `saved` (`:53`) is checked.
2. **note**, `src/puzzle/game.js:15-16`: the temporary JSDoc on `createGame` is needed, as without it tsc fails at `src/app.ts:53`. `@param {any} puzzle` is needed too, which the commit message doesn't say: the parameter is a destructuring pattern, so tsc matches the tags by position. It is in the Puzzle's own terms, which fits 0011 and 0028, but it changes the Puzzle's signature as tsc sees it, outside the interface step 2 names; worth a line in the Outcome.
3. **note**, `src/storage/api.ts:17`: `current` is `string | null`, but the schema says a string that may be missing. The type matches what `read()` gives, where null means no open Puzzle, and nothing stores a null, as `open` sets `current` before the first `update`. The doc comment at `:15` could say what null means.
4. **note**, `src/storage/progress.js:2`: an `@import` that doesn't resolve gives `any` without an error, a wrong path as much as a misspelled name; the Design states this cost. Step 5's `imports.test.js` could also check that each named file exists, which would catch a wrong path.

Checked with no finding: the Glue imports Storage only from `storage/api.ts`; `api.ts` holds only types and the two values the Glue uses, without `STORAGE_KEY`; `Bond`, `BoardEntry`, `Progress`, `Store` and `KeyValueStorage` match `progress.js` and the schemas; `Storage` fits `KeyValueStorage`; step 1's placeholder is gone; the commit message.

## Outcome

1. Kept, for step 3: `createGame` returns a `Game`, whose `saved()` gives a `Saved`, and with `puzzles` a `Puzzle[]` tsc checks `Saved` into `BoardEntry` and back; a probe of step 3, with `Saved.revealed` a string, fails at both.
2. Kept, recorded here: the JSDoc was the least that let the Glue take Storage's `BoardEntry`; step 3 replaces both tags with the Puzzle's `Puzzle` and `Partial<Saved>`, in order.
3. Fixed in 0dc3fe8.
4. Kept for step 5: `imports.test.js` also checks that each file it names exists.
