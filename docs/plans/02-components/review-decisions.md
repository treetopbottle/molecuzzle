# Review of the decisions, plan 02

Commits reviewed: the work of plan 02, `735d74c..56017e6` (146 commits, from `5f9a718` "docs: plan 02, components" to HEAD `56017e6` "docs: move the leftovers of plan 02 into the backlog"). Code, tests and docs were read at `56017e6`. `npm test` passes (13 files, 156 tests).

## What was checked

- `docs/decisions.md`, 0001–0013 and 0015, against `docs/spec/` (README, puzzle, storage, ui, schemas and `schemas/*.json`), `docs/architecture.md`, `README.md`, `docs/plans/README.md`, `src/`, `scripts/`, `tests/`, `package.json`, `playwright.config.js`, `vitest.config.js` and `.github/workflows/pages.yml`.
- Each decision has its why, cost and alternatives, and gives the why rather than the what.
- Paths, commands, versions and numbers still match.
- No choice that isn't obvious is missing a decision.
- The index lists every entry under its category.

## Findings

1. **should fix**: `docs/decisions.md:189` (0015, Cost) says "A build without this, such as `main` before it is merged, drops the Puzzles in progress…". The plan's work is already on `origin/main`: `5c8c915` is an ancestor of it. So the example no longer applies. The cost itself still holds for any older build on the shared origin, such as an old branch build, and the line should say that.

2. **should fix**: `docs/decisions.md:177` (0013, Why) says the image gives "the same pixels on every machine and in CI". No CI runs any tests. 0010 (`decisions.md:142`) says so, and `.github/workflows/pages.yml` only builds and publishes.

3. **should fix**: `docs/decisions.md:142` (0010) lists "a lint error or a known vulnerability" as failing checks that block merging. `npm run check` (`package.json:10`) runs neither a linter nor `npm audit`, and the backlog says there is no linter yet (`docs/plans/README.md`, "Formatting and linting"). The decision names checks that don't exist.

4. **should fix**: Keeping the key `molecuzzle-v2` while adding `boards` as an optional field has no decision. The alternatives are a new key, or a migration. The reason is only in the plan (`docs/plans/02-components/README.md:19`: "Progress keeps its key and only gains an optional field, so no Player loses it"), and the plan stops being read once it is done. Finish-a-plan step 1 moves choices into the decisions. The cost is already half in 0015 (older builds drop `boards`); the why and the alternatives are not recorded anywhere.

5. **should fix**: `README.md:68` labels `npx playwright install chromium` / `CHROMIUM_PATH` as "Screenshot creation", in `0c4c590`. Per 0013 (`decisions.md:175`), screenshots are only made in Playwright's image, with its own browser. That Chromium is the one `npm run test:e2e` needs (0007, `decisions.md:111`). So the README contradicts 0013.

6. **should fix**: `docs/decisions.md:175` (0013) is mostly what, not why. It spells out `threshold: 0.2`, `maxDiffPixels: 0`, the image name and tag rule, `linux/amd64`, and both commands. All of that is already in `playwright.config.js:49`, `scripts/screenshots.sh:55-59`, `README.md:69-70` and `docs/spec/ui.md:5`. These are the details most likely to drift.

7. **note**: `docs/decisions.md:178` (0013, Cost) says "`npm run check` does both". `check` only checks the screenshots; it doesn't remake them. It probably means that `check` needs Podman or Docker too.

8. **note**: `docs/decisions.md:76` (0004) says Show solution "changes nothing in Progress … until the Player clicks Reset and builds it". Since 0015 it writes `boards`. 0015 reconciles this at `decisions.md:186`, but 0004 read alone is now false. Help.01 (`docs/spec/puzzle.md:284`) also ends "revealed" whenever the Board has no Bonds again, Undo included, not only on Reset. The rule at `decisions.md:5` allows only "Superseded by", so there is no way to mark a decision as partly amended.

9. **note**: Two entries were rewritten in place, against `decisions.md:5` ("Don't renumber or rewrite"):
   - 0011 was "Four components" when PR #1 (`e5f975f`) merged it, and became "Three components" in `605b280`.
   - 0007, accepted 2026-11-11, got a new title and scope.

   The code didn't change in either case; one is a reframing of the Glue, the other new paths. Either the rule should allow corrections like these, or such changes should be new entries.

10. **note**: The numbers jump from 0013 to 0015 (`decisions.md:36-38`, `decisions.md:181`), with nothing saying why. 0014 was removed in `b81f182` because it never left the branch, which is right. A one-line mention would stop readers looking for it.

11. **note**: `docs/decisions.md:189` (0015, Cost) gets two details slightly wrong:
    - "Up to 100 Boards per Puzzle" is up to 101: `undo` holds up to 100 (`progress.schema.json`, `game.js:7`), plus `bonds`.
    - "a full storage keeps nothing" is too strong: a failed `setItem` (`progress.js:121`) leaves the last value that fit, so only newer changes are lost.

12. **note**: 0011's cost (`decisions.md:156`) leaves out that "a component imports only from itself" duplicates knowledge across components:
    - the undo limit is in `src/storage/progress.js:4` (`UNDO_MAX`), `src/puzzle/game.js:7` (`UNDO_LIMIT`) and the schema's `maxItems`;
    - the element symbols are in both `src/puzzle/elements.js` and `src/ui/elements.js`.

    Also, `src/ui/board.js:22` refers to `../puzzle/game.js` in a JSDoc type. It is not a runtime import, but it does reach across components.

13. **note**: `docs/architecture.md:115` puts `index.html` and `style.css` under "Glue". They are in `src/ui/`, and 0011 (`decisions.md:153`) defines UI as `src/ui/`, "the page".

14. **note**: `README.md:76` says to run `npm run check` "before pushing". 0010 (`decisions.md:142`) requires it before a merge to `main`. One of them should give way.

15. **note**: Two backlog items will need new decisions when they are taken up:
    - `docs/plans/README.md:15` (solved Puzzles keep showing the solution) goes against 0015's why, "Once a Puzzle is solved its Board tells nothing more" (`decisions.md:188`).
    - `docs/plans/README.md:18` (GitHub Pages "is only for testing") goes against 0010, which makes the root of the Pages site production.

    Neither needs changing now.

The index lists every entry, 0001–0013 and 0015, once each, under a fitting category, in number order and with matching titles. The other claims hold:
- 0002: 13 Atoms for Alanine.
- 0006: development-only dependencies, esbuild, `dist/` ignored.
- 0007: happy-dom, fakes in `app.test.js`, both viewports.
- 0008: `puzzles.test.js` checks one solution, the one shown.
- 0009: `scripts/publish-pages.sh`.
- 0012: Ajv checks Puzzles, `game.board()` and stored Progress; the hand check in `progress.js` is tested against the schema.
