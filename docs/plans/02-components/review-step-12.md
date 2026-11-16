# Review of step 12 of plan 02: Screenshots

Commits reviewed: b37074d (test: compare the page with the screenshots of ui.md, in Playwright's image) and f20fb59 (feat: the screenshots of ui.md, made in Playwright's image); `git log --oneline c8ab985..HEAD`.

What was checked:

- **Tests commit fails as expected.** At b37074d, in a separate worktree with `npm install`, `scripts/screenshots.sh --update-snapshots=none` ran in Podman with `mcr.microsoft.com/playwright:v1.65.0-noble`. 8 tests failed with "A snapshot doesn't exist at /work/docs/spec/screenshots/<name>.png", one per screenshot, and nothing was written there. Board.03 (reduced motion) passed at once.
- **Checks pass at HEAD.** At f20fb59, in a separate worktree, `CHROMIUM_PATH=/usr/bin/chromium npm run check` passed: build, 156 unit tests, 31 end-to-end tests (plus the existing touch-only skip of Layout.02 on desktop), and 9 screenshot tests in the container.
- **Cleanup.** Both worktrees are removed. The container wrote only inside them (`dist/`, `test-results/`, owned by the user under rootless Podman), so nothing it wrote is left.
- **Rule ids.** Each id the step names has a test: Page.01 (page-start, page-solved), Layout.01 (page-phone at 390×844, with `isMobile` and `hasTouch`), Board.01–02 (board), Board.03 (the reduced-motion test, which also checks that the pulse comes back under no-preference, so it can't pass vacuously), Input.03 (actions), Panel.02 and Panel.04 (panel-mystery), Panel.03 (panel-solved) and List.01 (list). Each test sets up the state of ui.md's example, at 1280×800.
- **Each PNG against ui.md.**
  - page-start: Water, no Bonds, "Solved 0 of 13", ‹ disabled, the empty status text.
  - page-solved: Glycine solved, every Atom glowing with no badge, the green status, the name, C₂H₅NO₂ with subscripts, the fact, "Next puzzle →", and 11 ✓ in the list.
  - page-phone: the Board above the panel, no sideways overflow.
  - board: Formaldehyde with C═O drawn as two lines, O glowing with no badge, H white, C dark grey, dotted lines, orange badges 1/2/1.
  - actions: all three buttons enabled.
  - panel-mystery: Puzzle 3 of 13, Unsolved, "?", the hint, the five rules.
  - panel-solved: Glycine, formula, fact, Next puzzle.
  - list: 1 ✓, 3 marked.
  - All of them match their rule and example.
- **Design.** Matches, apart from findings 1 and 3:
  - The script reads the version for the image, runs `--platform linux/amd64`, mounts the repo, uses Podman or Docker with `CONTAINER=docker`, and passes arguments on (`--update-snapshots=none` reached Playwright).
  - The `screenshots` project has `snapshotPathTemplate` `docs/spec/screenshots/{arg}{ext}` and `expect: { toHaveScreenshot: { threshold: 0.2, maxDiffPixels: 0 } }`.
  - `npm run check` runs the screenshots after `test:e2e`.
- **Decision 0013 and the README.** Decision 0013 matches the code. The README's Development names Podman or Docker, `test:screenshots`, `CONTAINER=docker`, how to remake the screenshots, and that Check includes them. "Where things are" names `screenshots.sh`.

## Findings

1. **should fix**: `scripts/screenshots.sh:10` (and decision 0013's Cost, `docs/decisions.md:178`). The container runs on the host's `node_modules`, and Playwright's `globalSetup` (`tests/e2e/build.js`) runs `scripts/build.js`, which imports esbuild. esbuild's native binary is a per-platform optional dependency: this host has only `node_modules/@esbuild/linux-x64`. On any other host (macOS, Windows, or Linux on arm64), `npm install` installs a different `@esbuild/*`. In the `linux/amd64` container esbuild then can't find `@esbuild/linux-x64` and the build fails before any test runs. So `npm run test:screenshots` and `npm run check` work only on x86_64 Linux. Decision 0013 implies an arm machine works ("runs emulated, and slowly"), so this contradicts it. Only this host could be checked, but the cause is visible in `node_modules`. Possible fixes:
   - give the container its own `node_modules` (for example a named volume over `/work/node_modules` with `npm ci` in the image);
   - or build `dist/` on the host and skip `globalSetup` in the container.
2. **should fix**: `package.json:8`, `playwright.config.js:14-22` (the `test:e2e` change). Keeping the host off the `screenshots` project by listing `--project desktop --project phone` in `test:e2e` works for the npm scripts. It doesn't change which tests `test:e2e` runs, so it isn't an interface change. But "which only this script runs" (the Design, and the comment at `playwright.config.js:16`) is still only a convention:
   - A bare `npx playwright test`, or `npx playwright test screenshots`, on the host runs the project with the host's Chromium and fails 8 tests.
   - `npx playwright test --update-snapshots` on the host would overwrite `docs/spec/screenshots/*.png` with host-rendered pixels, which is what 0013 exists to prevent. Only the diff review would catch it.
   - Any project added later must also be added to the `test:e2e` list, or `npm run check` silently skips it.

   A config-level guard holds for every invocation: define the `screenshots` project only when the script says so (for example `-e SCREENSHOTS=1` in `screenshots.sh`, and `...(process.env.SCREENSHOTS ? [screenshotsProject] : [])`). `test:e2e` could then stay `playwright test`.
3. **note**: `scripts/screenshots.sh:8` reads the version of the installed `@playwright/test` (`require("@playwright/test/package.json").version`). The Design (`docs/plans/02-components/README.md:52`) says "read from `package.json`". The script's choice is the right one: `package.json` holds the range `^1.65.0`, which can't name an image tag, and the installed version is what decision 0013 means by "tagged with the version of `@playwright/test`". The plan's wording is what is off.
4. **note**: `tests/e2e/screenshots.spec.js:14`. The page-solved test is named "Page.01, Board.03, Panel.03". ui.md gives that screenshot as the example of Page.01 only. The plan's convention is that a test takes the ids of the rules it is about, not of everything it shows on the way.
   - Board.03 is misleading here: a still image can't show the pulse, and `toHaveScreenshot` disables animations by default. Board.03 has its own test at line 53.
   - Panel.03 has its own screenshot (line 41).

   It should be "Page.01 Puzzle 11 solved".
5. **note**: `scripts/screenshots.sh:9-10`.
   - With `CONTAINER=docker` on Linux (rootful Docker), the container runs as root. Files it creates on the mounted repo are owned by root: `test-results/` on every run, a new `dist/`, and new PNGs from `--update-snapshots`. A later host run may then be unable to clean or rewrite them. Passing `--user "$(id -u):$(id -g)"` (with a writable `HOME`) for Docker avoids this. Rootless Podman, as on this host, maps the files to the user. Docker wasn't run.
   - On SELinux hosts (Fedora and its relatives), Podman needs `:Z` on the `-v` mount, or the container can't read `/work`.

## Outcome

1. Fixed: `scripts/screenshots.sh` builds `dist/` on the host and the container skips `globalSetup`, so the container needs no native binary from `node_modules` and decision 0013's emulated arm machine holds; the screenshots still match (b078266).
2. Fixed: the `screenshots` project exists only with `SCREENSHOTS=1`, which the script sets in the container; on the host `npx playwright test --project screenshots` is refused, and `test:e2e` is plain `playwright test` again (b078266).
3. Fixed: the plan says the image takes the version of the installed `@playwright/test` (062bd19).
4. Fixed: "Page.01 Puzzle 11 solved" (b078266).
5. Fixed: with `CONTAINER=docker` the container runs as the user, with `HOME=/tmp`, and the mount has `:Z`; Docker wasn't run here (b078266).
