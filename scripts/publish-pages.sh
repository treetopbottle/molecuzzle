#!/usr/bin/env bash
# Publishes a build to the gh-pages branch, which GitHub Pages serves:
# the default branch at the root, every other branch in branches/<name>/.
#
#   scripts/publish-pages.sh publish <branch> <dir>   copy <dir> to the branch's folder
#   scripts/publish-pages.sh remove <branch>          delete the branch's folder
#
# Only the branch's own folder changes, so builds of different branches can
# run at the same time: when a push loses a race, it starts again from the
# new gh-pages.
set -euo pipefail

action=${1:?usage: publish-pages.sh publish <branch> <dir> | remove <branch>}
branch=${2:?branch name missing}
src=${3:-}
default_branch=${DEFAULT_BRANCH:-main}
remote=${REMOTE:-origin}

slug=$(printf '%s' "$branch" | tr -c 'A-Za-z0-9._-' '-')
if [ "$branch" = "$default_branch" ]; then target=""; else target="branches/$slug"; fi
[ "$action" = remove ] && [ -z "$target" ] && { echo "won't remove the default branch's build" >&2; exit 1; }
[ "$action" = publish ] && [ ! -d "$src" ] && { echo "no build in '$src'" >&2; exit 1; }
[ -n "$src" ] && src=$(cd "$src" && pwd)

worktree=$(mktemp -d)
trap 'git worktree remove --force "$worktree" 2>/dev/null || true; rm -rf "$worktree"; git branch -q -D "gh-pages-$$" 2>/dev/null || true' EXIT

# Writes branches/index.html: a list of the branch builds.
list_branches() {
  mkdir -p branches
  {
    echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    echo '<title>Molecuzzle branches</title>'
    echo '<style>body{font:16px/1.6 system-ui,sans-serif;max-width:40em;margin:2em auto;padding:0 16px}</style>'
    echo '<h1>Molecuzzle branch builds</h1><p><a href="../">main</a></p><ul>'
    for d in branches/*/; do
      [ -d "$d" ] || continue
      name=$(basename "$d")
      echo "<li><a href=\"$name/\">$name</a></li>"
    done
    echo '</ul>'
  } > branches/index.html
}

for attempt in 1 2 3 4 5; do
  git worktree remove --force "$worktree" 2>/dev/null || true
  rm -rf "$worktree"
  if git fetch --quiet --depth 1 "$remote" gh-pages 2>/dev/null; then
    git worktree add --quiet --detach "$worktree" FETCH_HEAD
  else
    git worktree add --quiet --detach "$worktree"
    git -C "$worktree" switch --quiet --orphan "gh-pages-$$"
    git -C "$worktree" rm -rfq --ignore-unmatch .
  fi

  (
    cd "$worktree"
    if [ -z "$target" ]; then
      # The default branch: replace everything except the branch builds.
      find . -mindepth 1 -maxdepth 1 ! -name .git ! -name branches -exec rm -rf {} +
      cp -R "$src"/. .
    else
      rm -rf "$target"
      if [ "$action" = publish ]; then mkdir -p "$target" && cp -R "$src"/. "$target"; fi
    fi
    touch .nojekyll
    list_branches
    git add -A
    if git diff --cached --quiet; then echo "gh-pages already up to date"; exit 0; fi
    git -c user.name="github-actions[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
      commit --quiet -m "$action ${target:-/} from $branch"
    git push --quiet "$remote" HEAD:refs/heads/gh-pages
  ) && { echo "gh-pages: $action ${target:-/} from $branch"; exit 0; }

  echo "push failed (attempt $attempt), trying again" >&2
  sleep $((attempt * 2))
done
echo "could not update gh-pages" >&2
exit 1
