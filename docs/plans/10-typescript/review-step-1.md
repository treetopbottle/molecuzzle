# Review of step 1 of plan 10

Commits reviewed: d4c1975 (build: TypeScript, `npm run typecheck` in `npm run check`), 975ebcc (move `app.js` and `browser.js` to `.ts`, with `// @ts-nocheck`) and 3eee185 (the Glue is typed, `AppDeps` by what `browser.ts` passes). The step has no rule ids, so there is no tests commit to check in a worktree.

Checks at 3eee185, on Node 26.13.1: `npm run typecheck` exits 0; `npm run build` writes `dist/index.html`, 49.9 kB; `npm test` passes 408; `npm run test:e2e` passes 40; `npm run test:screenshots` passes 10. At d4c1975 and 975ebcc, in a worktree: `tsc -p .` exits 0, the build works and `npm test` passes 408.

## Findings

1. **note**, `src/app.ts:14`: the placeholder's Board entry type is wrong. `boards` is `Record<string, NonNullable<Parameters<typeof createGame>[1]>>`; `createGame` (`src/puzzle/game.js:16`) has no JSDoc, so tsc infers `{ revealed?: boolean; undo?: never[] }` from its destructuring, with no `bonds` and `undo` as `never[]`. `withEntry` (`:43-49`) puts `game.saved()` into `boards` without tsc comparing the two. Steps 2 and 3 replace it; step 2 should not carry this interface over.
2. **note**, `src/app.ts:10-15`, `:21`: `store` is not typed by what `browser.ts` passes, as step 1 and the commit message say, but by a `Progress` written by hand in the Glue. Reasonable: `ReturnType<typeof createProgressStore>` infers `load(): { puzzles: {}; current: any }` and `update(change: any): any`, which strict code can't use. The choice isn't recorded; worth a word in the Outcome.
3. **note**, `src/app.ts:19`, `:22`: the placeholder checks little: `puzzles` is `any[]`, `open` and `say` take `any`, `markSolved` is `(any, any) => any`. tsc checks the handlers' signatures, that the game members the Glue uses exist, that the key's symbols are keys of the Puzzle's `ELEMENTS`, and `Storage | undefined`. Acceptable for step 1; `AppDeps` already has the Design's shape.
4. **note**, 975ebcc: the move commit holds more than `git mv`, the imports and `// @ts-nocheck`: the docs, `scripts/build.js`, `index.html` and a comment inside the moved `src/app.ts:2`. git still records the moves as renames (96% and 93%), and `git log --follow` goes past them. For later steps: keep text edits inside a moved file out of its move commit.
5. **note**, `docs/decisions.md:171`: 0011's Alternative about the old flat `src/app.js` was reworded, not given the new path, as `app.ts` would be false there. Right; no action.

Checked with no finding: `tsconfig.json` has the Design's options; `package.json` and the README's Development list; no `app.js` or `browser.js` left outside the past plans; the build's entry and placeholder; `app.test.js`'s import; no `// @ts-nocheck` left after 3eee185; the commit messages.
