# Review of step 12 of plan 02: Screenshots, fourth round

Commits reviewed: 89343c7 (docs: review the fixes of step 12 of plan 02 a third time), 0c255c4 (fix: --user only for a plain rootful Docker daemon, read from docker info (third review of step 12)) and 8bb6806 (docs: add the outcome of the third review of step 12); `git log --oneline b8ea384..HEAD`.

What was checked:

- **The checks pass at HEAD.** In a separate worktree at 8bb6806, `npm install`, then `CHROMIUM_PATH=/usr/bin/chromium npm run check`. It passed: the build; 156 unit tests in 13 files; 31 end-to-end tests, plus the existing touch-only skip of Layout.02 on desktop; 9 screenshot tests in Podman with `mcr.microsoft.com/playwright:v1.65.0-noble`. So Podman, the default, still works. During `test:screenshots`, `dist/index.html: 30.8 kB` was printed once, by the host build. Every file in the worktree was owned by the user. The container wrote only `test-results/.last-run.json`, which is ignored. The worktree was removed.
- **The Docker branch, `scripts/screenshots.sh:19-26`, against a stub `docker`** (Docker isn't installed here), with `CONTAINER=docker`:
  - Rootful, `Ubuntu 24.04.1 LTS [name=apparmor name=seccomp,profile=builtin name=cgroupns]`: `--user 1000:1000`. Right.
  - Rootless, `... name=rootless ...`: no `--user`. Right.
  - userns-remap, `... name=userns ...`: no `--user`. Right.
  - Docker Desktop, `Docker Desktop [...]`: no `--user`. Right.
  - Empty stdout and a non-zero status, like a template error from Podman's docker shim: no `--user`. Right.
  - `docker` not on PATH: the `2>/dev/null || true` hides the info error. `exec docker run` then fails with `exec: docker: not found`, status 127. Right.
  - Daemon down: see finding 1.
- **Under `set -eu`.** `info=$(... 2>/dev/null || true)` always succeeds, so `set -e` doesn't end the script when `docker info` fails. `info` is assigned before the `case`, and `user` at line 19, so `set -u` isn't involved. The `case` patterns are quoted where they need to be. The `shellcheck disable=SC2086` comment still covers the unquoted `$user`.
- **The Outcome against 0c255c4.**
  1. "`--user` only for a plain rootful daemon; Docker Desktop is left out by its `OperatingSystem`": the single `docker info --format '{{.OperatingSystem}} {{.SecurityOptions}}'` at line 21, with `*"Docker Desktop"*` at line 23. It matches.
  2. "rootless, `userns` and an unreadable `docker info` get no `--user`, and the comment says which setups are which": line 23 covers rootless and `userns`, and lines 15-18 name the setups. That matches, except for "no daemon". See finding 1.

## Findings

1. **note**: `scripts/screenshots.sh:18` and Outcome 2. "If docker info can't be read (... no daemon), no --user" is probably not true for the real Docker CLI when the daemon is down. In that case the run still fails, just with `--user`.
   - With a custom `--format`, the Docker CLI doesn't drop the server part of `docker info` when it can't reach the daemon. It keeps an empty `system.Info`, so the template doesn't fail. The template then renders an empty `OperatingSystem` and an empty `SecurityOptions`, and stdout is ` []`, not empty.
   - ` []` matches none of the patterns at line 23, so `--user` is added. With the stub printing ` []`, the branch did add `--user 1000:1000`.
   - This comes from reading the Docker CLI source (`cli/command/system/info.go`), not from a run: Docker isn't installed here.
   - It changes nothing in practice. With no daemon, `exec docker run` fails anyway with Docker's own error and a non-zero status, so `npm run check` fails as it should. Only the comment and Outcome 2 say more than the code does.
   - Possible fix: limit the comment's "can't be read" case to Podman's docker shim and to a missing `docker`, or say that `--user` doesn't matter when there is no daemon.

## Outcome

1. Fixed: the comment names Podman's docker shim and a missing `docker` as the cases with no `--user`, and says that with no daemon the run fails either way (0c6bb21). This line corrects "no daemon" in Outcome 2 of the third review. Only a comment changed.
