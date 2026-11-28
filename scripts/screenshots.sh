#!/bin/sh
# Runs the screenshot tests, Playwright's `screenshots` project, in Playwright's
# image for the installed @playwright/test, so the pixels are the same on every
# machine (decision 0013). Uses Podman, or Docker with CONTAINER=docker.
# Arguments pass on to Playwright, e.g. --update-snapshots.
#
# The page is built here, on the host: the container shares node_modules, and
# esbuild's binary is the host's. MOLECUZZLE_SCREENSHOTS=1 tells the Playwright
# config to define the screenshots project and not to build.
set -eu
cd "$(dirname "$0")/.."
engine=${CONTAINER:-podman}
version=$(node -p 'require("@playwright/test/package.json").version')
node scripts/build.ts
# A plain rootful Docker daemon would write root-owned files into the repo, so
# it runs as this user. Everywhere else the container's root already writes as
# this user: Podman, rootless Docker, Docker Desktop. With userns-remap neither
# works. If docker info can't be read (Podman's docker shim, no docker), no
# --user; with no daemon, the run fails either way.
user=""
if [ "$engine" = docker ]; then
  info=$(docker info --format '{{.OperatingSystem}} {{.SecurityOptions}}' 2>/dev/null || true)
  case "$info" in
    "" | *"Docker Desktop"* | *rootless* | *userns*) ;;
    *) user="--user $(id -u):$(id -g)" ;;
  esac
fi
# shellcheck disable=SC2086 # $user is empty or two words on purpose
exec "$engine" run --rm --platform linux/amd64 --ipc=host $user \
  -e MOLECUZZLE_SCREENSHOTS=1 -e HOME=/tmp \
  -v "$PWD:/work:z" -w /work \
  "mcr.microsoft.com/playwright:v$version-noble" \
  npx playwright test --project screenshots "$@"
