#!/bin/sh
# Runs the screenshot tests, Playwright's `screenshots` project, in Playwright's
# image for the installed @playwright/test, so the pixels are the same on every
# machine (decision 0013). Uses Podman, or Docker with CONTAINER=docker.
# Arguments pass on to Playwright, e.g. --update-snapshots.
set -eu
cd "$(dirname "$0")/.."
version=$(node -p 'require("@playwright/test/package.json").version')
exec "${CONTAINER:-podman}" run --rm --platform linux/amd64 --ipc=host \
  -v "$PWD:/work" -w /work \
  "mcr.microsoft.com/playwright:v$version-noble" \
  npx playwright test --project screenshots "$@"
