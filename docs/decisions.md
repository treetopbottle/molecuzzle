# Decisions

Any decision made about the project.

One short entry per decision. Don't renumber or rewrite: mark one `Superseded by NNNN` instead. An open question is `Undecided`. Make sure to add each entry to the index.

## Index

- [0001: One HTML file, plain JavaScript, no dependencies](#0001)
- [0002: A simplified valence model](#0002)
- [0003: Every hydrogen is an Atom on the Board](#0003)
- [0004: Molecules are compared as graphs](#0004)
- [0005: Alternating six-rings count as aromatic](#0005)
- [0006: Known Molecules are written in a SMILES subset](#0006)
- [0007: Other Known Molecules go to the Collection, not count as solved](#0007)
- [0008: All Levels are open](#0008)
- [0009: A seen solution doesn't count as solved](#0009)
- [0010: Progress lives in the browser](#0010)
- [0011: Layout by forces, from a depth-first circle](#0011)
- [0012: How to test](#0012)
- [0013: The bond grid is the game](#0013)
- [0014: ES modules, built into one HTML file](#0014)
- [0015: Vitest for rules and components, Playwright for the UI](#0015)
- [0016: Every Puzzle has exactly one solution](#0016)

<a id="0001"></a>
## 0001: One HTML file, plain JavaScript, no dependencies

Accepted (2026-11-10), superseded by [0014](#0014)

The game is a single `index.html` with inline CSS and JavaScript, and loads nothing else.

- **Why:** the brief asked for a single-page web game; it opens from disk, offline, with no build or server.
- **Cost:** one long file without modules; no chemistry library, so parsing and matching are our own code ([0004](#0004), [0006](#0006)).
- **Alternatives:** a framework with a bundler: a build step for little gain. RDKit.js for chemistry: megabytes of WebAssembly for what a few hundred lines do here.

<a id="0002"></a>
## 0002: A simplified valence model

Accepted (2026-11-10)

Each Element has a fixed list of allowed bond counts; there are no charges, ions or lone pairs.

- **Why:** a Player can learn the rule in a minute ("C forms 4"), and the dots can show it.
- **Cost:** Molecules that need formal charges can't be built: carbon monoxide, nitric acid, nitro groups, salts. Targets and Known Molecules are chosen to fit.
- **Alternatives:** formal charges and lone pairs: closer to real chemistry, but much harder to show and to play.

<a id="0003"></a>
## 0003: Every hydrogen is an Atom on the Board

Accepted (2026-11-10)

The Player places and bonds every H, instead of hydrogens being implied as in skeletal formulas.

- **Why:** the puzzle is "here are your atoms, build the molecule"; hiding H would hide part of it.
- **Cost:** more clicks on bigger Levels (13 Atoms for Phenol), which limits how big a target can be.
- **Alternatives:** implicit hydrogens: faster, but the Player would no longer use all the given Atoms.

<a id="0004"></a>
## 0004: Molecules are compared as graphs

Accepted (2026-11-10), superseded by [0016](#0016)

The Board is turned into a graph of non-hydrogen Atoms, each with its count of bonded H, and compared to Known Molecules by backtracking isomorphism, matching Element, H count and Bond orders.

- **Why:** which Atom the Player used where is arbitrary ([Check.07](spec/README.md#check)); folding H into counts keeps the search small, since swapping interchangeable H Atoms would otherwise make it blow up.
- **Cost:** our own matching code to keep correct. An H bonded to H stays a node, so H₂ is a special case that works.
- **Alternatives:** a canonical SMILES string: more code to get right than matching graphs this small.

<a id="0005"></a>
## 0005: Alternating six-rings count as aromatic

Accepted (2026-11-10), superseded by [0016](#0016)

Before comparing, every six-ring of alternating single and double Bonds gets Bond order 1.5, on both sides.

- **Why:** the two ways to draw Benzene (Kekulé structures) are one Molecule; for Phenol they aren't the same graph otherwise.
- **Cost:** only six-rings are handled; a non-aromatic alternating six-ring would also be treated as aromatic. None of the Known Molecules has one.
- **Alternatives:** accept only one drawing: half the correct answers would be rejected.

<a id="0006"></a>
## 0006: Known Molecules are written in a SMILES subset

Accepted (2026-11-10), superseded by [0013](#0013)

Each Known Molecule is one line of SMILES, read by a small parser: atoms, `[H]`, `-` `=` `#`, branches and ring closures. Implicit H fill each atom up to its smallest valence that fits.

- **Why:** compact, readable and standard; adding a Known Molecule is one line, and the same data drives matching and Show solution.
- **Cost:** our own parser; no aromatic lowercase, charges or stereochemistry.
- **Alternatives:** hand-written atom and bond lists: long and easy to get wrong.

<a id="0007"></a>
## 0007: Other Known Molecules go to the Collection, not count as solved

Accepted (2026-11-10), superseded by [0013](#0013)

Only the target solves a Level. Any other Known Molecule the Player builds gets named and added to the Collection.

- **Why:** naming the wrong-but-real answer teaches isomers, the point of the game; the Collection rewards trying them.
- **Cost:** the list of Known Molecules has to be curated; a valid Molecule that isn't on it gets only a general message.
- **Alternatives:** accept any Molecule that follows the bonding rules: no puzzle left in Levels with Isomers.

<a id="0008"></a>
## 0008: All Levels are open

Accepted (2026-11-10)

No Level is locked; the order only suggests a path.

- **Why:** a stuck Player can skip ahead, and someone who knows the basics can jump in.
- **Cost:** less sense of progression.
- **Alternatives:** unlock one by one: frustrating, and the Show solution button undercuts it anyway.

<a id="0009"></a>
## 0009: A seen solution doesn't count as solved

Accepted (2026-11-10)

Show solution marks the Level "Solution seen"; it becomes solved only when the Player builds it from an empty Board.

- **Why:** a stuck Player can learn from the answer while ✓ still means "built it myself".
- **Cost:** an extra state to show and store.
- **Alternatives:** no solution button: Players get stuck; counting it as solved: ✓ means nothing.

<a id="0010"></a>
## 0010: Progress lives in the browser

Accepted (2026-11-10)

Progress is kept in `localStorage`, key `molecuzzle-v1`; the game works without it.

- **Why:** no server or accounts ([0001](#0001)).
- **Cost:** Progress is per browser and device, and goes when site data is cleared.
- **Alternatives:** a server with accounts: hosting and personal data for a small game.

<a id="0011"></a>
## 0011: Layout by forces, from a depth-first circle

Accepted (2026-11-10), superseded by [0013](#0013)

Show solution and Tidy up place Atoms with a force simulation: Bonds pull, all Atoms push apart. For Show solution it starts from the non-hydrogen Atoms on a circle in depth-first order, and keeps the best of 8 tries by fewest crossing Bonds, then fewest Atoms too close.

- **Why:** a breadth-first start left rings tangled (seen with Phenol); depth-first follows the ring around the circle.
- **Cost:** layouts are random and don't have textbook angles.
- **Alternatives:** fixed coordinates per Level: more data to maintain, and no help for Tidy up.

<a id="0012"></a>
## 0012: How to test

Undecided, superseded by [0015](#0015)

There are no automated tests yet. While the game was built, it was checked by loading `index.html` in headless Chromium with an injected script that solved every Level with Show solution and checked one Isomer message, plus screenshots at 1280×800 and 390×844. A setup plan should settle the tool and the helpers that turn the spec's rules into tests.

<a id="0013"></a>
## 0013: The bond grid is the game

Accepted (2026-11-11)

The game is the bond grid prototype, grown to several Puzzles. The first game, where Atoms are dragged and bonded freely to build a target, is kept as `prototypes/drag-and-bond.html`, outside the spec.

- **Why:** each Puzzle is a logic puzzle with one answer, which the Player can reason out from the valences alone; no dragging, so it plays the same with mouse, touch and keys.
- **Cost:** no Isomers, Collection or Known Molecules ([0006](#0006), [0007](#0007)); no free layout ([0011](#0011)); each Puzzle needs a Grid layout, found with `scripts/generate.js`; only H, C, N and O for now.
- **Alternatives:** keep the drag-and-bond game and add the grid as a mode: two games to spec and test, before knowing which one works.

<a id="0014"></a>
## 0014: ES modules, built into one HTML file

Accepted (2026-11-11)

The code is plain JavaScript in ES modules in `src/`; `npm run build` bundles them with esbuild and inlines the bundle and CSS into `dist/index.html`. Dependencies are for development only.

- **Why:** modules are components with small interfaces that tests import directly; the built file still opens from disk, offline, with no server, as in [0001](#0001).
- **Cost:** a build step and Node.js to develop; `dist/` isn't in git, so playing needs a build.
- **Alternatives:** loading `src/` as modules in the browser: needs a server, since browsers don't load modules from `file://`. A framework: more than the page needs.

<a id="0015"></a>
## 0015: Vitest for rules and components, Playwright for the UI

Accepted (2026-11-11)

Rules and components (`board.js`, `puzzle-list.js` in happy-dom) are tested with Vitest; the built page with Playwright in Chromium, at 1280×800 and, for layout, 390×844. Expected results are inline snapshots: the Board drawn as text (`tests/helpers/draw.js`) and accessibility snapshots of the page. A test's name starts with the rule ids it covers.

- **Why:** inline snapshots read like the spec's examples; testing the page through roles and names also keeps the Board usable with a screen reader and keys.
- **Cost:** two test runners; Playwright needs a Chromium download or `CHROMIUM_PATH`.
- **Alternatives:** `node:test`: no inline snapshots. Only Playwright: slower, and rules are hard to reach through the page.

<a id="0016"></a>
## 0016: Every Puzzle has exactly one solution

Accepted (2026-11-11)

A solver (`src/solver.js`) counts the solutions of a Grid; a test checks each Puzzle has exactly one, and that it is the one Show solution shows. Any Board where every Atom is complete and all join up is then that solution, so the game doesn't compare Molecules.

- **Why:** a logic puzzle needs one answer to reason towards; with it, no graph matching ([0004](#0004)) or aromatic rings ([0005](#0005)) are needed.
- **Cost:** some Molecules can't be Puzzles: any ring of alternating Bonds, such as Benzene, has two solutions; Grids must be searched for, which `scripts/generate.js` does.
- **Alternatives:** accept any valid Board and name it: back to matching Molecules, and Puzzles with many answers.
