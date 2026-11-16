# Review of step 12 of plan 02: Screenshots, second round

Commits reviewed: b078266 (fix: build the page on the host for the screenshots, and define their project only in Playwright's image), 062bd19 (docs: the screenshots image takes the version of the installed @playwright/test) and a4023f7 (docs: add the outcome of the review of step 12); `git log --oneline 09212ab..HEAD`.

What was checked:

- **Checks pass at HEAD.** In a separate worktree at a4023f7, `npm install` and then `CHROMIUM_PATH=/usr/bin/chromium npm run check`. It passed: the build, 156 unit tests, 31 end-to-end tests (plus the existing touch-only skip of Layout.02 on desktop), and 9 screenshot tests in Podman with `mcr.microsoft.com/playwright:v1.65.0-noble`. Nothing under `docs/spec/screenshots/` changed.
- **The container builds nothing and needs no native binary.** During `test:screenshots`, `dist/index.html: 30.8 kB` is printed once, by the host build at `scripts/screenshots.sh:14`. The container doesn't print it, so `globalSetup` was skipped. Everything the container loads is plain JavaScript:
  - `@playwright/test` depends only on `playwright`, which depends only on `playwright-core`, which has no dependencies.
  - The config imports only `@playwright/test`.
  - `screenshots.spec.js` imports `@playwright/test` and `./helpers.js`. `helpers.js` imports `node:url`, `node:path`, `@playwright/test`, `src/puzzle/puzzles.js` and `src/storage/progress.js`, and the last two import nothing.
  - `ajv` (`tests/helpers/schemas.js`) is used only by `progress.spec.js`, which isn't in the `screenshots` project.
  - The `.node` binaries in `node_modules` (lightningcss, rolldown) belong to Vitest, which the container doesn't run.
- **The `screenshots` project exists only with `SCREENSHOTS=1`.** On the host, in the worktree:
  - `npx playwright test --project screenshots`: refused with `Error: Project(s) "screenshots" not found. Available projects: "desktop", "phone"`.
  - `npx playwright test screenshots`: refused, no test files matched.
  - `npx playwright test --update-snapshots`: ran the 32 desktop and phone tests. Afterwards `git status --short --ignored` showed only `dist/`, `node_modules/` and `test-results/`, so `docs/spec/screenshots/` was untouched. The desktop project ignores `screenshots.spec.js`, and no other spec calls `toHaveScreenshot`.
- **`npm run test:e2e` runs the same tests as before.** `npx playwright test --list` with HEAD's config, and `--project desktop --project phone --list` with 09212ab's config, sorted, are identical (32 tests in 7 files).
- **Outcome lines against the commits.**
  1. b078266 builds on the host (`scripts/screenshots.sh:14`) and sets `globalSetup` to `undefined` under `SCREENSHOTS` (`playwright.config.js:15`). It matches. The arm machine wasn't tried, but by the dependency check above nothing native is left in the container.
  2. It matches, as checked above.
  3. 062bd19 changes `docs/plans/02-components/README.md:52` to "the version of the installed `@playwright/test`". It matches.
  4. `tests/e2e/screenshots.spec.js:14` is now "Page.01 Puzzle 11 solved". It matches.
  5. `scripts/screenshots.sh:17-21` adds `--user` for Docker only, `-e HOME=/tmp` and `:Z`. It matches what the Outcome says, but see finding 1.
- **Decision 0013 still matches.** The tests run only in the image, tagged with the installed `@playwright/test` version, as `linux/amd64`, in Podman or Docker. The Cost's "on an arm machine the image runs emulated" now holds, because the container no longer depends on the host's esbuild. Building on the host doesn't make the pixels depend on the host, since esbuild gives the same output for the same version. The README's Development section is still correct (`test:e2e` "builds first"; `test:screenshots` "in Playwright's image").
- **The Docker branch**, read only, since Docker isn't installed here.
  - With rootful Docker, `--user "$(id -u):$(id -g)"` plus `HOME=/tmp` does what finding 5 of the first review asked: files are owned by the user, and npm and npx get a writable home.
  - Playwright's browsers are at `/ms-playwright` (`PLAYWRIGHT_BROWSERS_PATH` in the image), so changing `HOME` doesn't hide them.
  - `npx` finds `playwright` in `node_modules/.bin`, so it downloads nothing.
  - Rootless Docker breaks; see finding 1.
- **Cleanup.** The container wrote only `test-results/.last-run.json` in the worktree, owned by the user under rootless Podman. `git worktree remove` deleted the worktree and everything in it.

## Findings

1. **should fix**: `scripts/screenshots.sh:17` (and the comment at line 16). `--user "$(id -u):$(id -g)"` assumes Docker runs rootful. With rootless Docker, the container's root is mapped to the host user, and container uid 1000 is mapped to a subordinate uid such as 100999.
   - In the container, the mounted repo (owned by the host user, 755) then appears owned by root. The `--user` process is "other" there and can't write to it.
   - Playwright can't create `test-results/`, and `--update-snapshots` can't write the PNGs, so the run fails.
   - Before b078266, rootless Docker worked the way rootless Podman does. This is a regression for that setup, and the fix for finding 5 caused it.
   - This couldn't be run, since Docker isn't installed here. The behaviour follows from how rootless Docker maps uids.
   - Possible fix: pass `--user` only when Docker isn't rootless. For example, skip it when `docker info --format '{{.SecurityOptions}}'` contains `rootless`.
   - Docker Desktop on macOS, Windows or Linux shares files through its VM, so any container uid can write there and is unaffected.
2. **note**: `playwright.config.js:7-11`. The guard is `Boolean(process.env.SCREENSHOTS)`.
   - Any non-empty value turns it on, including `SCREENSHOTS=0` or `false`.
   - The name is generic. If a host shell has `SCREENSHOTS` set for some other reason, `npm run test:e2e` stops building `dist/` (it tests a stale or missing build) and adds the screenshots project with the host's browser.
   - So the comment's "no other run can compare or remake the screenshots with another browser" overstates the guard. A deliberate `SCREENSHOTS=1 npx playwright test --project screenshots --update-snapshots` on the host would still rewrite `docs/spec/screenshots/`.
   - That takes an explicit opt-in, so it is much safer than before. Still, a more specific name (or `=== "1"`) and a softer comment would match what the code guarantees.
3. **note**: `docs/plans/02-components/README.md:52`. The Design still describes the script only as running `playwright test --project screenshots` in the image. It leaves out two parts of the new contract between `scripts/screenshots.sh` and `playwright.config.js`:
   - the script builds `dist/` on the host first;
   - it sets `SCREENSHOTS=1`, the only way the `screenshots` project is defined and the setting that skips `globalSetup`.

   The code comments say this, but the plan doesn't. 062bd19 fixed only the version wording in the same sentence.
4. **note**: `scripts/screenshots.sh:21`, `:Z`, on a host without SELinux.
   - Podman: it ran with `:Z` here, on Arch, without a problem.
   - Docker: it skips the relabel when SELinux is disabled.
   - Docker Desktop: the option goes to a daemon in a VM without SELinux, which ignores it.
   - Podman machine on macOS (a VM with SELinux, the repo shared from the host): Podman should skip the relabel where the shared filesystem doesn't support labels, but this wasn't checked.

   On SELinux hosts, `:Z` gives the whole repo, including `node_modules/` and `.git/`, a label private to this one container. A new container gets a new label, so every run relabels every file again. Meanwhile, any other container that mounts the repo, such as a dev container or a second run in parallel, loses access to it. `:z` (a shared label, set once) is the usual choice for a source tree. Either option fixes what finding 5 of the first review reported.
