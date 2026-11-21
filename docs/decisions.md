# Decisions

Any decision made about the project.

One short entry per decision. Don't renumber or rewrite: mark one `Superseded by NNNN` instead, or `Partly superseded by NNNN` when a later one changes only part of it. A correction that keeps the choice, such as a path or a name, is made in place. An open question is `Undecided`. Make sure to add each entry to the index, under its category. Entries stay in number order below the index. There is no 0014: it was dropped before it was merged.

## Index

### Game

What the Player does and what the rules are.

- [0001: A simplified valence model](#0001)
- [0002: Every hydrogen is an Atom on the Grid](#0002)
- [0003: All Puzzles are open](#0003)
- [0004: Show solution doesn't solve a Puzzle](#0004)
- [0008: Every Puzzle has exactly one solution](#0008)
- [0015: Every Puzzle in progress is kept, until it is solved or reset](#0015)
- [0017: A solved Puzzle keeps its Board, until it is reset](#0017)
- [0018: New Puzzles go at the end](#0018)
- [0019: Grids of at most 6 rows by 5 columns](#0019)
- [0020: New Puzzles are harder, and unlike the others](#0020)
- [0021: Puzzles are in order of difficulty](#0021)
- [0022: Removed Puzzles are kept, and not added again](#0022)
- [0023: Hydrogens are drawn on their Atom, not placed on the Grid](#0023)
- [0024: Puzzles have loops, and difficulty counts them](#0024)

### Technical

How the code and its data are built.

- [0005: Progress lives in the browser](#0005)
- [0006: ES modules, built into one HTML file](#0006)
- [0011: Three components, wired in one place](#0011)
- [0012: Schemas as JSON files, checked by the tests](#0012)
- [0016: Progress keeps its key while it only gains fields](#0016)

### Testing and publishing

How changes are checked and shared.

- [0007: Vitest for the components, Playwright for the built page](#0007)
- [0009: A GitHub Pages build per branch, from a gh-pages branch](#0009)
- [0010: Failing checks block production, not branch builds](#0010)
- [0013: Screenshots in the spec, made in a container](#0013)

<a id="0001"></a>
## 0001: A simplified valence model

Accepted (2026-11-10)

Each Element has one valence, the number of Bonds it needs; there are no charges, ions or lone pairs.

- **Why:** a Player can learn the rule in a minute ("C needs 4"), and the badge on each Atom shows how many it still needs.
- **Cost:** Molecules that need formal charges can't be Puzzles: carbon monoxide, nitric acid, nitro groups, salts. Nor can those where an Element has another number of Bonds than its one valence, such as S with 4 or 6 in DMSO, sulfuric acid or SF₆. Puzzles are chosen to fit.
- **Alternatives:** formal charges and lone pairs: closer to real chemistry, but much harder to show and to reason about.

<a id="0002"></a>
## 0002: Every hydrogen is an Atom on the Grid

Accepted (2026-11-10). Superseded by [0023](#0023).

Every H is an Atom on the Grid that the Player bonds, instead of hydrogens being implied as in skeletal formulas.

- **Why:** the puzzle is "every Atom gets exactly its Bonds"; an H can take only one, so it is part of what the Player reasons from, and hiding it would hide part of the puzzle.
- **Cost:** bigger Grids (13 Atoms for Alanine, 19 for Valine), which limits how big a Molecule can be, especially on a phone.
- **Alternatives:** implicit hydrogens: smaller Grids, but each Atom would need its H count shown, and fewer Bonds would be left to reason about.

<a id="0003"></a>
## 0003: All Puzzles are open

Accepted (2026-11-10). Partly superseded by [0018](#0018), which [0021](#0021) superseded in turn: the order is easiest first again, measured by difficulty.

No Puzzle is locked; the order, easiest first, only suggests a path.

- **Why:** a stuck Player can skip ahead, and someone who knows the basics can jump in.
- **Cost:** less sense of progression.
- **Alternatives:** unlock one by one: frustrating, and the Show solution button undercuts it anyway.

<a id="0004"></a>
## 0004: Show solution doesn't solve a Puzzle

Accepted (2026-11-15). Partly superseded by [0015](#0015): Show solution writes the Board to Progress, but never a solved mark.

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
## 0007: Vitest for the components, Playwright for the built page

Accepted (2026-11-11)

Puzzle, Storage, the UI (in happy-dom) and the wiring in `src/app.js` (with fakes) are tested with Vitest; the built page with Playwright in Chromium, at 1280×800 and, for layout, 390×844. Expected results are inline snapshots: the Board drawn as text (`tests/helpers/draw.js`) and accessibility snapshots of the page. A test's name starts with the rule ids it covers.

- **Why:** inline snapshots read like the spec's examples; testing the page through roles and names also keeps the Board usable with a screen reader and keys.
- **Cost:** two test runners; Playwright needs a Chromium download or `CHROMIUM_PATH`.
- **Alternatives:** `node:test`: no inline snapshots. Only Playwright: slower, and rules are hard to reach through the page.

<a id="0008"></a>
## 0008: Every Puzzle has exactly one solution

Accepted (2026-11-11)

A solver (`src/puzzle/solver.js`) counts the solutions of a Grid; a test checks each Puzzle has exactly one, and that it is the one Show solution shows. Any Board where every Atom is complete and all join up is then that solution, so the game doesn't compare Molecules.

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

The Pages workflow doesn't run the tests: every branch that builds is published. Failing checks, those of `npm run check` and any added to it later, block merging to `main`, and so the build at the root of the site, which is production. `npm run check` must pass before a merge to `main`.

- **Why:** a branch build is continuous delivery: it is there to try a change, also one that doesn't pass its checks yet, while it is fixed. Production is what Players get, so only that has to pass every check.
- **Cost:** a branch build can be broken. Nothing on GitHub enforces the checks yet: they are run by hand before merging, and a push straight to `main` is published without them.
- **Alternatives:** run the tests in the Pages workflow and publish only passing builds: a change with a failing check can't be tried from a link. Run the checks on GitHub and require them for `main`: enforced, but with few or no pull requests not worth setting up yet.

<a id="0011"></a>
## 0011: Three components, wired in one place

Accepted (2026-11-15)

The code is three components: Puzzle (`src/puzzle/`: the Puzzles, the rules, the solver and the generator), Storage (`src/storage/`: what is kept in the browser) and UI (`src/ui/`: the page, what it shows and what the Player does). A component imports only from itself. `src/browser.js` and `src/app.js` are not a component: they import the components and wire them together, handing each what it needs from the others as arguments, and add nothing of their own, so they have no spec: what they do is in the features they wire. The rules produce no text for the Player: they give a status or a reason, and the UI words it. The spec has a file per component.

- **Why:** each component can be read, specified and tested on its own, and replaced: `app.js` gets the storage and the Puzzles passed in, so tests can pass their own.
- **Cost:** more files and folders for a small game; every text goes through the UI, also for a status the rules already know. What two components both need is written in each: the Element symbols in the Puzzle's and the UI's `elements.js` and in the Puzzle schema, the valences in `puzzle/elements.js` and in the rule the panel shows, and the undo limit in `game.js`, `progress.js` and the Progress schema. A new Element means changing all of those, and the spec.
- **Alternatives:** the flat `src/` as it was: fewer files, but the boundaries were only in comments, and `app.js` mixed wiring with the panel's DOM. A framework or a container for dependency injection: more than the page needs ([0006](#0006)). The wiring as a fourth component: but it adds nothing and has no spec.

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

The [UI spec](spec/ui.md) shows the page and its parts as screenshots. Playwright compares the page with them at its default tolerance, and only inside Playwright's own image, of the same version as `@playwright/test`, in Podman or Docker; the README has the commands.

- **Why:** the spec shows the look, which words can't. The image fixes the browser, the fonts and the rendering, so the same commit gives the same pixels on every machine, and a screenshot changes only with the page or with `@playwright/test`, in the same commit.
- **Cost:** taking or checking screenshots needs Podman or Docker, and so does `npm run check`, which checks them. Updating `@playwright/test` means remaking the screenshots. On an arm machine the image runs emulated, and slowly. Images in git, a new copy with every change.
- **Alternatives:** a tolerance instead of a container: no Podman or Docker, but a different font moves glyphs by whole pixels, which no colour threshold absorbs, and small changes go unseen. A wider tolerance than the default can still be set in the config, if this turns out too strict. The browser on each machine: no setup, but every system update can change the pixels. Only accessibility snapshots, as before: they don't show the look.

<a id="0015"></a>
## 0015: Every Puzzle in progress is kept, until it is solved or reset

Accepted (2026-11-15). Partly superseded by [0017](#0017): solving keeps the Bonds, but still ends the undo history.

Progress keeps, for every Puzzle in progress, its Bonds, whether the solution was shown, and its undo history, after every change. Solving or resetting a Puzzle removes them, and its undo history in the game too: Reset can't be undone. Show solution now writes to Progress, but never a solved mark: the Progress of [0004](#0004) is the solved marks.

- **Why:** a Player can leave any Puzzle, or lose the browser, and come back to it as they left it, Undo included. Keeping whether the solution is shown stops a reload from counting a shown solution as solved ([0004](#0004)). Once a Puzzle is solved its Board tells nothing more, and Reset is how a Player starts again, so both end what is kept.
- **Cost:** Reset can't be undone, so it asks first; after solving there is nothing to undo. Up to 101 Boards per Puzzle in the browser, all rewritten on every change, and a full storage keeps no newer change; a Puzzle left half done stays there until it is solved or reset. With the game in two tabs, the last one to save wins. An older build without this, such as an old branch build, drops the Puzzles in progress on its next save, as the origin is shared ([0009](#0009)).
- **Alternatives:** only the open Puzzle's Board: less to store, but leaving a Puzzle loses it, and Undo after a reload. Boards without the undo history: smaller, but nothing to undo after coming back. Reset that Undo brings back, as before: then only solving ends the history. Reset that Undo brings back until the page closes, without keeping that: less final, but the Board after a reload isn't the one before it. Saves that read what is stored first and change only what their page changed: two tabs keep each other's Progress, but more code for a rare case.

<a id="0016"></a>
## 0016: Progress keeps its key while it only gains fields

Accepted (2026-11-21). Partly superseded by [0017](#0017): the key also stays when a field holds more entries, as long as older builds still read each entry right.

Progress stays under the key `molecuzzle-v2` when a change only adds an optional field to it, as `boards` did ([0015](#0015)). Only a field that changes its meaning or format gets a new key.

- **Why:** an older Progress is still a valid Progress, so no Player loses their solved Puzzles, and there is no migration code.
- **Cost:** an older build on the same origin ([0009](#0009)) loads the Progress and drops the fields it doesn't know on its next save. The key says nothing about which fields there are.
- **Alternatives:** a new key for every change: older builds keep their own Progress, but every Player starts over, unless the new build reads the old key. A version field inside Progress, with a migration for each version: exact, but code for every change, more than an optional field needs.

<a id="0017"></a>
## 0017: A solved Puzzle keeps its Board, until it is reset

Accepted (2026-11-21)

Solving a Puzzle keeps its Board in Progress, with nothing to undo, so it opens again solved; only Reset removes it. A Puzzle marked solved with no Board kept opens with no Bonds.

- **Why:** going back to a solved Puzzle shows the Molecule the Player built, and its name and fact, as a collection; Reset, which asks first, is how a Player plays it again. A solved Board is the solution ([0008](#0008)), so it can't be wrong. The key stays ([0016](#0016)): `boards` holds more Puzzles, but its entries keep their format, and an older build opens a solved entry as solved.
- **Cost:** one more entry in Progress per solved Puzzle, a few Bonds each. Puzzles solved before this have no Board kept, so they open with no Bonds until they are solved again. Playing a solved Puzzle again takes a Reset. An older build on the same origin ([0009](#0009)) removes a solved Board the next time it opens that Puzzle.
- **Alternatives:** open every Puzzle marked solved with its `solution`, with nothing kept: also works for Puzzles solved before, but then a Reset needs a mark of its own in Progress, or the solution is back the next time it opens. Open solved Puzzles with no Bonds, as before: nothing to see of what was solved.

<a id="0018"></a>
## 0018: New Puzzles go at the end

Accepted (2026-11-21). Superseded by [0021](#0021).

New Puzzles are added after the last one, easiest first among themselves, instead of between the Puzzles by how hard they are. A Puzzle keeps its number once it is published.

- **Why:** a Player who has solved the first Puzzles finds the new ones after them, not scattered among solved ones; the numbers in the spec, the tests and the Players' heads stay the same. Progress is by the Puzzles' ids ([schemas](spec/schemas.md#progress)), so it would survive either way.
- **Cost:** the whole list is no longer easiest first ([0003](#0003)): a batch of easy Puzzles can follow hard ones, as the Puzzles with new Elements follow Alanine.
- **Alternatives:** keep the whole list easiest first, renumbering the Puzzles after each insert: the best path for a new Player, but every number in the spec and the tests moves, and a returning Player has to look for what is new. Groups or chapters of Puzzles: a clear path per group, but a new part of the UI.

<a id="0019"></a>
## 0019: Grids of at most 6 rows by 5 columns

Accepted (2026-11-21)

No Puzzle's Grid is wider than 5 columns or taller than 6 rows, and the generator looks for no larger ones unless it is told to.

- **Why:** on a phone, 390 px wide, the Board shrinks to fit ([Layout.01](spec/ui.md#layout)). At 5 columns a C or an O is 36 px across, 62% of its size on a computer, still large enough to see and to tap next to; at 6 columns it would be about 30 px. A Board of 6 rows by 5 columns is then about 400 px tall, so it fits on the screen with its status line; on a computer, at 1280×800, it fits too, if only just. Larger and harder Puzzles have to grow by more Atoms on the same Grid, with more Dotted lines left empty, not by a bigger Grid.
- **Cost:** some Molecules don't fit, or have no layout with exactly one solution in that size: Valine, with 19 Atoms, has layouts only on the full 6 by 5. Larger Molecules wait for a Grid with more neighbours per Atom, such as the hex grid in the backlog ([decision 0002](#0002)'s cost).
- **Alternatives:** larger Grids that scroll sideways on a phone: goes against Layout.01, and the Board is hard to see whole. Zooming or panning the Board: more UI, and the Player loses sight of the Molecule. Smaller cells for large Grids: the Atoms get too small to tap.

<a id="0020"></a>
## 0020: New Puzzles are harder, and unlike the others

Accepted (2026-11-21). Partly superseded by [0021](#0021), which measures how hard every Puzzle is, in place of a threshold for Puzzles 22 to 28, and by [0022](#0022), which removed the look-alikes of the batch before (Halothane stays, Iodoethane went). Its Puzzle numbers are those from before plan 06, and its Puzzle.05 was that threshold; the id now names the difficulty.

A batch of larger Puzzles is made harder by the Dotted lines its solution leaves empty: Puzzles 22 to 28 each leave at least 5 ([Puzzle.05](spec/puzzle.md#puzzle)). And no new Puzzle's layout is another's, or nearly so, turned, flipped, or with other symbols of the same valence.

- **Why:** an empty Dotted line is a Bond the Player has to rule out, so it counts the reasoning a Puzzle asks for, and it is what the generator already makes as large as it can. 5 is more than any Puzzle before but Alanine, and lets Lactic acid, the smallest, open the batch. A layout the Player has solved before plays the same with S for O or Cl for H, so it adds nothing.
- **Cost:** Lactic acid isn't harder than Alanine. Each later batch needs its own rule. Whether layouts are alike is checked while a batch is made, not by a test: for this batch, by a script that isn't kept, which found no new layout with more than 9 of its points on Atoms of the same valence in another Puzzle, under any turn, flip or shift. In the batch before, Puzzles 16, 17, 18, 19 and 21 are the layouts of 5, 3, 6, 6 and 20 with other symbols; they stay, as that batch adds Elements, not harder logic.
- **Alternatives:** the number of Atoms alone: a larger Grid of easy Bonds isn't harder. A difficulty from the solver, such as the steps a Player needs: nearer to how hard a Puzzle feels, but new code and a measure to tune. A threshold of 6: Lactic acid and Ethyl acetate drop out. A test that no two layouts are alike: the batch before would need five exceptions.

<a id="0021"></a>
## 0021: Puzzles are in order of difficulty

Accepted (2026-11-21). Partly superseded by [0024](#0024), which counts loops in place of empty Dotted lines.

Every Puzzle has a difficulty, its Dotted lines plus twice those its solution leaves empty ([Puzzle.05](spec/puzzle.md#puzzle)), and the list is in that order, easiest first. A new Puzzle goes where its difficulty puts it, after those of the same difficulty, and the Puzzles after it move up a number.

- **Why:** the list is a path from easy to hard ([0003](#0003)), so its order should follow one measure, not when a Puzzle was added. Each Dotted line is a connection the Player looks at; an empty one is also a Bond to rule out, and that reasoning is what makes a Puzzle hard, so it counts twice. Both are counted from the Puzzle, with no judgement, and the generator prints the difficulty of a layout it finds.
- **Cost:** adding a Puzzle renumbers those after it, and the examples, tests and screenshots that name them. Progress is by id ([schemas](spec/schemas.md#progress)), so Players keep it, but a Player's next unsolved Puzzle can turn up among solved ones. The measure doesn't see how a Bond's order follows from its neighbours, so Puzzles of the same difficulty can feel different, and a tie goes to the Puzzle that was there first.
- **Alternatives:** new Puzzles at the end, easiest first per batch ([0018](#0018)): stable numbers, but a hard batch is followed by an easy one, and "easiest" was a judgement. Empty Dotted lines alone: a larger Board with as few left empty isn't easier. A difficulty from the solver, such as the steps a Player needs: nearer to how hard a Puzzle feels, but new code and a measure to tune. Showing the difficulty to the Player: not asked for yet.

<a id="0022"></a>
## 0022: Removed Puzzles are kept, and not added again

Accepted (2026-11-21). Partly superseded by [0024](#0024): after the tutorial, a new Puzzle earns its place with at least 2 loops.

Eight easy Puzzles were taken out of the game: those with no empty Dotted line, nothing to rule out, beyond the first Puzzles that teach single, double and triple Bonds, and those that are another Puzzle's layout with other symbols ([0020](#0020)). The same holds for a new Puzzle: it earns its place by being unlike the others and having something to rule out, and only the first Puzzles, the tutorial, may have nothing. They are kept in `src/puzzle/removed.js`, and listed in the [spec](spec/puzzle.md#puzzle) with why; a test checks no Puzzle has the id or the formula of a removed one ([Puzzle.06](spec/puzzle.md#puzzle)).

- **Why:** the list starts with a short run of easy Puzzles to learn the rules, single, double and triple Bonds and the first empty Dotted line, and then gets harder, without a long stretch of Puzzles that teach nothing new. Keeping the removed ones, with why, stops them coming back, and keeps their layouts if they are ever wanted.
- **Cost:** Iodine has no Puzzle left, though it stays an Element. A Player who solved a removed Puzzle keeps its mark and Board in Progress, under an id the game no longer knows ([Progress.01](spec/storage.md#progress), [Progress.03](spec/storage.md#progress)); the score counts only Puzzles in the game ([List.02](spec/ui.md#list)), so "Solved k of 20" can go down. The formula check also keeps out a different Molecule with a removed one's formula, an isomer of it. Whether a new Puzzle is unlike the others is still judged when it is made: with the look-alikes gone, a test of it would need no exceptions, and is in the backlog.
- **Alternatives:** delete them with no record: one could be added again. A section of extra Puzzles: they stay in the game, still easy, and need a place in the UI. Mark them as removed in `puzzles.js`: the game would have to skip them.

<a id="0023"></a>
## 0023: Hydrogens are drawn on their Atom, not placed on the Grid

Accepted (2026-11-21)

Every hydrogen is bonded to its Atom from the start. It isn't an Atom on the Grid, and the Player can't change it; the Board draws it as a small white ball on a short thin line beside its Atom, and an Atom needs its valence minus its hydrogens in Bonds to other Atoms ([Puzzle.07](spec/puzzle.md#puzzle)).

- **Why:** the hydrogens gave nothing to think about. An H has one Bond, and its partner was nearly always the Atom next to it. In the 20 Puzzles before this, of the 110 Atoms with one Bond (105 H, and Halothane's F, Cl and Br), 97 had a single nearest Atom with more than one Bond along their Dotted lines, and it was their partner; a line between two such Atoms is never a Bond; and the obvious moves of [0024](#0024) solved 12 of the 20 outright. Without them the Board is the Molecule's skeleton, and the reasoning is about its loops and Bond orders. Drawing the hydrogens, rather than writing CH₃ on the ball, keeps them visible and shows they are already bonded; the prototype in `prototypes/implicit-hydrogens.html` first wrote CH₃ on the ball, which looked odd, and now draws them.
- **Cost:** every Puzzle needs a new layout, and Molecules of only one or two Atoms besides their hydrogens, such as Water and Formaldehyde, can't be Puzzles any more. A Puzzle's format changes: each Atom gains its hydrogens. Boards stored for the old layouts mean other Bonds now, so Progress moves to a new key, as [0016](#0016) asks, and Players start again. The Puzzles removed with this change are kept in `removed.js` as they were, with their hydrogens as Atoms, and are no longer checked against the rules. The Board is harder to read for a Player who counted H balls, and each Atom draws up to three small balls.
- **Alternatives:** keep every H on the Grid ([0002](#0002)) and make better layouts: a lot of generator work for hydrogens that still teach nothing. Write CH₃ on the ball: compact, but it reads as a formula, not as Atoms. Show only a number of hydrogens: less to draw, but the Bonds they make aren't seen.

<a id="0024"></a>
## 0024: Puzzles have loops, and difficulty counts them

Accepted (2026-11-21)

A loop of Dotted lines is a choice; without one, every Dotted line has to be a Bond to join the Atoms up, and only the Bond orders are left to find. So every Puzzle after a tutorial of three has at least 2 loops ([Puzzle.08](spec/puzzle.md#puzzle)), and a Puzzle's difficulty is its Dotted lines plus twice its loops ([Puzzle.05](spec/puzzle.md#puzzle)): its Dotted lines minus its Atoms plus 1.

- **Why:** the Player in the prototype found the Puzzles with loops, such as citric acid, the good ones, and the ones without them a matter of connecting everything and filling in what is left. Counting loops rather than empty Dotted lines also counts the choice round a ring, where no line stays empty but each could have; for a Molecule with no ring the two are the same. The tutorial teaches single, double and triple Bonds and the first loop.
- **Cost:** a loop that closes on an Atom with one Bond to give, such as CH₃, OH or F, is decided at once, so loops alone don't make a Puzzle hard: Threonine and Valine have 3, and the obvious moves solve them. Those moves are what a Player sees without trying anything: two Atoms with one Bond each never bond; a Bond is at most what the smaller of its Atoms needs, and at most triple; each line of an Atom takes at least what the Atom needs minus what its other lines can still give, and at most what it needs minus what they must give; and a Bond rules out the lines it crosses. Whether they solve a Puzzle is checked with a script while a batch is made, not by a test, and such Puzzles are left out. That leaves the halogens with no Puzzle for now, as the Molecules tried close their loops on them, and S too, as its one candidate, Cysteine, is Serine's layout. No ring of 3 Atoms fits the Grid, as three Atoms can't each share a row or a column with both others; rings of 4, 5 and 6 can, as a Dotted line may span empty points.
- **Alternatives:** empty Dotted lines, as before ([0021](#0021)): the same for most Molecules, but blind to rings. A difficulty from a solver that plays like a Player, the lines its obvious moves leave open: nearer to how hard a Puzzle feels, but new code and a measure to tune; the script used to choose this set does a simple version. Loops of 1: more Puzzles fit, but many with a single loop closed on a CH₃.
