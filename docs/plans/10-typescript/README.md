# 10: The components' interfaces as types, then TypeScript

Status: Draft

Asked by the user, not from the backlog. The interfaces between the components are JSDoc in the files that use them, partly `object` and `Function`, and nothing checks them; `ui/board.js` types the game it is given with a type from `puzzle/game.js`, across the boundary of [decision 0011](../../decisions.md#0011). Part 1 writes each component's interface as types in its own `api.ts`, in the terms of the side that uses them, and `tsc` checks in the Glue that they fit ([decision 0028](../../decisions.md#0028)). Part 2 moves all the code, the tests and the scripts to TypeScript, strict, so the bodies are checked against those types too ([decision 0029](../../decisions.md#0029)).

## Scope

Covers:

- Puzzle: Generate.01, whose command, which the developer types and its test runs, becomes `node scripts/generate.ts` (step 12).

A path in a rule's text is not a change to the rule, and gets no test: Puzzle.06 names `src/puzzle/removed.ts` from step 10. Otherwise the game plays, looks and stores as now.

Left out:

- New behavior, or a change to a format: the schemas, Progress and its key, and the screenshots stay as they are. The end-to-end and screenshot tests change only their file names and imports.
- The copies of values listed in [0011](../../decisions.md#0011)'s cost (the valences in the panel's rule, the undo limit in `progress.js` and the schema): types can't check a value. They stay as they are.
- Types made from the JSON schemas, or schemas made from the types: [0028](../../decisions.md#0028)'s alternatives.
- `noUncheckedIndexedAccess`, a `tsconfig` for `src/` without Node's types, and a linter: [0029](../../decisions.md#0029)'s cost, and the backlog's formatting and linting.
- `prototypes/`: single HTML files, outside the spec and the build.
- The type check in CI: CI only builds ([decision 0010](../../decisions.md#0010)), and esbuild strips types without checking them.
- The past plans and their reviews: they are history, and keep the names they had.

## Design

### Tools

- `typescript` 7 (7.0.2 now) as a development dependency, from step 1; `@types/node` 22 from step 6, for the tests and scripts.
- `tsconfig.json`: `strict`, `noEmit`, `target` `es2022`, `module` and `moduleResolution` `nodenext`, `lib` `["es2022", "dom"]`, `allowImportingTsExtensions`, `erasableSyntaxOnly` and `verbatimModuleSyntax`; `allowJs` with `checkJs` off while JavaScript is left, so a `.ts` file sees a `.js` file's JSDoc signatures but no `.js` body is checked. Part 1 includes `src/`; step 6 adds `tests/` and the configs, step 12 `scripts/` and turns `allowJs` off.
- `npm run typecheck` runs `tsc -p .`; `npm run check` runs it first. The README lists it with the other Development commands.
- Imports name the file as it is, `./game.ts` or `./game.js`, as Node, esbuild and Vitest need.
- A file moves in a commit of its own: `git mv`, the import paths that name it, and `// @ts-nocheck` as its first line, so the check passes; the next commit takes that line out and types the body, a JSDoc type becoming a TypeScript one, comments kept. Git finds a rename only by content, so a rename with nothing else changed keeps the file's history for `git log --follow`.
- A moved file's new name goes everywhere the old one is named, in the step that moves it: the README, `docs/architecture.md`, the spec, the decisions (a path is corrected in place), the backlog, the code's comments and messages, and the configs and scripts.

Checked before this plan, in a scratch copy: TypeScript 7.0.2 accepts these options; a `.ts` file sees the JSDoc signatures of an unchecked `.js` file, an `@import` of a type from `api.ts` in it included, and `tsc` reports a signature there that doesn't fit, through the `.ts` file that calls it; it fails in the Glue when the Puzzle's status gains a kind the UI's doesn't have; Node 26 runs a `.ts` file that imports a `.js` one. Node 22.18 was not checked: step 9 does. Strict `checkJs` on today's `src/` gives 207 errors, mostly implicit `any`s and elements by id that may be `null`: that is the work of part 2, not of a setting.

### The interfaces (part 1)

Each component has an `api.ts`, its interface: the types of what it offers, the types of what it needs from the others in its own terms, and re-exports of the values the Glue uses, `export { createGame } from "./game.js"`, and nothing else. A component imports only from its own folder, its types included; the Glue imports only the components' `api.ts` and `app.ts`. Tests and scripts are not components, and import any file. The component's files type their exports with their `api.ts`, in JSDoc (`/** @import { Game } from "./api.ts" */`) until part 2. A JSDoc type in a `.js` file that doesn't resolve becomes `any` without an error, so until part 2 the Glue's checks compare the `api.ts` types with each other, and whether the JavaScript fits them is only as good as its JSDoc.

- `storage/api.ts`. Offers: `Progress` (`puzzles`, `current` and `boards?`), `BoardEntry` (`bonds`, `revealed`, `undo`), `Bond` as `[number, number, 1 | 2 | 3]`, `Store` (`load(): Progress`, `update(change: (p: Progress) => Progress): Progress`), and `createProgressStore` and `markSolved`. Needs: `KeyValueStorage`, `getItem(key)` and `setItem(key, value)`, which `localStorage` fits. `STORAGE_KEY` stays in `progress.js` for the tests, as the Glue doesn't use it.
- `puzzle/api.ts`. Offers: `ElementSymbol`, the symbols of `ELEMENTS`, written out, H included; `Puzzle`, as the schema says, with `atoms` as `[symbol, row, column, hydrogens]`, the symbol any but H, and `solution` a `Board` of `[atom, atom, 1 | 2 | 3]`; `Saved` (`bonds`, `revealed`, `undo`); `Atom` and `Candidate`, the game's Atoms and candidate Bonds; `Status`, a union by `kind`, with `few` and `many` on `open`; `ChangeResult` (`changed`, and `reason?: "crossing"`); `Counts`; `Game`, every member `createGame` returns; `CreateGame`, `(puzzle: Puzzle, saved?: Partial<Saved>) => Game`; and `PUZZLES`, `createGame`, `ELEMENTS` and `difficulty`.
- `ui/api.ts`. Needs: `BoardModel`, what `board.js` reads of a game: `puzzle` with its `rows` and `cols`, `atoms` with `el`, one of the UI's `ELEMENTS`, and `r`, `c` and `h`, `bonds` with `a`, `b` and `horizontal`, `order` and `status()`; `Status`, the five kinds `messages.js` words; `SayResult`, `{ reason?: "crossing" }`; `PuzzleInfo` (`id`, `name`, `formula`, `fact`); `ProgressView`, `{ puzzles: Record<string, string> }`; `Counts` (`used`, `budget`); `KeyElement` (`symbol`, one of the UI's `ELEMENTS`, and `valence`). Offers: `Handlers`, `View`, `Ui` (`open(model: BoardModel)`, `render(view: View)`, `say(result: SayResult)`), `UiOptions`, and `createUi`.
- `app.ts`: `AppDeps`, `{ puzzles: Puzzle[]; createGame: CreateGame; store: Store; createUi: (handlers: Handlers) => Ui }`. Where the components meet, `tsc` checks that a `Game` fits `BoardModel`, that a `Status` and `Counts` fit the UI's, that a `ChangeResult` fits `SayResult`, that a `Puzzle` fits `PuzzleInfo`, that `Progress` fits `ProgressView`, and that `Saved` and `BoardEntry` fit each other both ways. `browser.ts` checks that its key's symbols, `["C", "N", "O", "S"] as const`, fit `KeyElement`. When a check fails, the types say different things, and the one that is wrong changes: no cast.

A Vitest test, `tests/unit/imports.test.js`, reads every `.js` and `.ts` file in `src/` and, for each relative path it names in `import … from`, `export … from`, `import(…)` or a JSDoc `@import`, checks: a file in a component's folder names only files in that folder; `app.ts` and `browser.ts` name only `app.ts` and the components' `api.ts`. It has no rule id, as the solver's tests have none: it checks [0028](../../decisions.md#0028), not the spec.

### TypeScript (part 2)

One component per step, with its tests, so each step is a set of renames and then the types its bodies need, and `npm run check` passes after each commit. Choices that are not plain renames:

- What `progress.ts` reads from storage is `unknown` until checked, narrowed by its checks as type guards. `createGame`'s `saved` stays a `Partial<Saved>`, whose shape Storage checked; `game.ts` keeps its checks that the Board can be on this Grid.
- `PUZZLES` and `REMOVED` are `Puzzle[]`, so `tsc` checks every Puzzle's shape, as the schema test does.
- `ELEMENTS` in `puzzle/elements.ts` is `Record<ElementSymbol, { valence: number }>`; the UI's `ELEMENTS` has its own keys.
- `ui.ts` gets the page's elements through one function, `$(id)`, which returns the element or throws "no #<id> in the page", for the developer, typed by a cast to the element it is, such as `SVGSVGElement` for the Board. Today a missing element throws a `TypeError` where it is first used.
- The tests' fakes are typed with the interfaces: the store and the UI in `app.test.ts` are a `Store` and a `Ui`, so `tsc` checks they fit, as the real ones must. The fake's `open` takes the `Game` it is given, which a method's parameter allows, as the test reads its `puzzle.id`.
- Node runs the scripts with its type stripping, from step 9, when `scripts/generate.js` and `src/puzzle/generate.js` first import `.ts` files. The minimum becomes the oldest Node 22 that runs them and `npm test` with no warning, 22.18 if it does; if every Node 22 warns, the oldest Node 24 that doesn't. CI's Node 22 is the latest 22.

## Steps

No step has a rule id except step 12, so the others have no split into tests and implementation. Each runs `npm run check`.

### Part 1: the interfaces as types

1. **TypeScript, and the Glue in it.** `typescript`, `tsconfig.json` (`src/`), `npm run typecheck`, in `npm run check` and the README. Move `app.js` and `browser.js` to `.ts`; `app.ts` gets `AppDeps`, each member typed by what `browser.ts` passes now (`typeof createGame` and so on), until steps 2 to 4 give it its component's type. `scripts/build.js` bundles `src/browser.ts`, and `index.html` names `browser.ts`, in its placeholder and in its comment. `tests/unit/app.test.js` imports `app.ts`; `docs/spec/README.md` and the decisions name `src/app.ts`.
2. **Storage's interface.** `storage/api.ts`; `progress.js` types `createProgressStore` and `markSolved` with it; the Glue imports Storage only from `storage/api.ts`, and `AppDeps.store` is a `Store`. Confirm, without committing it, that a wrong type in `progress.js`'s JSDoc fails `tsc` through the Glue, so its `@import` resolves.
3. **The Puzzle's interface.** `puzzle/api.ts`; `game.js`, `difficulty.js`, `elements.js` and `puzzles.js` type their exports with it; the Glue imports the Puzzle only from `puzzle/api.ts`, and `AppDeps.puzzles` and `createGame` get its types.
4. **The UI's interface.** `ui/api.ts`; `ui.js`, `board.js`, `panel.js`, `puzzle-list.js` and `messages.js` type their exports with it, and `board.js` no longer names `puzzle/game.js`; the Glue imports the UI only from `ui/api.ts`, and `AppDeps.createUi` gets its type. All the checks of the Design's `app.ts` now run.
5. **The import test, and the docs.** `tests/unit/imports.test.js`; `docs/architecture.md` gets each component's `api.ts`, in its diagram and in a line of what it offers and needs, and the Glue's `AppDeps`, where the types are checked. The UI's diagram gets its edges right: `panel.js` imports `elements.js`, `messages.js` imports nothing.

### Part 2: TypeScript

6. **The tests' tools, and the end-to-end tests.** `@types/node`; `tsconfig.json` adds `tests/` and the configs; `vitest.config.ts` runs `*.test.js` and `*.test.ts`; `playwright.config.ts`, its patterns `.spec.ts` and its `globalSetup` `build.ts`. To `.ts`: `tests/e2e/`, its helpers and build included, and `tests/helpers/schemas.js`, which `progress.spec` imports, so no end-to-end test loads a `.ts` file from a `.js` one.
7. **The other helpers, and the tests outside the components.** To `.ts`: the rest of `tests/helpers/`, `draw.test`, `app.test` and `imports.test`.
8. **Storage in TypeScript.** `progress.ts`, `progress.test.ts`.
9. **The rules in TypeScript.** `elements.ts`, `grid.ts`, `game.ts`, `solver.ts` and `difficulty.ts`, with their tests; `src/puzzle/generate.js` and `scripts/generate.js` import the `.ts` files. First, run `scripts/generate.js` and `npm test` with Node 22.18 on a copy with these renames, and set the README's minimum and [0029](../../decisions.md#0029)'s cost to the Node the Design says.
10. **The Puzzles and the generator in TypeScript.** `puzzles.ts`, `removed.ts` and `generate.ts`, with their tests; `scripts/generate.js` imports `generate.ts`; Puzzle.06, `docs/spec/puzzle.md` and `docs/spec/schemas.md` name the new files.
11. **The UI in TypeScript.** `elements.ts`, `messages.ts`, `board.ts`, `panel.ts`, `puzzle-list.ts` and `ui.ts`, with `$`, and their tests.
12. **The scripts in TypeScript, and no JavaScript left.** Generate.01.
    - (a) Spec and tests: Generate.01, the README's New Puzzle line and the backlog say `node scripts/generate.ts`; `generate-script.test.ts` runs `scripts/generate.ts`, which fails as there is none.
    - (b) Implementation: move `scripts/generate.js` and `scripts/build.js` to `.ts`, with the script's top comment and usage message; `npm run build`, `tests/e2e/build.ts` and `scripts/screenshots.sh` run `scripts/build.ts`. `tsconfig.json` adds `scripts/` and drops `allowJs`, so a `.js` file can't come back unseen; `vitest.config.ts` runs only `*.test.ts`.
13. **Finish.** No rule ids. The README's first line says TypeScript, not plain JavaScript; check that the README, `docs/architecture.md`, the spec, the decisions, the backlog and the code name no `.js` file of `src/`, `tests/` or `scripts/`, and that decisions 0028 and 0029 still say what was done. `Status: Done` in the plan and the table.
