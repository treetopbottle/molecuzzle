# Review of step 1 of plan 09

Commits reviewed: 2374002 (tests), 7c7ee48 (implementation) and 803ffd3 (the screenshots 13d526e left stale). At 2374002, in a worktree, the 6 new or changed tests fail for the reasons the step expects (Acetonitrile 3 by 1, Caffeine `null` in 200 tries, the old drawings, no default-size layout of Caffeine); at 803ffd3 `npm test` passes, 356 tests. The code follows the Design in the order it draws its random numbers, the budget is 3000 places per try, the default 2000 tries; the spec and decision 0026 match. 803ffd3 touches only the five screenshots that show the panel.

## Findings

1. **should fix**, `src/puzzle/generate.js:24`: `pick` is no longer used; remove it, or use it for the first Atom (the same number is drawn).
2. **note**, `src/puzzle/generate.js:80`: in the `break` condition, `between(at, [r, c]).some(q => cells.has(q))` can never be true, as the points before `at` were checked as `end` on the shorter lengths.
3. **note**, `src/puzzle/generate.js:58`: the comment `point "r,c" -> "atom" | "segment"` describes values never read; only `cells.has` is used. A `Set` would be simpler.
4. **note**, `src/puzzle/generate.js:67-75`: Bonds of two separate Molecules end in a TypeError (`v` stays -1), as before the step; Generate.02 doesn't name the case.
5. **note**, `tests/unit/puzzle/generate.test.js:14-25`, `docs/spec/puzzle.md:164-169`: Generate.03's example says "it prints", but only `findLayout` is tested under its id; the default-size script test runs Caffeine through the script.
6. **note**, `src/puzzle/generate.js:15`: the JSDoc line with "(2000 if left out)" is much longer than those around it.
7. **note**, `docs/plans/09-more-puzzles/README.md:93`: the reviewer couldn't check that each of the ten prints its layout; step 2 should confirm each Grid and difficulty against the table before it adds them.
