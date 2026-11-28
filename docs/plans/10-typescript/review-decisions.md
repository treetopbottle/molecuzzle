# Review of the decisions of plan 10

Reviewed: decisions 0028 and 0029 in `docs/decisions.md`, and the older decisions the plan touched: 0006 (partly superseded by 0029), 0007, 0008, 0010, 0011, 0012 and 0022, which name files, tools or the Node version the plan changed. They were checked against the code, the configs and the spec at 126d64e. Also reviewed: commit 126d64e (the README's first line, and the wording of the imports test), and finish-a-plan step 1 for `docs/plans/10-typescript/`.

Checks run: `npx tsc -p .` exits 0, and `npm test` passes 415 tests in 18 files. Read `src/*/api.ts`, `app.ts`, `browser.ts`, `progress.ts`, `game.ts`, `ui.ts`, the configs and `package.json`. `@types/node` resolves to 22.18.13, deduped, and TypeScript to 7.0.2. Every `src/`, `tests/` and `scripts/` path named in the README, `docs/architecture.md`, the spec, the decisions, the backlog and the code compared with the tree: the only one that doesn't exist is `src/types.ts`, which 0028 names as an alternative. The same files grepped for `.js` names, JSDoc, `allowJs` and Node versions, and the Outcomes of all 14 reviews in `docs/plans/10-typescript/` read. In a scratch `git worktree`, since removed, tsc probed with `allowJs` off:
- A `.ts` file importing a `.js` file fails with TS7016.
- A `.js` file in `scripts/` that nothing imports passes tsc unseen.

## Findings

1. **should fix**, `docs/decisions.md:355` (0029), also `tests/unit/typescript.test.ts:2-3` and `docs/plans/10-typescript/README.md:82`. All three say "tsc sees a `.js` file only through an import", which suggests an imported `.js` file is still checked. With `allowJs` off, tsc never reads a `.js` file. A `.ts` file that imports one fails `tsc` (TS7016, "implicitly has an 'any' type"), and a `.js` file that nothing imports is not seen at all. The test still closes the real gap, which is unimported `.js` files run by Node, Vitest or Playwright. But the reason should say what tsc actually does, e.g. "tsc reads no `.js` file: an import of one fails the check, and any other goes unseen".
2. **note**, `tests/unit/imports.test.ts:13`, `:23-24`, `:54-55`, `:62`. 126d64e's message says the imports test "no longer speaks of JSDoc types". It still does:
   - The comments "and a JSDoc @import" and "import(…), also in a JSDoc type".
   - The fixed text's `@import` and `@param {import(…)}` cases.
   - "The .js and .ts files of src/".

   These are harmless, since they make the parser more general. But a `.ts` file ignores JSDoc types, so the JSDoc forms are now dead. Either drop them, or the message overstates what the commit did.
3. **note**, `docs/plans/10-typescript/README.md:32` and `:58` (also the intro `:5` and steps 1 to 12). Step 13's check, read literally, wants the plan's Design to name no `.js` file. Line 58 still names `scripts/generate.js` and `src/puzzle/generate.js`, which step 10's Outcome 6 kept on purpose as the story of step 9. Line 32's example, "`./game.ts` or `./game.js`", was never addressed. Either step 13's check should exclude the Design's account of the move, or line 32's `./game.js` should go.
4. **note**, `docs/decisions.md:344` (0028). The decision says what a component and the Glue may import, but not that tests and scripts may import any file. The plan's Design says so, and the code relies on it: `scripts/generate.ts` imports `src/puzzle/generate.ts` and `difficulty.ts` past `puzzle/api.ts`, and the tests import `UNDO_LIMIT`, `solver.ts` and others. Once the plan is history, nothing durable says it is allowed. The imports test only scans `src/`, and `docs/architecture.md:5` is silent too. Also, "the Glue imports only the `api.ts` files" leaves out `browser.ts` importing `app.ts`, which `docs/architecture.md:5` includes.
5. **note**, `src/puzzle/game.ts:10-16`, `:27-31`, against 0028 and 0029. Step 9 stopped `createGame` checking a saved Board's shape: it trusts `Partial<Saved>` and leaves the shape to Storage's checks. The pattern is that types are trusted between components, and runtime checks happen only where data comes from outside, such as storage and the page. That choice is written only in the code's comment and the plan's Design; the spec's Puzzle.03 and Progress.03 match it but don't give the reason. It matters for the backlog's import and export of Progress (`docs/plans/README.md:34`), whose data must go through Storage's checks. One sentence in 0028's Cost would keep it.
6. **note**, `docs/decisions.md:359` (0029, Alternatives). It doesn't name running the scripts through a loader such as `tsx`, or with `--experimental-strip-types`. Either would avoid raising the minimum to Node 22.18, the first cost listed, at the price of a dependency or a flag on every command.
7. **note**, `docs/decisions.md:176` (0012, status). "Kept from drifting because the tests check the data against the schemas and `tsc` checks the code against the types" claims more than is true. Nothing compares a type with its schema. They are held together only where the same data is checked by both, such as `PUZZLES` as `Puzzle[]` and the stored Progress in the end-to-end tests. A constraint only one of them has, such as the schema's range for hydrogens or its `maxItems` on `undo`, can differ unnoticed. Say "as far as the data checked by both exercises them".
8. **note**, `docs/decisions.md:355` (0029). "The code, the tests and the scripts are TypeScript": `scripts/` also holds `publish-pages.sh` and `screenshots.sh`. "The Node scripts" would be exact.

Checked with no finding:
- **0028 against the code.** Each `api.ts` holds only types and re-exports of values the Glue uses. Components import only from their own folder. The Glue checks every fit the decision lists, plus the key in `browser.ts`.
- **0029 against the code and configs.** `strict`, `noEmit`, `erasableSyntaxOnly`, `skipLibCheck`, `types: ["node"]`, Vitest running only `.test.ts`, imports naming `.ts`, `$()` with `querySelector<E>`, Node 22.18 in the README and `@types/node` `~22.18.13`, and CI on Node 22.
- **Older decisions.** 0006's partial-supersede note holds. 0010 needs no note, since `npm run check` now runs the type check and 0029's Cost says branch builds don't. 0011's status matches the code: `Game` must fit `BoardModel`, so tsc checks the UI has a look for each of the Puzzle's symbols, and the valences and the undo limit stay unchecked copies. 0007, 0008 and 0022 name existing `.ts` paths.
- **Index.** 0028 and 0029 are listed under Technical.
- **Commit 126d64e.** The README's first line says TypeScript.
- **Old names.** The README, `docs/architecture.md` (diagrams included), the spec (Generate.01, Puzzle.06, `schemas.md`, `README.md`), the decisions, the backlog, `index.html`'s comment and `scripts/generate.ts`'s comment and usage message name no `.js` file of `src/`, `tests/` or `scripts/`.
- **Leftovers.** No review Outcome leaves work that belongs in the backlog. The Scope's exclusions (`noUncheckedIndexedAccess`, one tsconfig, no type check in CI) are recorded as 0029's cost, and the linter is already a backlog item.
- **Spec.** The plan changed no Player-facing behavior outside Generate.01's command.

## Outcome

1. Fixed in 25897de: 0029, the test's comment and step 12's line say tsc reads no `.js` file, failing only on an import of one.
2. Fixed in 25897de: the JSDoc comments and cases are gone; "the .js and .ts files of src/" stays, as the test still lists both.
3. Fixed in 25897de: step 13 checks the Design where it describes the code as it is; its account of the move keeps the names it had.
4. Fixed in 25897de: 0028 says tests and scripts import any file, and that the Glue imports `app.ts` too.
5. Fixed in 25897de: 0028's cost says the types are trusted between components, and data from outside goes through Storage's checks.
6. Fixed in 25897de: 0029's alternatives name a loader or the flag.
7. Fixed in 25897de: 0012 says they are held together only where the same data is checked by both.
8. Fixed in 25897de: "the Node scripts".
