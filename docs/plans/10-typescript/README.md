# 10: The components' interfaces as types, then TypeScript

Status: Draft

Asked by the user, not from the backlog. The interfaces between the components are JSDoc in the files that use them, partly `object` and `Function`, and nothing checks them; `ui/board.js` types the game it is given with a type from `puzzle/game.js`, across the boundary of [decision 0011](../../decisions.md#0011). Part 1 writes each component's interface as types in its own `api.ts`, in the terms of the side that uses them, and `tsc` checks in the Glue that they fit ([decision 0028](../../decisions.md#0028)). Part 2 moves all the code, the tests and the scripts to TypeScript, strict, so the bodies are checked against those types too ([decision 0029](../../decisions.md#0029)).

## Scope

Covers:

- Puzzle: Generate.01, whose command becomes `node scripts/generate.ts` (step 11). No other rule changes: the game plays, looks and stores as now.

Left out:

- New behavior, or a change to a format: the schemas, Progress and its key, and the screenshots stay as they are. The end-to-end and screenshot tests change only their file names and imports.
- The copies of values listed in [0011](../../decisions.md#0011)'s cost (the valences in the panel's rule, the undo limit in `progress.js` and the schema): types can't check a value. They stay as they are.
- Types made from the JSON schemas, or schemas made from the types: [0028](../../decisions.md#0028)'s alternatives.
- `noUncheckedIndexedAccess`, and a linter: [0029](../../decisions.md#0029)'s cost, and the backlog's formatting and linting.
- `prototypes/`: single HTML files, outside the spec and the build.
- The type check in CI: CI only builds ([decision 0010](../../decisions.md#0010)), and esbuild strips types without checking them.

## Design

### Tools

- `typescript` 7 (7.0.2 now) as a development dependency, from step 1; `@types/node` 22 from step 6, for the tests and scripts.
- `tsconfig.json`: `strict`, `noEmit`, `target` `es2022`, `module` and `moduleResolution` `nodenext`, `lib` `["es2022", "dom"]`, `allowImportingTsExtensions`, `erasableSyntaxOnly` and `verbatimModuleSyntax`; `allowJs` with `checkJs` off while JavaScript is left, so a `.ts` file sees a `.js` file's JSDoc signatures but no `.js` body is checked. Part 1 includes `src/`; step 6 adds `tests/` and the configs, step 11 `scripts/` and turns `allowJs` off.
- `npm run typecheck` runs `tsc -p .`; `npm run check` runs it first.
- Imports name the file as it is, `./game.ts` or `./game.js`, as Node, esbuild and Vitest need. A file moves with `git mv`, so `git log --follow` keeps its history, and keeps its comments; a JSDoc type becomes a TypeScript one.
- Every doc that names a moved file names it as it is after the step: the README, `docs/architecture.md`, the spec, and the decisions, where a path is corrected in place.

Checked before this plan, in a scratch copy: TypeScript 7.0.2 accepts these options, uses the JSDoc signatures of an unchecked `.js` file when a `.ts` file calls it, and fails in the Glue when the Puzzle's status gains a kind the UI's doesn't have; Node 26 runs a `.ts` file that imports a `.js` one. Strict `checkJs` on today's `src/` gives 207 errors, mostly implicit `any`s and elements by id that may be `null`: that is the work of part 2, not of a setting.

### The interfaces (part 1)

Each component has an `api.ts`, its interface: the types of what it offers, the types of what it needs from the others in its own terms, and re-exports of the values the Glue uses, `export { createGame } from "./game.js"`, and nothing else. A component imports only from its own folder, its types included; the Glue imports only the components' `api.ts` and `app.ts`. The component's files type their exports with their `api.ts`, in JSDoc (`/** @import { Game } from "./api.ts" */`) until part 2.

- `storage/api.ts`. Offers: `Progress` (`puzzles`, `current` and `boards?`), `BoardEntry` (`bonds`, `revealed`, `undo`), `Bond` as `[number, number, 1 | 2 | 3]`, `Store` (`load(): Progress`, `update(change: (p: Progress) => Progress): Progress`), and `createProgressStore`, `markSolved` and `STORAGE_KEY`. Needs: `KeyValueStorage`, `getItem(key)` and `setItem(key, value)`, which `localStorage` fits.
- `puzzle/api.ts`. Offers: `ElementSymbol`, the symbols of `ELEMENTS`; `Puzzle`, as the schema says, with `atoms` as `[symbol, row, column, hydrogens]` and `solution` a `Board` of `[atom, atom, 1 | 2 | 3]`; `Saved` (`bonds`, `revealed`, `undo`); `Atom` and `Candidate`, the game's Atoms and candidate Bonds; `Status`, a union by `kind`, with `few` and `many` on `open`; `ChangeResult` (`changed`, and `reason?: "crossing"`); `Counts`; `Game`, every member `createGame` returns; `CreateGame`, `(puzzle: Puzzle, saved?: Partial<Saved>) => Game`; and `PUZZLES`, `createGame`, `ELEMENTS` and `difficulty`.
- `ui/api.ts`. Needs: `BoardModel`, what `board.js` and `ui.js` read of a game (`puzzle` with its `name`, `rows` and `cols`, `atoms` with an `el` that is one of the UI's `ELEMENTS`, `bonds`, `order` and `status()`); `Status`, the five kinds `messages.js` words; `SayResult`, `{ reason?: "crossing" }`; `PuzzleInfo` (`id`, `name`, `formula`, `fact`); `ProgressView`, `{ puzzles: Record<string, string> }`; `Counts` (`used`, `budget`); `KeyElement` (`symbol`, `valence`). Offers: `Handlers`, `View`, `Ui` (`open(model: BoardModel)`, `render(view: View)`, `say(result: SayResult)`), `UiOptions`, and `createUi`.
- `app.ts`: `AppDeps`, `{ puzzles: Puzzle[]; createGame: CreateGame; store: Store; createUi: (handlers: Handlers) => Ui }`. Where the components meet, `tsc` checks that a `Game` fits `BoardModel`, that a `Status` and `Counts` fit the UI's, that a `ChangeResult` fits `SayResult`, that a `Puzzle` fits `PuzzleInfo`, that `Progress` fits `ProgressView`, and that `Saved` and `BoardEntry` fit each other both ways. When a check fails, the types say different things, and the one that is wrong changes: no cast.

A Vitest test, `tests/unit/imports.test.js`, reads every file in `src/` and, for each relative path it names in `import … from`, `export … from`, `import(…)` or a JSDoc `@import`, checks: a file in a component's folder names only files in that folder; `app.ts` and `browser.ts` name only `app.ts` and the components' `api.ts`. It has no rule id, as the solver's tests have none: it checks [0028](../../decisions.md#0028), not the spec.

### TypeScript (part 2)

One component per step, with its tests, so each step is a set of renames and the types its bodies need, and `npm run check` passes after each. Choices that are not plain renames:

- Data from outside is `unknown` until checked: what `progress.ts` reads from storage, narrowed by its checks as type guards, and the Board `game.ts` is given. The checks stay; the types don't replace them.
- `PUZZLES` and `REMOVED` are `Puzzle[]`, so `tsc` checks every Puzzle's shape, as the schema test does.
- `ELEMENTS` in `puzzle/elements.ts` is `Record<ElementSymbol, { valence: number }>`, with `ElementSymbol` written out in `puzzle/api.ts`; the UI's `ELEMENTS` has its own keys.
- `ui.ts` gets the page's elements through one function, `$(id)`, which returns the element or throws "no #<id> in the page", for the developer, typed by a cast to the element it is, such as `SVGSVGElement` for the Board. Today a missing element throws a `TypeError` where it is first used.
- The tests' fakes are typed with the interfaces: the store and the UI in `app.test.ts` are a `Store` and a `Ui`, so `tsc` checks they fit, as the real ones must.
- Node runs the scripts with its type stripping, so the minimum is Node 22.18 (was 22.12) from step 9, when `scripts/generate.js` first imports a `.ts` file. CI's Node 22 is the latest 22.

## Steps

No step has a rule id except step 11, so the others have no split into tests and implementation. Each runs `npm run check`.

### Part 1: the interfaces as types

1. **TypeScript, and the Glue in it.** `typescript`, `tsconfig.json` (`src/`), `npm run typecheck`, and it in `npm run check`. `git mv` `app.js` and `browser.js` to `.ts`; `app.ts` gets `AppDeps`, each member typed by what `browser.ts` passes now (`typeof createGame` and so on), until steps 2 to 4 give it its component's type. `scripts/build.js` bundles `src/browser.ts`, and `index.html`'s placeholder, which it replaces, names `browser.ts`. `tests/unit/app.test.js` imports `app.ts`.
2. **Storage's interface.** `storage/api.ts`; `progress.js` types `createProgressStore` and `markSolved` with it; the Glue imports Storage only from `storage/api.ts`, and `AppDeps.store` is a `Store`.
3. **The Puzzle's interface.** `puzzle/api.ts`; `game.js`, `difficulty.js`, `elements.js` and `puzzles.js` type their exports with it; the Glue imports the Puzzle only from `puzzle/api.ts`, and `AppDeps.puzzles` and `createGame` get its types.
4. **The UI's interface.** `ui/api.ts`; `ui.js`, `board.js`, `panel.js`, `puzzle-list.js` and `messages.js` type their exports with it, and `board.js` no longer names `puzzle/game.js`; the Glue imports the UI only from `ui/api.ts`, and `AppDeps.createUi` gets its type. All the checks of the Design's `app.ts` now run.
5. **The import test, and the docs.** `tests/unit/imports.test.js`; `docs/architecture.md` gets each component's `api.ts`, in its diagram and in a line of what it offers and needs, and the Glue's `AppDeps`, where the types are checked.

### Part 2: TypeScript

6. **The tests' tools, and the tests outside the components.** `@types/node`; `tsconfig.json` adds `tests/` and the configs; `vitest.config.ts` runs `*.test.js` and `*.test.ts`; `playwright.config.ts`, its patterns `.spec.ts` and its `globalSetup` `build.ts`. To `.ts`: `tests/helpers/`, `tests/e2e/` (the helpers and every spec, so none loads a `.ts` file from a `.js` one), `draw.test`, `app.test` and `imports.test`.
7. **Storage in TypeScript.** `progress.ts`, `progress.test.ts`.
8. **The rules in TypeScript.** `elements.ts`, `grid.ts`, `game.ts`, `solver.ts` and `difficulty.ts`, with their tests.
9. **The Puzzles and the generator in TypeScript.** `puzzles.ts`, `removed.ts` and `generate.ts`, with their tests; `scripts/generate.js` imports the `.ts` files. The README's minimum becomes Node 22.18: run `scripts/generate.js` and `npm test` with Node 22.18 first, and stop if it warns or fails.
10. **The UI in TypeScript.** `elements.ts`, `messages.ts`, `board.ts`, `panel.ts`, `puzzle-list.ts` and `ui.ts`, with `$`, and their tests.
11. **The scripts in TypeScript, and no JavaScript left.** Generate.01.
    - (a) Spec and tests: Generate.01 and the README's New Puzzle line say `node scripts/generate.ts`, and so does the top comment of the script; `generate-script.test.ts` runs `scripts/generate.ts`, which fails as there is none.
    - (b) Implementation: `git mv` `scripts/generate.js` and `scripts/build.js` to `.ts`; `npm run build`, `tests/e2e/build.ts` and `scripts/screenshots.sh` run `scripts/build.ts`. `tsconfig.json` adds `scripts/` and drops `allowJs`, so a `.js` file can't come back unseen; `vitest.config.ts` runs only `*.test.ts`.
12. **Finish.** No rule ids. The README's first line says TypeScript, not plain JavaScript; check the docs name no `.js` file of `src/`, `tests/` or `scripts/`, and that decisions 0028 and 0029 still say what was done. `Status: Done` in the plan and the table.
