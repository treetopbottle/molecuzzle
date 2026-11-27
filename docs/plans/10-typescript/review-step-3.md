# Review of step 3 of plan 10

Commits reviewed: ee0500e (refactor: the Puzzle's interface is puzzle/api.ts, and the Glue imports the Puzzle only from it). The step has no rule ids, so there is no tests commit to check in a worktree.

Checks at ee0500e, in a worktree: `npx tsc -p .` exits 0; `npm run build` writes `dist/index.html`, 49.9 kB; `npm test` passes 408; `npx playwright test` passes 40.

Probes in the worktree, each reverted before the next:

- Saved and BoardEntry: `Saved.revealed` or `BoardEntry.revealed` as `string` fails at `src/app.ts:40` (Saved into BoardEntry) and `:52` (BoardEntry into `Partial<Saved>`); `Saved.bonds` as `number[][]` fails at `:40`; `Bond`'s order as `1 | 2` fails at `:40`, as `1 | 2 | 3 | 4` at `:52`; `Saved` without `undo`, or `BoardEntry` with an extra `hints`, fails at `:40`. `Saved` with an extra `hints` passes (finding 1).
- The `@import`s: in `game.js`, `@returns {Puzzle}`, `@param {Saved["undo"]} [saved]` and `@param {Puzzle["atoms"]} puzzle` each fail at `src/browser.ts:13`; in `difficulty.js`, `@param {Puzzle["atoms"]}` fails at `src/app.ts:63`; in `elements.js`, `Record<Exclude<ElementSymbol, "C">, …>` fails at `src/browser.ts:9`; in `puzzles.js`, `@type {Puzzle["atoms"]}` fails at `src/browser.ts:13`, and passes, as `any`, with the `@import` from `./apix.ts`. So all four resolve.
- `ui.js`'s `onChange` with `dir` back to `number` fails at `src/app.ts:24`.
- With `// @ts-check` added: `puzzles.js`, `elements.js` and `difficulty.js` give no errors; `game.js` gives implicit `any`s and four at `src/puzzle/game.js:153` (finding 4).

## Findings

1. **should fix**, `src/app.ts:52` with `src/puzzle/api.ts:90`: tsc doesn't check that Saved and BoardEntry fit each other both ways, as the Design's `app.ts` says. BoardEntry only has to fit `Partial<Saved>`, so a field Saved has and BoardEntry lacks goes unseen, and Saved into BoardEntry allows an extra field: `Saved` with `hints: number` passes tsc, and the game would hand Storage a field it doesn't keep. Fix without a cast: give the entry the type `Saved` before passing it on, e.g. `const left: Saved | undefined = progress.boards?.[puzzles[i].id]`; `createGame`'s `saved` can stay `Partial<Saved>`.
2. **note**, `src/ui/ui.js:23`: `onChange`'s `dir` as `1 | -1`, not `number`, is outside the interfaces step 3 names, but right and the least the step needed: it matches `board.js:26` and what it passes, and the alternative would make `Game.change` looser than its doc. Step 4's `Handlers` should keep `1 | -1`.
3. **note**, `src/puzzle/api.ts:31`: `Atom.el` is `ElementSymbol`, H included, but a game's Atoms come from `Puzzle.atoms`, which exclude H; exact would be `Exclude<ElementSymbol, "H">`. Loose, not wrong.
4. **note**, `src/puzzle/game.js:153`: with `@ts-check`, the returned `status`, `change`, `board` and `saved` don't fit `Game`, by literal widening only (`kind: string`, `reason: string`, `any[][]`). Expected with `checkJs` off; step 9 will need `as const` or annotated returns.
5. **note**, `src/puzzle/game.js:21-22`: "a missing count is none" and the default `h = 0` now contradict `Puzzle`, where hydrogens are required, as in the schema; every caller passes four. The default could go in part 2, or the comment say it is only defensive.
6. **note**, `src/puzzle/api.ts:90`: `CreateGame` is the only type in `api.ts` without a doc comment.
7. **note**, `docs/architecture.md:38`: says the Glue's `app.ts` uses `difficulty.js`, now through `puzzle/api.ts`; for step 5.

Checked with no finding: `Game` has every member `createGame` returns, with the right types; `Status`, `ChangeResult`, `Counts`, `Candidate`, `ElementSymbol`, `Puzzle` and `Board` match the code and the schemas; `api.ts` holds only types and the four values the Glue uses; the Glue imports the Puzzle only from `puzzle/api.ts`; step 2's finding 1 is resolved; the commit message.

## Outcome

1. Fixed in f47d5b9: the entry is a `Saved | undefined` before it goes to `createGame`; `Saved` with an extra `hints` now fails at `src/app.ts:52`.
2. Kept, recorded here: step 4's `Handlers` keeps `1 | -1`.
3. Fixed in f47d5b9: `Atom.el` is `Exclude<ElementSymbol, "H">`.
4. Kept for step 9, where `game.ts`'s returns are typed.
5. Kept for step 9: the default and its comment are looked at when `game.ts` is typed.
6. Fixed in f47d5b9.
7. Kept for step 5, which brings `docs/architecture.md` up to date.
