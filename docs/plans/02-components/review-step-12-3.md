# Review of step 12 of plan 02: Screenshots, third round

Commits reviewed: 6805805 (fix: --user only for rootful Docker, a specific variable for the screenshots project, and a shared SELinux label), 213b277 (docs: the screenshots script builds on the host and sets MOLECUZZLE_SCREENSHOTS, in plan 02's Design) and b8ea384 (docs: add the outcome of the second review of step 12); `git log --oneline 33263d4..HEAD`.

What was checked:

- **The checks pass at HEAD.** In a separate worktree at b8ea384, `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check`. It passed: the build; 156 unit tests in 13 files; 31 end-to-end tests, plus the existing touch-only skip of Layout.02 on desktop; 9 screenshot tests in Podman with `mcr.microsoft.com/playwright:v1.65.0-noble`. `dist/index.html: 30.8 kB` was printed once during `test:screenshots`, by the host build, so the container didn't build. Nothing under `docs/spec/screenshots/` changed.
- **The `screenshots` project exists only with `MOLECUZZLE_SCREENSHOTS=1`.** On the host, in the worktree:
  - `npx playwright test --project screenshots` was refused: `Error: Project(s) "screenshots" not found. Available projects: "desktop", "phone"`. The same happened with `MOLECUZZLE_SCREENSHOTS=true` and with the old `SCREENSHOTS=1`.
  - `npx playwright test screenshots` was refused with `Error: No tests found.`
  - `MOLECUZZLE_SCREENSHOTS=1 npx playwright test --project screenshots --list` lists the 9 tests, so the opt-in still works.
  - `npx playwright test --update-snapshots` ran the 32 desktop and phone tests (31 passed, 1 skipped). Afterwards, `git status --short --ignored` showed only `dist/`, `node_modules/` and `test-results/`. `docs/spec/screenshots/` wasn't touched.
- **No stale references.** `git grep` at HEAD finds `SCREENSHOTS` only as `MOLECUZZLE_SCREENSHOTS`, in `playwright.config.js:7,11`, `scripts/screenshots.sh:8,23` and `docs/plans/02-components/README.md:52`. The review files aren't counted. The old `:Z` doesn't appear anywhere.
- **Outcome lines against the commits.**
  1. In 6805805, `scripts/screenshots.sh:18-20` passes `--user` only when `CONTAINER=docker` and `docker info --format '{{.SecurityOptions}}'` doesn't contain `rootless`. The comment at lines 16-17 is right: rootless Docker maps the container's root to the user, as rootless Podman does. It matches, but see findings 1 and 2.
  2. 6805805 renames the variable at `playwright.config.js:11` (`process.env.MOLECUZZLE_SCREENSHOTS === "1"`) and at `scripts/screenshots.sh:23`. The comment at `playwright.config.js:7-10` now says that a run elsewhere can set it on purpose. It matches, as checked above.
  3. 213b277 adds to `docs/plans/02-components/README.md:52` that the script builds `dist/` on the host first, because the container shares `node_modules`, and that it sets `MOLECUZZLE_SCREENSHOTS=1`, which defines the `screenshots` project and skips the build. That is the contract the config implements. It matches.
  4. `scripts/screenshots.sh:24` is `-v "$PWD:/work:z"`. It matches. Podman ran with it here without a problem.
- **The Docker branch under `set -eu`, read only, since Docker isn't installed.**
  - The test is the condition of an `if`, so `set -e` doesn't apply to it.
  - Without `pipefail`, which this `sh` script doesn't set, the pipeline's status is `grep`'s. `grep -q` exiting early and sending SIGPIPE to `docker info` doesn't matter.
  - If `docker info` fails, because the daemon is down or `docker` is missing, it prints its error to stderr and nothing to stdout. Then `grep -q` fails, `!` makes the test true, and `--user` is added. `exec docker run` then fails with its own error and a non-zero status, so `npm run check` fails as it should. The only cost is that the error is printed twice. `set -u` isn't involved: `user` is always set at line 15.
  - Rootful Docker: `SecurityOptions` is something like `[name=apparmor name=seccomp,profile=builtin name=cgroupns]`, with no `rootless`, so `--user` is passed. That is right.
  - Rootless Docker: `SecurityOptions` contains `name=rootless`, so `--user` is skipped and the container's root writes as the user. That is right.
  - Docker Desktop: see finding 1.
- **Decision 0013 still matches**: only in the image, tagged with the installed `@playwright/test`, `linux/amd64`, Podman or Docker. The README's Development section is still correct.
- **Cleanup.** After the run, every file in the worktree was owned by the user. The container wrote only `test-results/.last-run.json`, which is ignored. `git worktree remove --force` deleted the worktree.

## Findings

1. **should fix**: `scripts/screenshots.sh:18`. On Docker Desktop for Linux, the test probably still passes `--user`, and the run then fails the same way rootless Docker did in finding 1 of the second review.
   - Docker Desktop's daemon runs as root inside its VM, so `SecurityOptions` has no `rootless` and `--user "$(id -u):$(id -g)"` is added.
   - Docker Desktop for Linux shares host folders with a user-namespace mapping: the host user is root in the container, and other container uids map to subordinate uids. So the mounted repo appears owned by root (755), and the `--user 1000:1000` process can't create `test-results/` or write the PNGs.
   - This is from Docker's documentation of Docker Desktop for Linux file sharing, not from a run. Docker isn't installed here. It also contradicts the second review's statement that Docker Desktop on Linux is unaffected.
   - On macOS and Windows, Docker Desktop writes to shared folders as the host user whatever the container uid is, so `--user` isn't needed there either.
   - Possible fix: also skip `--user` when `docker info --format '{{.OperatingSystem}}'` is `Docker Desktop`. That is harmless on every Docker Desktop. Another option: a single `docker info --format '{{.OperatingSystem}} {{.SecurityOptions}}'`, checked for either word.
2. **note**: `scripts/screenshots.sh:18`. In two other setups the test passes `--user` even though it can't help. Neither is a regression for most users, but the comment at lines 16-17 implies every case is covered.
   - `CONTAINER=docker` with Podman's `docker` shim (podman-docker): `podman info` has no `.SecurityOptions` field, so the template fails and `grep` sees nothing. `--user` is then added, and under rootless Podman the repo can't be written: the same failure as finding 1 of the second review. The default `CONTAINER=podman` avoids this, so it is only a trap for someone who aliases Docker to Podman.
   - Rootful Docker with `userns-remap` (`name=userns` in `SecurityOptions`): the container's uids map to subordinate uids with or without `--user`, so the repo can't be written either way. This was already so before 6805805.

## Outcome

1. Fixed: `--user` only when `docker info` shows a plain rootful daemon; Docker Desktop is left out by its `OperatingSystem` (0c255c4).
2. Fixed: rootless, `userns` and an unreadable `docker info` (Podman's docker shim, no daemon) get no `--user`, and the comment says which setups are which (0c255c4). Docker isn't installed here: the branch ran with a stub `docker` printing each setup's info, and gave `--user` only for the plain rootful one.
