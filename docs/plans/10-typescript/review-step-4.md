# Review of step 4 of plan 10

Commits reviewed: 56d8976 (refactor: the UI's interface is ui/api.ts, board.js no longer names the Puzzle's game.js, and the Glue imports the UI only from it). The step has no rule ids, so there is no tests commit to check in a worktree.

Checks at 56d8976, in a worktree: `npx tsc -p .` exits 0; `npm run build` writes `dist/index.html`, 49.9 kB; `npm test` passes 408; `npx playwright test` passes 40.

Probes in the worktree, each reverted before the next:

- The author's, repeated: the Puzzle's `Status` gaining `{ kind: "stuck" }` fails at `src/app.ts:53` and `:62`; `I` taken out of `ui/elements.js` fails at `:53`; `ChangeResult.reason` as `"crossing" | "full"` at `:23`; `Puzzle.fact?` at `:62`; Progress's `puzzles` as `Record<string, number>` at `:62` and `:59`; the UI's `Counts.used: string` at `:62`; `KeyElement.symbol` as `Exclude<LookSymbol, "S">` at `src/browser.ts:13`; `ui.js`'s `@returns {View}` at `src/browser.ts:13`; `board.js`'s `@param {View} game` passes, as reported.
- The other UI files' `@import`s: a scratch `.ts` file calling each UI export with a wrong argument fails for each of `createBoard`, `renderPanel`, `renderPuzzleList`, `statusText` and `reasonText`, so all five resolve.
- `LookSymbol` is exactly `"Br" | "C" | "Cl" | "F" | "H" | "I" | "N" | "O" | "S"`.
- View without `hasBonds` fails at `src/app.ts:63`; `BoardModel.order` as `string[]` at `:53`; `Handlers.onOpen(index: string)` at `:26`; `Handlers.onOpen(index: number | string)` passes (finding 1); `UiOptions.confirm` returning `string` passes, as `browser.ts` passes no `confirm`; typing `ui/elements.js`'s `ELEMENTS` as `Record<LookSymbol, …>` fails with TS2456, "LookSymbol circularly references itself" (finding 3).

## Findings

1. **should fix**, `src/ui/api.ts:54-60` with `src/app.ts:26`: `Handlers` declares its members as methods, whose parameters are checked both ways, so the Glue's `onOpen: open` isn't checked against what the UI passes: `onOpen(index: number | string)` passes tsc. `onChange` is checked only because its body is inside the literal. Fix without a cast: properties of function type, `onOpen: (index: number) => void`; then the widened `onOpen` fails at `src/app.ts:26`. `Ui` can keep its methods, as the fake's `open` in part 2 relies on a method's parameter.
2. **note**, `src/ui/board.js:26`, `src/ui/panel.js:192`, `src/ui/puzzle-list.js:4-8`, `src/ui/messages.js:6-10`, `:23-25`: these JSDoc types resolve, but nothing checks them until step 11, as the only UI signature tsc sees from a `.ts` file is `createUi`. The Design's stated limit. Compared by hand with what each file reads: `BoardModel`, `View`, `PuzzleInfo`, `ProgressView`, `Status` and `SayResult` all match.
3. **note**, `src/ui/api.ts:3-6`: `import type { ELEMENTS } from "./elements.js"` for `LookSymbol` is type-only, so `api.ts` still holds only types and the re-export of `createUi`, and it is the most exact reading of "one of the UI's `ELEMENTS`", with no second list. Step 11's `ui/elements.ts` can't annotate `ELEMENTS` with `Record<LookSymbol, …>`, as the alias would be circular: it needs `satisfies` or its inferred type. `docs/architecture.md` may want to name `LookSymbol`.
4. **note**, `src/ui/ui.js:44`, `:66`: `render` got `@param {View}`, but `open(next)` and `say(result)` have no `@param {BoardModel}` and `{SayResult}`; they are typed only through `@returns {Ui}`.
5. **note**, `src/ui/messages.js:7`, `:22`: the comments say "a status from game.status()" and "a result of game.change()", the Puzzle's words; the UI's own would be the Board's status and a change's result.

Checked with no finding: `ui/api.ts`'s types match the Design's list, with `Handlers` keeping `1 | -1`; `board.js` names nothing outside `src/ui/`; the Glue imports the UI only from `ui/api.ts`; `AppDeps.createUi` is `(handlers: Handlers) => Ui`; every check in the Design's `app.ts` and `browser.ts` now runs; the commit message.
