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
node scripts/build.js
user=""
# Rootful Docker would write root-owned files into the repo; rootless Docker,
# like rootless Podman, maps the container's root to this user already.
if [ "$engine" = docker ] && ! docker info --format '{{.SecurityOptions}}' | grep -q rootless; then
  user="--user $(id -u):$(id -g)"
fi
# shellcheck disable=SC2086 # $user is empty or two words on purpose
exec "$engine" run --rm --platform linux/amd64 --ipc=host $user \
  -e MOLECUZZLE_SCREENSHOTS=1 -e HOME=/tmp \
  -v "$PWD:/work:z" -w /work \
  "mcr.microsoft.com/playwright:v$version-noble" \
  npx playwright test --project screenshots "$@"
