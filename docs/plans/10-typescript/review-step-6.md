# Review of step 6 of plan 10

Commits reviewed: 7e9346c (`@types/node` 22, `tsconfig.json` includes `tests/` and the configs, `skipLibCheck`), 9cfb3da (the renames, with `// @ts-nocheck`), ead43ce (the typing, with `box()` and `viewport()`) and ce1b73e (the plan's Design names `skipLibCheck`). The step has no rule ids, so there is no tests commit to check failing.

Checks, each in a worktree: at ce1b73e, `npx tsc -p .` passes, `npm run build` writes 49.9 kB, `npm test` passes 412 in 17 files, Playwright passes 40 and the screenshots 10 (with `node_modules` copied in, as the container can't follow a link); at 7e9346c and 9cfb3da the same, without the screenshots.

Probes at ce1b73e: `openPuzzle(page, "2")`, `build(page, { id: 1 })` and `const x: number = PUZZLES[0].name` in a spec each fail tsc, so the specs are checked against the helpers' and `api.ts`'s types. Without `skipLibCheck`, tsc reports one error, `node_modules/happy-dom/lib/window/BrowserWindow.d.ts(692,67)`: `node:stream/web` has no `UnderlyingDefaultSource` in `@types/node` 22.20.7.

## Findings

1. **should fix**, `tests/e2e/helpers.ts:79`: `colors` falls back to `[]` when a colour has no digits, which weakens `tests/e2e/check.spec.ts:56`: `isGreen([])` and `isOrange([])` are false, so `.some(c => isGreen(c) || isOrange(c))).toBe(false)` would pass on a colour it couldn't read, where `null.slice` threw before. The `every(...)` assertions at 22, 59 and 64 still fail. Against the commit's own rule for `box()` and `viewport()`: `colors` should throw.
2. **should fix**, `tsconfig.json:2-15`: no `"types": ["node"]`, so `@types/node` is loaded only because dependencies reference it (`vite/dist/node/index.d.ts`, `undici-types`); a tsconfig with only `tests/e2e/build.ts` fails with "Cannot find name 'process'". Naming `types` makes the choice explicit.
3. **note**, `docs/decisions.md:358` (0029's Cost): nothing about Node's types being 22's, or `skipLibCheck`, which pinning 22 forces (npm had resolved `@types/node` 26.6.6 for happy-dom): tsc no longer checks any dependency's declaration files. The why is only in the plan. It should also say `@types/node` follows the README's minimum, so with step 9's Node it moves too.
4. **note**, `tests/e2e/helpers.ts:73-74`: `storedProgress` returns `Promise<Progress>`, a claim through `JSON.parse`'s `any`, and it is `null` when nothing is stored. No assertion is weakened, but `Promise<Progress | null>` would be honest.
5. **note**, 9cfb3da `vitest.config.ts:3`: the move commit adds `"tests/unit/**/*.test.ts"` to `include`, a new pattern, not one naming a moved file. Harmless, as the rename is still recorded (65%), but strictly it belongs in another commit.

Checked with no finding: all 14 renames recorded as renames (65% to 99%), with `git log --follow` past them; the move commit's edits inside moved files; no `// @ts-nocheck` left; no old names outside the past plans; the unit tests import `schemas.ts`; Playwright's patterns and `globalSetup`, Vitest's include; no casts; `start`'s `unknown`; `box()`, `viewport()` and `clickBond`; `schemas.ts`; 40 e2e and 412 unit tests before and after; `@types/node` `^22.20.7`; the plan's line; the commit messages.

## Outcome

1. Fixed in 5a9999e: `colors` throws "no colour in …".
2. Fixed in 5a9999e: `"types": ["node"]`.
3. Fixed in 5a9999e: 0029's Cost says Node's types are the README's oldest Node's, and that this needs `skipLibCheck`; step 9 revisits both with the minimum.
4. Fixed in 5a9999e: `Promise<Progress | null>`, and `progress.spec.ts` reads `stored?.boards`.
5. Kept: the commits are reviewed, and the rename held.
