# Decisions

Why things are the way they are. If we throw the code away, this is what we keep.

One short entry per decision. Don't renumber or rewrite: mark one `Superseded by NNNN` instead. An open question is `Undecided`. Add each entry to the index.

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

<a id="0001"></a>
## 0001: One HTML file, plain JavaScript, no dependencies

Accepted (2026-11-10)

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

Accepted (2026-11-10)

The Board is turned into a graph of non-hydrogen Atoms, each with its count of bonded H, and compared to Known Molecules by backtracking isomorphism, matching Element, H count and Bond orders.

- **Why:** which Atom the Player used where is arbitrary ([Check.07](spec/README.md#check)); folding H into counts keeps the search small, since swapping interchangeable H Atoms would otherwise make it blow up.
- **Cost:** our own matching code to keep correct. An H bonded to H stays a node, so H₂ is a special case that works.
- **Alternatives:** a canonical SMILES string: more code to get right than matching graphs this small.

<a id="0005"></a>
## 0005: Alternating six-rings count as aromatic

Accepted (2026-11-10)

Before comparing, every six-ring of alternating single and double Bonds gets Bond order 1.5, on both sides.

- **Why:** the two ways to draw Benzene (Kekulé structures) are one Molecule; for Phenol they aren't the same graph otherwise.
- **Cost:** only six-rings are handled; a non-aromatic alternating six-ring would also be treated as aromatic. None of the Known Molecules has one.
- **Alternatives:** accept only one drawing: half the correct answers would be rejected.

<a id="0006"></a>
## 0006: Known Molecules are written in a SMILES subset

Accepted (2026-11-10)

Each Known Molecule is one line of SMILES, read by a small parser: atoms, `[H]`, `-` `=` `#`, branches and ring closures. Implicit H fill each atom up to its smallest valence that fits.

- **Why:** compact, readable and standard; adding a Known Molecule is one line, and the same data drives matching and Show solution.
- **Cost:** our own parser; no aromatic lowercase, charges or stereochemistry.
- **Alternatives:** hand-written atom and bond lists: long and easy to get wrong.

<a id="0007"></a>
## 0007: Other Known Molecules go to the Collection, not count as solved

Accepted (2026-11-10)

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

Accepted (2026-11-10)

Show solution and Tidy up place Atoms with a force simulation: Bonds pull, all Atoms push apart. For Show solution it starts from the non-hydrogen Atoms on a circle in depth-first order, and keeps the best of 8 tries by fewest crossing Bonds, then fewest Atoms too close.

- **Why:** a breadth-first start left rings tangled (seen with Phenol); depth-first follows the ring around the circle.
- **Cost:** layouts are random and don't have textbook angles.
- **Alternatives:** fixed coordinates per Level: more data to maintain, and no help for Tidy up.

<a id="0012"></a>
## 0012: How to test

Undecided

There are no automated tests yet. While the game was built, it was checked by loading `index.html` in headless Chromium with an injected script that solved every Level with Show solution and checked one Isomer message, plus screenshots at 1280×800 and 390×844. A setup plan should settle the tool and the helpers that turn the spec's rules into tests.
