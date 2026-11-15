# Decisions

Any decision made about the project.

One short entry per decision. Don't renumber or rewrite: mark one `Superseded by NNNN` instead. An open question is `Undecided`. Make sure to add each entry to the index, under its category. Entries stay in number order below the index.

## Index

### Game

What the Player does and what the rules are.

- [0001: A simplified valence model](#0001)
- [0002: Every hydrogen is an Atom on the Grid](#0002)
- [0003: All Puzzles are open](#0003)
- [0004: Show solution doesn't solve a Puzzle](#0004)
- [0008: Every Puzzle has exactly one solution](#0008)
- [0015: Every Puzzle in progress is kept, until it is solved or reset](#0015)

### Technical

How the code and its data are built.

- [0005: Progress lives in the browser](#0005)
- [0006: ES modules, built into one HTML file](#0006)
- [0011: Four components, wired in one place](#0011)
- [0012: Schemas as JSON files, checked by the tests](#0012)

### Testing and publishing

How changes are checked and shared.

- [0007: Vitest for rules and components, Playwright for the UI](#0007)
- [0009: A GitHub Pages build per branch, from a gh-pages branch](#0009)
- [0010: Failing checks block production, not branch builds](#0010)
- [0013: Screenshots in the spec, made in a container](#0013)

<a id="0001"></a>
## 0001: A simplified valence model

Accepted (2026-11-10)

Each Element has one valence, the number of Bonds it needs; there are no charges, ions or lone pairs.

- **Why:** a Player can learn the rule in a minute ("C needs 4"), and the badge on each Atom shows how many it still needs.
- **Cost:** Molecules that need formal charges can't be Puzzles: carbon monoxide, nitric acid, nitro groups, salts. Puzzles are chosen to fit.
- **Alternatives:** formal charges and lone pairs: closer to real chemistry, but much harder to show and to reason about.

<a id="0002"></a>
## 0002: Every hydrogen is an Atom on the Grid

Accepted (2026-11-10)

Every H is an Atom on the Grid that the Player bonds, instead of hydrogens being implied as in skeletal formulas.

- **Why:** the puzzle is "every Atom gets exactly its Bonds"; an H can take only one, so it is part of what the Player reasons from, and hiding it would hide part of the puzzle.
- **Cost:** bigger Grids (13 Atoms for Alanine), which limits how big a Molecule can be, especially on a phone.
- **Alternatives:** implicit hydrogens: smaller Grids, but each Atom would need its H count shown, and fewer Bonds would be left to reason about.

<a id="0003"></a>
## 0003: All Puzzles are open

Accepted (2026-11-10)

No Puzzle is locked; the order, easiest first, only suggests a path.

- **Why:** a stuck Player can skip ahead, and someone who knows the basics can jump in.
- **Cost:** less sense of progression.
- **Alternatives:** unlock one by one: frustrating, and the Show solution button undercuts it anyway.

<a id="0004"></a>
## 0004: Show solution doesn't solve a Puzzle

Accepted (2026-11-15)

Show solution shows the answer on the Board and changes nothing in Progress: an unsolved Puzzle stays unsolved, until the Player clicks Reset and builds it.

- **Why:** a stuck Player can learn from the answer and still solve every Puzzle, while ✓ still means "built it myself".
- **Cost:** Progress doesn't tell which Puzzles were solved only after seeing the solution.
- **Alternatives:** a "Solution seen" mark: an extra state to show and store, and a mark that stays on Puzzles the Player solved afterwards. Counting it as solved: ✓ means nothing. No solution button: Players get stuck.

<a id="0005"></a>
## 0005: Progress lives in the browser

Accepted (2026-11-10)

Progress is kept in `localStorage`, in the format of [Progress](spec/schemas.md#progress); the game works without it.

- **Why:** no server or accounts; the built file opens from disk ([0006](#0006)).
- **Cost:** Progress is per browser and device, and goes when site data is cleared.
- **Alternatives:** a server with accounts: hosting and personal data for a small game.

<a id="0006"></a>
## 0006: ES modules, built into one HTML file

Accepted (2026-11-11)

The code is plain JavaScript in ES modules in `src/`; `npm run build` bundles them with esbuild and inlines the bundle and CSS into `dist/index.html`. Dependencies are for development only.

- **Why:** modules are components with small interfaces that tests import directly; the built file still opens from disk, offline, with no server.
- **Cost:** a build step and Node.js to develop; `dist/` isn't in git, so playing needs a build.
- **Alternatives:** loading `src/` as modules in the browser: needs a server, since browsers don't load modules from `file://`. A framework: more than the page needs.

<a id="0007"></a>
## 0007: Vitest for rules and components, Playwright for the UI

Accepted (2026-11-11)

Rules and components (`board.js`, `puzzle-list.js` in happy-dom) are tested with Vitest; the built page with Playwright in Chromium, at 1280×800 and, for layout, 390×844. Expected results are inline snapshots: the Board drawn as text (`tests/helpers/draw.js`) and accessibility snapshots of the page. A test's name starts with the rule ids it covers.

- **Why:** inline snapshots read like the spec's examples; testing the page through roles and names also keeps the Board usable with a screen reader and keys.
- **Cost:** two test runners; Playwright needs a Chromium download or `CHROMIUM_PATH`.
- **Alternatives:** `node:test`: no inline snapshots. Only Playwright: slower, and rules are hard to reach through the page.

<a id="0008"></a>
## 0008: Every Puzzle has exactly one solution

Accepted (2026-11-11)

A solver (`src/solver.js`) counts the solutions of a Grid; a test checks each Puzzle has exactly one, and that it is the one Show solution shows. Any Board where every Atom is complete and all join up is then that solution, so the game doesn't compare Molecules.

- **Why:** a logic puzzle needs one answer to reason towards; with it, the game never has to match the Board against a Molecule.
- **Cost:** some Molecules can't be Puzzles: any ring of alternating Bonds, such as Benzene, has two solutions.
- **Alternatives:** accept any valid Board and name it: back to matching Molecules, and Puzzles with many answers.

<a id="0009"></a>
## 0009: A GitHub Pages build per branch, from a gh-pages branch

Accepted (2026-11-11)

GitHub Actions builds every push, and `scripts/publish-pages.sh` commits the build to the `gh-pages` branch: `main` at the root, other branches in `branches/<name>/`. Pages serves that branch.

- **Why:** anyone can try a branch from a link, without installing anything; every branch that builds is published, so work in progress can be tried too.
- **Cost:** a `gh-pages` branch that grows with every publish, and our own script to keep it; Pages has to be set to deploy from that branch once, by hand. The tests don't run on GitHub ([0010](#0010)).
- **Alternatives:** `actions/deploy-pages`: replaces the whole site on each deploy, so only one branch can be online. Netlify or Vercel previews: another service and account.

<a id="0010"></a>
## 0010: Failing checks block production, not branch builds

Accepted (2026-11-15)

The Pages workflow doesn't run the tests: every branch that builds is published. Failing checks, such as a failing test, a lint error or a known vulnerability, block merging to `main`, and so the build at the root of the site, which is production. `npm run check` must pass before a merge to `main`.

- **Why:** a branch build is continuous delivery: it is there to try a change, also one that doesn't pass its checks yet, while it is fixed. Production is what Players get, so only that has to pass every check.
- **Cost:** a branch build can be broken. Nothing on GitHub enforces the checks yet: they are run by hand before merging, and a push straight to `main` is published without them.
- **Alternatives:** run the tests in the Pages workflow and publish only passing builds: a change with a failing check can't be tried from a link. Run the checks on GitHub and require them for `main`: enforced, but with few or no pull requests not worth setting up yet.

<a id="0011"></a>
## 0011: Four components, wired in one place

Accepted (2026-11-15)

The code is four components: Puzzle (`src/puzzle/`: the Puzzles, the rules, the solver and the generator), Storage (`src/storage/`: what is kept in the browser), UI (`src/ui/`: the page, what it shows and what the Player does) and the Glue (`src/app.js`, `src/browser.js`). A component imports only from itself; the Glue imports from all of them, and hands each what it needs from the others as arguments. The rules produce no text for the Player: they give a status or a reason, and the UI words it. The spec has a file per component, except the Glue, whose behavior is in the features it wires.

- **Why:** each component can be read, specified and tested on its own, and replaced: the Glue gets the storage and the Puzzles passed in, so tests can pass their own.
- **Cost:** more files and folders for a small game; every text goes through the UI, also for a status the rules already know.
- **Alternatives:** the flat `src/` as it was: fewer files, but the boundaries were only in comments, and `app.js` mixed wiring with the panel's DOM. A framework or a container for dependency injection: more than the page needs ([0006](#0006)).

<a id="0012"></a>
## 0012: Schemas as JSON files, checked by the tests

Accepted (2026-11-15)

The schemas are JSON Schema files in `docs/spec/schemas/`, described in [schemas.md](spec/schemas.md). The tests check the data against them with Ajv: every Puzzle, the Board of a game, and the stored Progress.

- **Why:** a schema that is checked stays true; a JSON file can be read by the tests, and by any tool in any language.
- **Cost:** a development dependency; the schemas are outside the Markdown, so schemas.md links them instead of showing them. The page itself still checks what it loads by hand, as Ajv isn't part of it; the tests check that it agrees with the schema.
- **Alternatives:** schemas inline in schemas.md, as before: one place to read, but unchecked, or the tests have to parse Markdown. Checks written by hand in JavaScript: no dependency, but a second description of each format, which can drift from the schema. Schemas in `src/`, next to the code of their component: but the spec links them, and no code reads them.

<a id="0013"></a>
## 0013: Screenshots in the spec, made in a container

Accepted (2026-11-15)

The [UI spec](spec/ui.md) shows the page and its parts as screenshots in `docs/spec/screenshots/`. Playwright compares the page with them (`toHaveScreenshot`) with its default tolerance, set in the config: `threshold: 0.2` for how far a pixel's colour may drift, and `maxDiffPixels: 0`, so no pixel may differ beyond that. These tests run only in Playwright's image, `mcr.microsoft.com/playwright`, tagged with the version of `@playwright/test` and run as `linux/amd64`, with Podman or Docker: `npm run test:screenshots` checks them, and `npm run test:screenshots -- --update-snapshots` remakes them after an intended change, to be looked at in the diff before a commit.

- **Why:** the spec shows the look, which words can't. The image fixes the browser, the fonts and the rendering, so the same commit gives the same pixels on every machine and in CI, and a screenshot changes only with the page or with `@playwright/test`, in the same commit.
- **Cost:** taking or checking screenshots needs Podman or Docker, and `npm run check` does both. Updating `@playwright/test` means remaking the screenshots. On an arm machine the image runs emulated, and slowly. Images in git, a new copy with every change.
- **Alternatives:** a tolerance instead of a container: no Podman or Docker, but a different font moves glyphs by whole pixels, which no colour threshold absorbs, and small changes go unseen. A wider tolerance than the default can still be set in the config, if this turns out too strict. The browser on each machine: no setup, but every system update can change the pixels. Only accessibility snapshots, as before: they don't show the look.

<a id="0015"></a>
## 0015: Every Puzzle in progress is kept, until it is solved or reset

Accepted (2026-11-15)

Progress keeps, for every Puzzle in progress, its Bonds, whether the solution was shown, and its undo history, after every change. Solving or resetting a Puzzle removes them, and its undo history in the game too: Reset can't be undone. Show solution now writes to Progress, but never a solved mark: the Progress of [0004](#0004) is the solved marks.

- **Why:** a Player can leave any Puzzle, or lose the browser, and come back to it as they left it, Undo included. Keeping whether the solution is shown stops a reload from counting a shown solution as solved ([0004](#0004)). Once a Puzzle is solved its Board tells nothing more, and Reset is how a Player starts again, so both end what is kept.
- **Cost:** Reset can't be undone, so it asks first; after solving there is nothing to undo. Up to 100 Boards per Puzzle in the browser, all rewritten on every change, and a full storage keeps nothing; a Puzzle left half done stays there until it is solved or reset. With the game in two tabs, the last one to save wins. A build without this, such as `main` before it is merged, drops the Puzzles in progress on its next save, as the origin is shared ([0009](#0009)).
- **Alternatives:** only the open Puzzle's Board: less to store, but leaving a Puzzle loses it, and Undo after a reload. Boards without the undo history: smaller, but nothing to undo after coming back. Reset that Undo brings back, as before: then only solving ends the history. Reset that Undo brings back until the page closes, without keeping that: less final, but the Board after a reload isn't the one before it. Saves that read what is stored first and change only what their page changed: two tabs keep each other's Progress, but more code for a rare case.
