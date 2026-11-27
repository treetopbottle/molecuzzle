# Review of step 10 of plan 10

Commits reviewed: a735923 (the move, with `// @ts-nocheck`, and `PUZZLES: Puzzle[]` as its JSDoc gave it) and 623e547 (the typing; `PUZZLES` and `REMOVED` are `Puzzle[]`). The step has no rule ids; its only rule text change is the path in Puzzle.06, which the plan's Scope says gets no test.

Checks, in worktrees: at 623e547 and at a735923, `npx tsc -p .` exits 0, `npm run build` writes 49.9 kB, `npm test` passes 413 in 17 files, and Playwright passes 40. Under Node 22.18.0 in podman, at both commits, `node scripts/generate.js "CH3-C C#N" 2000 3 3 1` exits 0 with nothing on stderr, and Vitest passes 413 with no warning.

Behaviour: the old `findLayout` and the new one side by side on 855 cases: 98 texts (the solutions of every Puzzle and removed Puzzle with Bonds, the tests' texts, and `toString`, `__proto__`, `C-C-C`, `C--C`, `c-C`, `CH9-C`, `CH10-C`, an empty text, `CH3-CH3`, a disconnected Molecule and a 3-ring), each with up to 9 option sets (seeds 0, 1, 2, 7, 99, 123456789 and NaN; Grids 1×1, 3×3, 4×4 and the default; tries 10 to 60; `{}`). 377 layouts, 281 nulls, the rest threw; every output and every thrown class and message the same. Each rewrite is equivalent: `atom()`'s checks reordered with no side effects; the `kinds` filter removes nothing; `idx.indexOf` gives the `Map`'s values; the tuples sort the same; `placed()`'s throw can't be reached.

Type-check probes: tsc fails on an Atom `"H"` or `"Xx"`, a Bond order 4, a 3-member Atom, a missing `fact` and an extra field in `PUZZLES` or `REMOVED`; `el === "H"` first in `atom()` fails at `generate.ts:41`; dropping the `kinds` filter at `:122`; dropping the solution callback's return type at `:160`; an inline `as const` object for `ORDERS` at `:49`. So each typing change is needed.

## Findings

1. **should fix**, `scripts/generate.js:2`, `:9`: the script's top comment still names the old files, "an entry for src/puzzle/puzzles.js" and "findLayout in src/puzzle/generate.js", which this step moved; its import on line 10 was updated.
2. **note**, `src/puzzle/generate.ts:51`: `labels.map(atom).filter(k => k !== null)` is right only while every label has been read; if that broke, the filter would silently shift `kinds` against the label indices. A `map` that throws, as `placed()` does, would keep them safe.
3. **note**, `src/puzzle/generate.ts:15`: `ORDERS: Record<string, 1 | 2 | 3>` claims an order for every string, right only because `op` comes from `[-=#]`; in line with the Scope's leaving out `noUncheckedIndexedAccess`.
4. **note**, `src/puzzle/generate.ts:11`, `:13`: `Kind & { r: number; c: number }` is structurally `api.ts`'s `Atom`; `Layout.atoms` could be `Atom[]`, with `Kind` as `Omit<Atom, "r" | "c">`.
5. **note**, `tests/unit/puzzle/puzzles.test.ts:10-11`, `tests/unit/puzzle/removed.test.ts:10-11`: `PUZZLE_SYMBOLS` is defined twice, word for word; it could live in `tests/helpers/`. The check is stricter than `a.el in ELEMENTS` (own keys only) and still fails on an `"H"` Atom.
6. **note**, `docs/plans/10-typescript/README.md:58`: the Design's "when `scripts/generate.js` and `src/puzzle/generate.js` first import `.ts` files" names the old file; it describes step 9's event, so as history it is accurate.

Checked with no finding: all six renames recorded (96% to 99%), with `git log --follow` past them; the move commit's edits; Puzzle.06, `docs/spec/puzzle.md`, `docs/spec/schemas.md`, `docs/architecture.md`, decisions 0022 and 0023 and `removed.ts`'s comment name the new files; no `as`, `!`, `any` or `@ts-` lines; the tests assert the same; the commit messages. Outside this step: a disconnected Molecule throws a TypeError, not "can't read", as before.
