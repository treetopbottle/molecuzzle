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
- [0024: Puzzles have loops](#0024)
- [0025: Atoms don't show what they need, and may have too many Bonds](#0025)
- [0027: The panel shows the open Puzzle's difficulty, as a number](#0027)

### Technical

How the code and its data are built.

- [0005: Progress lives in the browser](#0005)
- [0006: ES modules, built into one HTML file](#0006)
- [0011: Three components, wired in one place](#0011)
- [0012: Schemas as JSON files, checked by the tests](#0012)
- [0016: Progress keeps its key while it only gains fields](#0016)
- [0026: The generator places Atoms in line with their partners, and backs up](#0026)
- [0028: Each component's interface is a file of types, in the terms of the side that uses them](#0028)
- [0029: TypeScript, checked by tsc and run as it is](#0029)
- [0030: The look is one theme, in `src/ui/theme.ts`](#0030)

### Testing and publishing

How changes are checked and shared.

- [0007: Vitest for the components, Playwright for the built page](#0007)
- [0009: A GitHub Pages build per branch, from a gh-pages branch](#0009)
- [0010: Failing checks block production, not branch builds](#0010)
- [0013: Screenshots in the spec, made in a container](#0013)

<a id="0001"></a>
## 0001: A simplified valence model

Accepted (2026-11-10). Partly superseded by [0025](#0025): its Why on the badge; the valence model stays.

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

Accepted (2026-11-11). Partly superseded by [0029](#0029): the code is TypeScript, not plain JavaScript; esbuild still bundles it into one file.

The code is plain JavaScript in ES modules in `src/`; `npm run build` bundles them with esbuild and inlines the bundle and CSS into `dist/index.html`. Dependencies are for development only.

- **Why:** modules are components with small interfaces that tests import directly; the built file still opens from disk, offline, with no server.
- **Cost:** a build step and Node.js to develop; `dist/` isn't in git, so playing needs a build.
- **Alternatives:** loading `src/` as modules in the browser: needs a server, since browsers don't load modules from `file://`. A framework: more than the page needs.

<a id="0007"></a>
## 0007: Vitest for the components, Playwright for the built page

Accepted (2026-11-11)

Puzzle, Storage, the UI (in happy-dom) and the wiring in `src/app.ts` (with fakes) are tested with Vitest; the built page with Playwright in Chromium, at 1280×800 and, for layout, 390×844. Expected results are inline snapshots: the Board drawn as text (`tests/helpers/draw.ts`) and accessibility snapshots of the page. A test's name starts with the rule ids it covers.

- **Why:** inline snapshots read like the spec's examples; testing the page through roles and names also keeps the Board usable with a screen reader and keys.
- **Cost:** two test runners; Playwright needs a Chromium download or `CHROMIUM_PATH`.
- **Alternatives:** `node:test`: no inline snapshots. Only Playwright: slower, and rules are hard to reach through the page.

<a id="0008"></a>
## 0008: Every Puzzle has exactly one solution

Accepted (2026-11-11)

A solver (`src/puzzle/solver.ts`) counts the solutions of a Grid; a test checks each Puzzle has exactly one, and that it is the one Show solution shows. Any Board where every Atom is complete and all join up is then that solution, so the game doesn't compare Molecules.

- **Why:** a logic puzzle needs one answer to reason towards; with it, the game never has to match the Board against a Molecule.
- **Cost:** some Molecules can't be Puzzles: any ring of alternating Bonds, such as Benzene, has two solutions. So has any even ring whose Bonds can be made one stronger and one weaker in turn, down to no Bond, while every Atom keeps its count and all stay joined: a purine such as adenine or guanine, or a β-lactam fused to a second ring, as in penicillin (found while making plan 09).
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

Accepted (2026-11-15). Since [0028](#0028), the Element symbols are also written out in `puzzle/api.ts`, and `tsc` checks in the Glue that the UI has a look for each of the Puzzle's; the valences and the undo limit stay copies that nothing checks.

The code is three components: Puzzle (`src/puzzle/`: the Puzzles, the rules, the solver and the generator), Storage (`src/storage/`: what is kept in the browser) and UI (`src/ui/`: the page, what it shows and what the Player does). A component imports only from itself. `src/browser.ts` and `src/app.ts` are not a component: they import the components and wire them together, handing each what it needs from the others as arguments, and add nothing of their own, so they have no spec: what they do is in the features they wire. The rules produce no text for the Player: they give a status or a reason, and the UI words it. The spec has a file per component.

- **Why:** each component can be read, specified and tested on its own, and replaced: `app.ts` gets the storage and the Puzzles passed in, so tests can pass their own.
- **Cost:** more files and folders for a small game; every text goes through the UI, also for a status the rules already know. What two components both need is written in each: the Element symbols in the Puzzle's `elements.ts` and the UI's `elements.ts` and in the Puzzle schema, the valences in `puzzle/elements.ts` and in the rule the panel shows (since plan 08 the key of the panel gets them from the Glue, so only the rule's text is a copy), and the undo limit in `game.ts`, `progress.ts` and the Progress schema. A new Element means changing all of those, and the spec.
- **Alternatives:** the flat `src/` as it was: fewer files, but the boundaries were only in comments, and the wiring was mixed with the panel's DOM. A framework or a container for dependency injection: more than the page needs ([0006](#0006)). The wiring as a fourth component: but it adds nothing and has no spec.

<a id="0012"></a>
## 0012: Schemas as JSON files, checked by the tests

Accepted (2026-11-15). Since [0028](#0028), the formats are also types, written by hand: a second description, as this entry's Alternatives warn, kept together only as far as the same data is checked by both: the tests check the data against the schemas, and `tsc` checks it against the types where the code holds it, such as `PUZZLES`; nothing compares a type with its schema, so a constraint only one of them has, such as a range, can differ unseen.

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

Accepted (2026-11-21). Partly superseded by [0017](#0017): the key also stays when a field holds more entries, as long as older builds still read each entry right. The key it named was `molecuzzle-v2`; [0023](#0023) changed the meaning of the Boards, so Progress moved to `molecuzzle-v3`. The next release moved it to `molecuzzle-v4`, so that solved Puzzles are not remembered.

Progress stays under its key when a change only adds an optional field to it, as `boards` did ([0015](#0015)). Only a field that changes its meaning or format gets a new key.

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

Accepted (2026-11-21). Its reasons are partly from before [0023](#0023) and [0024](#0024): with the hydrogens on their Atoms, Grids are smaller, and Puzzles grow harder by their loops, not by empty Dotted lines. Valine, its example, is removed; Citric acid's 6 by 3 and Glucose's 3 by 5 now come nearest the limit, and the hex grid of its cost is in the backlog. The limit and the sizes on the screen still hold. Since [0026](#0026) Molecules of up to 25 Atoms have layouts on 6 by 5, and nine Puzzles use all of it, such as N-Acetylneuraminic acid and Prostaglandin E2; what still waits for the hex grid is the Molecules with no layout there.

No Puzzle's Grid is wider than 5 columns or taller than 6 rows, and the generator looks for no larger ones unless it is told to.

- **Why:** on a phone, 390 px wide, the Board shrinks to fit ([Layout.01](spec/ui.md#layout)). At 5 columns a C or an O is 36 px across, 62% of its size on a computer, still large enough to see and to tap next to; at 6 columns it would be about 30 px. A Board of 6 rows by 5 columns is then about 400 px tall, so it fits on the screen with its status line; on a computer, at 1280×800, it fits too, if only just. Larger and harder Puzzles have to grow by more Atoms on the same Grid, with more Dotted lines left empty, not by a bigger Grid.
- **Cost:** some Molecules don't fit, or have no layout with exactly one solution in that size: Valine, with 19 Atoms, has layouts only on the full 6 by 5. Larger Molecules wait for a Grid with more neighbours per Atom, such as the hex grid in the backlog ([decision 0002](#0002)'s cost).
- **Alternatives:** larger Grids that scroll sideways on a phone: goes against Layout.01, and the Board is hard to see whole. Zooming or panning the Board: more UI, and the Player loses sight of the Molecule. Smaller cells for large Grids: the Atoms get too small to tap.

<a id="0020"></a>
## 0020: New Puzzles are harder, and unlike the others

Accepted (2026-11-21). Partly superseded by [0021](#0021), which measures how hard every Puzzle is, in place of a threshold for Puzzles 22 to 28, and by [0022](#0022), which removed the look-alikes of the batch before (Halothane stays, Iodoethane went). Its Puzzle numbers are those from before plan 06, and its Puzzle.05 was that threshold; the id now names the difficulty. Since [0023](#0023), "the same valence" means the same need, valence minus hydrogens: CH₂, NH and O all need 2, so Morpholine and 1,4-Dioxane are look-alikes, and its "Cl for H" no longer comes up.

A batch of larger Puzzles is made harder by the Dotted lines its solution leaves empty: Puzzles 22 to 28 each leave at least 5 ([Puzzle.05](spec/puzzle.md#puzzle)). And no new Puzzle's layout is another's, or nearly so, turned, flipped, or with other symbols of the same valence.

- **Why:** an empty Dotted line is a Bond the Player has to rule out, so it counts the reasoning a Puzzle asks for, and it is what the generator already makes as large as it can. 5 is more than any Puzzle before but Alanine, and lets Lactic acid, the smallest, open the batch. A layout the Player has solved before plays the same with S for O or Cl for H, so it adds nothing.
- **Cost:** Lactic acid isn't harder than Alanine. Each later batch needs its own rule. Whether layouts are alike is checked while a batch is made, not by a test: for this batch, by a script that isn't kept, which found no new layout with more than 9 of its points on Atoms of the same valence in another Puzzle, under any turn, flip or shift. In the batch before, Puzzles 16, 17, 18, 19 and 21 are the layouts of 5, 3, 6, 6 and 20 with other symbols; they stay, as that batch adds Elements, not harder logic.
- **Alternatives:** the number of Atoms alone: a larger Grid of easy Bonds isn't harder. A difficulty from the solver, such as the steps a Player needs: nearer to how hard a Puzzle feels, but new code and a measure to tune. A threshold of 6: Lactic acid and Ethyl acetate drop out. A test that no two layouts are alike: the batch before would need five exceptions.

<a id="0021"></a>
## 0021: Puzzles are in order of difficulty

Accepted (2026-11-21). [0024](#0024) counted loops in place of empty Dotted lines; that is undone (2026-11-22, below). Since [0027](#0027) the panel shows the difficulty, the last of its Alternatives.

Every Puzzle has a difficulty, its Dotted lines plus twice those its solution leaves empty ([Puzzle.05](spec/puzzle.md#puzzle)), and the list is in that order, easiest first. A new Puzzle goes where its difficulty puts it, after those of the same difficulty, and the Puzzles after it move up a number.

- **Why:** the list is a path from easy to hard ([0003](#0003)), so its order should follow one measure, not when a Puzzle was added. Each Dotted line is a connection the Player looks at; an empty one is also a Bond to rule out, and that reasoning is what makes a Puzzle hard, so it counts twice. Both are counted from the Puzzle, with no judgement, and the generator prints the difficulty of a layout it finds.
- **Cost:** adding a Puzzle renumbers those after it, and the examples, tests and screenshots that name them. Progress is by id ([schemas](spec/schemas.md#progress)), so Players keep it, but a Player's next unsolved Puzzle can turn up among solved ones. The measure doesn't see how a Bond's order follows from its neighbours, so Puzzles of the same difficulty can feel different, and a tie goes to the Puzzle that was there first.
- **Since 0024:** the difficulty is the Dotted lines plus twice those the solution leaves empty again. Counting loops counted a Molecule's own ring as a choice though the Player only traces it: Cyclohexanol and Cyclohexane-1,4-dione, one empty Dotted line each, were found too easy in play at 12 and 13, level with Serine and Benzoquinone. Counted by empty lines they are 10 and 11, and Morpholine and Cyclohexene drop to 9, so they now come before Glycerol; Biotin, 32, comes before N-Acetylglucosamine, 33. Puzzle.08, at least 2 loops, stays.
- **Alternatives:** new Puzzles at the end, easiest first per batch ([0018](#0018)): stable numbers, but a hard batch is followed by an easy one, and "easiest" was a judgement. Empty Dotted lines alone: a larger Board with as few left empty isn't easier. A difficulty from the solver, such as the steps a Player needs: nearer to how hard a Puzzle feels, but new code and a measure to tune. Showing the difficulty to the Player: not asked for yet.

<a id="0022"></a>
## 0022: Removed Puzzles are kept, and not added again

Accepted (2026-11-21). Partly superseded by [0024](#0024): after the tutorial, a new Puzzle earns its place with at least 2 loops. Its Cost's numbers are from before plan 07. Since then some Puzzles are removed for the layouts tried, such as Threonine and Valine, whose loops close on CH₃ and OH, and the formula check keeps out more isomers, such as 1,4-Dioxane, which has Ethyl acetate's formula. They stay barred all the same: the check stays one simple test, and a Molecule whose loops close on one-Bond Atoms gives little to choose in any layout. To add one again, a plan takes it out of the table of removed Puzzles, with why. Cyclohexanol and Cyclohexane-1,4-dione went too, after play (2026-11-22): rings on a narrow ladder with one empty Dotted line, too easy for their difficulty; N-Acetylglucosamine and Biotin, harder than Citric acid, took their place.

Eight easy Puzzles were taken out of the game: those with no empty Dotted line, nothing to rule out, beyond the first Puzzles that teach single, double and triple Bonds, and those that are another Puzzle's layout with other symbols ([0020](#0020)). The same holds for a new Puzzle: it earns its place by being unlike the others and having something to rule out, and only the first Puzzles, the tutorial, may have nothing. They are kept in `src/puzzle/removed.ts`, and listed in the [spec](spec/puzzle.md#puzzle) with why; a test checks no Puzzle has the id or the formula of a removed one ([Puzzle.06](spec/puzzle.md#puzzle)).

- **Why:** the list starts with a short run of easy Puzzles to learn the rules, single, double and triple Bonds and the first empty Dotted line, and then gets harder, without a long stretch of Puzzles that teach nothing new. Keeping the removed ones, with why, stops them coming back, and keeps their layouts if they are ever wanted.
- **Cost:** Iodine has no Puzzle left, though it stays an Element. A Player who solved a removed Puzzle keeps its mark and Board in Progress, under an id the game no longer knows ([Progress.01](spec/storage.md#progress), [Progress.03](spec/storage.md#progress)); the score counts only Puzzles in the game ([List.02](spec/ui.md#list)), so "Solved k of 20" can go down. The formula check also keeps out a different Molecule with a removed one's formula, an isomer of it. Whether a new Puzzle is unlike the others is still judged when it is made: with the look-alikes gone, a test of it would need no exceptions, and is in the backlog.
- **Alternatives:** delete them with no record: one could be added again. A section of extra Puzzles: they stay in the game, still easy, and need a place in the UI. Mark them as removed in `puzzles.ts`: the game would have to skip them.

<a id="0023"></a>
## 0023: Hydrogens are drawn on their Atom, not placed on the Grid

Accepted (2026-11-21). Amended (2026-11-22): the removed Puzzles have new layouts too.

Every hydrogen is bonded to its Atom from the start. It isn't an Atom on the Grid, and the Player can't change it; the Board draws it as a small white ball on a short thin line beside its Atom, and an Atom needs its valence minus its hydrogens in Bonds to other Atoms ([Puzzle.07](spec/puzzle.md#puzzle)).

- **Why:** the hydrogens gave nothing to think about. An H has one Bond, and its partner was nearly always the Atom next to it. In the 20 Puzzles before this, of the 110 Atoms with one Bond (105 H, and Halothane's F, Cl and Br), 97 had a single nearest Atom with more than one Bond along their Dotted lines, and it was their partner; a line between two such Atoms is never a Bond; and the obvious moves of [0024](#0024) solved 12 of the 20 outright. Without them the Board is the Molecule's skeleton, and the reasoning is about its loops and Bond orders. Drawing the hydrogens, rather than writing CH₃ on the ball, keeps them visible and shows they are already bonded; the prototype in `prototypes/implicit-hydrogens.html` first wrote CH₃ on the ball, which looked odd, and now draws them.
- **Cost:** every Puzzle needs a new layout, and Molecules of only one or two Atoms besides their hydrogens, such as Water and Formaldehyde, can't be Puzzles any more. A Puzzle's format changes: each Atom gains its hydrogens. Boards stored for the old layouts mean other Bonds now, so Progress moves to a new key, as [0016](#0016) asks, and Players start again; what is under the old key stays in the browser, read only by builds from before this change on the same origin ([0009](#0009)). The removed Puzzles, those of [0022](#0022) and those removed with this change, are kept in `removed.ts` in the new format, with new layouts of exactly one solution, so that one could be moved back as it is; their old layouts, with their hydrogens as Atoms, are only in the history. Ammonia and Water are one Atom each, with nothing to bond. The Board is harder to read for a Player who counted H balls, and each Atom draws up to three small balls.
- **Alternatives:** keep every H on the Grid ([0002](#0002)) and make better layouts: a lot of generator work for hydrogens that still teach nothing. Write CH₃ on the ball: compact, but it reads as a formula, not as Atoms. Show only a number of hydrogens: less to draw, but the Bonds they make aren't seen. Carry over the solved marks of the four Puzzles whose ids stay, Acetic acid, Glycine, Glycerol and Serine: their layouts changed, so the ✓ would be on a Board the Player never built, and code to read the old key would stay for four marks.

<a id="0024"></a>
## 0024: Puzzles have loops

Accepted (2026-11-21). Its count of loops in the difficulty is undone by [0021](#0021) (2026-11-22): the difficulty counts empty Dotted lines again. Its Cost is out of date on two points: S has Puzzles, such as Biotin, Cystine and Glutathione; and some Puzzles have Dotted lines that cross, Biotin, N-Acetylneuraminic acid and Glutathione, and since plan 09 eight of its ten, so Bonds that cross come up in the game.

A loop of Dotted lines is a choice; without one, every Dotted line has to be a Bond to join the Atoms up, and only the Bond orders are left to find. So every Puzzle after a tutorial of three has at least 2 loops ([Puzzle.08](spec/puzzle.md#puzzle)), and a Puzzle's difficulty was its Dotted lines plus twice its loops: its Dotted lines minus its Atoms plus 1.

- **Why:** the Player in the prototype found the Puzzles with loops, such as citric acid, the good ones, and the ones without them a matter of connecting everything and filling in what is left. Counting loops rather than empty Dotted lines also counts the choice round a ring, where no line stays empty but each could have; for a Molecule with no ring the two are the same. The tutorial teaches single, double and triple Bonds and the first loop.
- **Cost:** a loop that closes on an Atom with one Bond to give, such as CH₃, OH or F, is decided at once, so loops alone don't make a Puzzle hard: Threonine and Valine have 3, and in the layouts tried the obvious moves solve them. Those moves are what a Player sees without trying anything: two Atoms with one Bond each never bond; a Bond is at most what the smaller of its Atoms needs, and at most triple; each line of an Atom takes at least what the Atom needs minus what its other lines can still give, and at most what it needs minus what they must give; and a Bond rules out the lines it crosses. Whether they solve a Puzzle is checked with a script while a batch is made, not by a test, and such Puzzles are left out. That leaves the halogens with no Puzzle for now, as the Molecules tried close their loops on them, and S too, as its one candidate, Cysteine, is Serine's layout. No ring of 3 Atoms fits the Grid, as three Atoms can't each share a row or a column with both others; rings of 4, 5 and 6 can, as a Dotted line may span empty points. No Puzzle chosen has Dotted lines that cross, so for now Bonds that cross ([Bond.05](spec/puzzle.md#bond)) don't come up in the game; the rule, its message and the panel's rule on it stay, for later Puzzles whose layouts have such lines (in the backlog).
- **Alternatives:** empty Dotted lines, as before ([0021](#0021)): the same for most Molecules, but blind to rings; chosen again after play, as a ring that is only traced isn't a choice. A difficulty from a solver that plays like a Player, the lines its obvious moves leave open: nearer to how hard a Puzzle feels, but new code and a measure to tune; the script used to choose this set does a simple version. Loops of 1: more Puzzles fit, but many with a single loop closed on a CH₃.

<a id="0025"></a>
## 0025: Atoms don't show what they need, and may have too many Bonds

Accepted (2026-11-22). Amended (2026-11-22): the numbers of Atoms with too few and with too many Bonds are not shown.

An Atom shows no badge and doesn't glow when it is complete, and a Bond can be made on an Atom that has all its Bonds, so it has too many. A Puzzle has a budget, the Bonds of its solution, shown as the Bonds used of it; going over it only means the Puzzle isn't solved ([Board.02](spec/ui.md#board), [Board.05](spec/ui.md#board), [Bond.04](spec/puzzle.md#bond), [Puzzle.09](spec/puzzle.md#puzzle)). A key in the panel shows each Element's number of Bonds ([Panel.05](spec/ui.md#panel)).

- **Why:** with a badge on every Atom and a refusal where one is full, the Player never had to count: the Puzzle was nearly always solved by following the badges, and Players found the Puzzles too easy. Now the Player counts hydrogens and Bonds, and has to try: an extra Bond where it is surely needed, before the one that isn't is taken away. Letting the Player go over, instead of refusing, allows that, and cycling a Bond up past a triple to none removes one that was too strong. The key makes the number of Bonds an Element needs easy to find.
- **Cost:** the Player gets less help, for the Puzzles that were meant as a tutorial too (the first three are easy enough). The Bonds used of the budget are the one number left, and it says little: Bonds used equal to the budget is not solved. A first version also showed the numbers of Atoms with too few and with too many Bonds; those changed with every Bond and told at once whether it was right, so they are gone, and the rules and the status keep them ([Valence.03](spec/puzzle.md#valence), [Check.02](spec/puzzle.md#check)) for a hint that marks which Atoms (backlog). A screen reader hears no more of an Atom than its place and hydrogens, and the Bonds used. Nothing stops a Board of nonsense, such as every Dotted line a triple Bond; it is just not solved. Solving doesn't change, so [Puzzle.01](spec/puzzle.md#puzzle) and the solutions, the difficulty, and Progress, with its solved marks and its Boards, stay as they are; a Board saved before is still one that can be on the Grid.
- **Alternatives:** keep the badges and only add the budget: the Player still follows the badges. A hard limit at the budget, no Bond made past it: the Player can't add before removing, and its count would be the same as the badges when one runs out. A hint button that marks the Atoms, limited per Puzzle: left for later, as it undoes much of this. The budget as the way to win: it follows from every Atom having exactly its Bonds, so it adds no rule.

<a id="0026"></a>
## 0026: The generator places Atoms in line with their partners, and backs up

Accepted (2026-11-24)

The search for layouts, `findLayout`, places each Atom in line with its partners already placed, inside the Grid, and goes back when one has no place ([Generate.03](spec/puzzle.md#generate)).

- **Why:** it placed the Atoms as a tree, each next to one partner, so a ring closed only if its last Atom happened to land in line with its first, and the layout had to fit 6 by 5 only once it was done. For Molecules with two rings or more, such as Caffeine and Sucrose, it found no layout in 400,000 tries; most tries ran into a dead end or grew too large. Placed in line and inside the Grid, every try that finishes closes its rings and fits, and Sucrose has layouts in 2,000 tries.
- **Cost:** the same arguments give other layouts than before, so the examples of [Generate.01](spec/puzzle.md#generate) change; the Puzzles keep their layouts, which are data. A try takes far longer than before, more the more Atoms, so the default is 2,000 tries instead of 20,000: measured while making plan 09, about half a second for Caffeine, 14 Atoms, and 5 to 30 s for its Puzzles of 16 to 25 Atoms. Fewer tries can miss a smaller or emptier layout that more would find.
- **Alternatives:** more tries of the old search: 400,000 found none. Layouts made by hand: slow, and nothing checks that the best one is kept. A Grid with more neighbours, such as the hex grid in the backlog: rings fit more easily, but every Puzzle's layout has to change.

<a id="0027"></a>
## 0027: The panel shows the open Puzzle's difficulty, as a number

Accepted (2026-11-24)

Under "Puzzle <n> of <N>" the panel shows "Difficulty <d>", the open Puzzle's difficulty ([Puzzle.05](spec/puzzle.md#puzzle), [Panel.01](spec/ui.md#panel)).

- **Why:** the Player asked to see it, to know how hard a Puzzle is before starting it. The number is the one the list is ordered by, so it never falls along the list, and it needs no scale or names to keep up to date as Puzzles are added. The panel has the open Puzzle already; the Player chose it over the list.
- **Cost:** the number has no unit, and its meaning, Dotted lines plus twice the empty ones, isn't explained on the page; a Player sees only that larger is harder. Two Puzzles of about the same number can still feel different ([0021](#0021)'s cost). The list doesn't show it, so to compare Puzzles the Player opens them. The line takes room at the top of the panel, which pushes the actions down on a phone; they still end well within the screen. A new measure of difficulty, such as one from a solver (backlog), would change the numbers Players have seen.
- **Alternatives:** in the list, on each button: compare at a glance, but wider buttons on a phone. Words or stars, such as Easy, Medium and Hard: easier to read, but bands to choose and move as harder Puzzles come. Only its number, "Puzzle 18 of 30": nothing to add, but it says nothing of how much harder one is than the one before.

<a id="0028"></a>
## 0028: Each component's interface is a file of types, in the terms of the side that uses them

Accepted (2026-11-27)

Each component has an `api.ts`: the types of what it offers, the types of what it needs from the others, written in its own terms, and re-exports of the values the Glue uses. A component imports nothing from another, not even a type; the Glue imports only `app.ts` and the `api.ts` files, and there `tsc` checks that what one component offers fits what another needs. A test checks the imports. Tests and scripts are not components, and import any file.

- **Why:** the interfaces were JSDoc in the files that use them, partly `object` and `Function`, and nothing checked them; the UI typed the game it is given with a type from the Puzzle, across [0011](#0011)'s boundary. TypeScript compares types by their shape, so a component can say exactly what it needs and still import only from itself, and the Glue, where the values already meet, is where the types meet. What drifted unseen now fails `tsc`: a status the rules add and the UI doesn't word, a field a Board entry in Storage lacks, an Element the UI has no look for.
- **Cost:** a type both sides use is written twice, once by each, such as the status; one more file per component, and the Glue's imports go through it. The JSON schemas stay the description of the data that is stored or written by hand, so a Puzzle's format is in its schema and in its type: the tests check the data against the schema, `tsc` against the type. Values copied between components, such as the valences in the panel's rule and the undo limit, stay copies: a type can't check them. Between components the types are trusted, and only data from outside is checked when it runs: a saved Board's shape is Storage's to check, not the game's, so Progress from anywhere else must go through Storage's checks too.
- **Alternatives:** types owned by the side that offers them, imported by the side that uses them: one copy, but a component imports from another. Types made from the JSON schemas: one source for the data, but a generator, and it covers only the data, not the functions between components. One shared file of types, such as `src/types.ts`, that every component and the Glue import: one copy of each type, the status included, but a fourth module that every component depends on, so they no longer import only from themselves ([0011](#0011)), and a change for one component is a change to all. JSDoc typedefs that nothing checks: no tool, but they drift as the JSDoc did. An `index.ts` for the values next to `api.ts` for the types: two files per component, with nothing checked that one doesn't check.

<a id="0029"></a>
## 0029: TypeScript, checked by tsc and run as it is

Accepted (2026-11-27)

The code, the tests and the Node scripts are TypeScript, strict, in only the syntax that can be erased (`erasableSyntaxOnly`): no enums, namespaces or parameter properties. `tsc` only checks (`noEmit`); esbuild bundles the code for the page, Vitest and Playwright run the tests, and Node runs the scripts with its type stripping, so nothing is compiled first and an import names its `.ts` file. tsc reads no `.js` file: an import of one fails the check, and any other goes unseen, so `tests/unit/typescript.test.ts` checks that `src/`, `tests/` and `scripts/` have none.

- **Why:** with the interfaces of [0028](#0028) as types, the code that offers them is checked against them too, not only the Glue that wires them; JSDoc says it at much greater length. Erasable syntax keeps the code JavaScript with types, so each tool runs it as it ran the JavaScript, with no build of its own.
- **Cost:** a newer Node, for type stripping: 22.18 instead of 22.12, the first Node 22 that strips types with no flag and no warning. Every file was renamed, so its history needs `git log --follow`. The page's elements are typed as the kind the code says they are (`querySelector<SVGSVGElement>`), which neither tsc nor the DOM checks; passing the class, `$("board", SVGSVGElement)`, would check it with `instanceof`, for one more argument at every lookup. esbuild and Node don't check types: a type error shows only in `npm run typecheck`, so a branch build ([0010](#0010)) may have one. `noUncheckedIndexedAccess` is off, so an index into an array is trusted; on, nearly every lookup of an Atom or a Bond needs a check or a `!`. Node's types are those of the oldest Node the README names, so `tsc` flags an API newer than that; `@types/node` 22.18's don't fit happy-dom's, so `skipLibCheck` is on, and no dependency's declaration files are checked. One `tsconfig` for everything, so Node's types, such as `process`, are seen in `src/` too, and `tsc` doesn't flag Node-only code in the page; the end-to-end tests run the built page.
- **Alternatives:** JavaScript with JSDoc types, checked by `checkJs`: no renames, but the types are comments, and strict it found 207 errors before the bodies were typed. The scripts run through a loader such as `tsx`, or with `--experimental-strip-types`: Node 22.12 would do, but a dependency, or a flag on every command. TypeScript compiled by `tsc`: any syntax, but a compile step before the scripts and the tests run. Only the interfaces as types, with JavaScript bodies: the bodies unchecked.

<a id="0030"></a>
## 0030: The look is one theme, in `src/ui/theme.ts`

Accepted (2026-11-28)

Every colour of the page, its font and its corners are in one theme object in `src/ui/theme.ts`, with how each Element's ball looks. The UI sets the page's part as CSS variables on the page's root, `--<name>`, when it starts; `style.css` uses only those variables, and `elements.ts` takes the balls from the theme. `tests/unit/ui/theme.test.ts` checks that `style.css` uses each variable and no other, and has no colours or fonts of its own. Sizes, spacing and the Board's geometry stay where they are used.

- **Why:** the look can be changed in one file, and another theme is a copy of `DARK` with other values; its type is `DARK`'s, so `tsc` flags a theme that leaves out a value. The Board's balls are SVG attributes, which can't read CSS variables, so a theme in CSS alone would not hold them, and the tests read their colours from `elements.ts`.
- **Cost:** `style.css` alone has no colours: the page shows them only once the script has run, and to read a rule's colour, look it up in the theme. A theme changes the screenshots ([0013](#0013)), which are then made again. No way to switch themes on the page yet.
- **Alternatives:** the variables in a `:root` block of `style.css` or a `theme.css`, with the balls' colours left in `elements.ts`: plain CSS, but the look in two places. The balls drawn with CSS classes per Element, so all of the theme is CSS: every Element needs its rules, and the tests would read colours from CSS instead of `elements.ts`.
