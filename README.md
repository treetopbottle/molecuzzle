# Molecuzzle

A puzzle game in the browser where you join a given set of atoms into a real molecule; one HTML file with CSS and plain JavaScript.

## Why?

Mission: let people learn how atoms bond, and how the same atoms can make different molecules (isomers), by building real molecules themselves, without installing anything.

Vision: chemistry feels like a puzzle you can solve, not a list of formulas to memorise.

## Who?

Roles, capitalized, each with an example the spec can reuse:

- Player: someone learning or curious about chemistry who plays the Levels in a browser, on a computer or phone; Noor, a 15-year-old in a first year of chemistry

## What?

Domain entities, capitalized, each with an example the spec can reuse:

- Element: a kind of atom, with the numbers of Bonds it can form (its valences); Carbon, 4 Bonds
- Atom: one Element on the Board, which the Player can move and bond; one of the six H Atoms in Level 24
- Bond: a link between two Atoms, single, double or triple; the C=O double Bond in Formaldehyde
- Board: the area where the Player moves and bonds the Atoms of a Level; the Board of Level 2 with one O and two H Atoms
- Molecule: Atoms connected by Bonds into one piece, each Atom with an allowed number of Bonds; Water
- Known Molecule: one of the 60 Molecules the game recognises, each with a name, formula and fact; Propylene oxide, C₃H₆O
- Isomer: a Molecule with the same Atoms as another, joined differently; Dimethyl ether is an Isomer of Ethanol
- Level: a target Known Molecule and exactly the Atoms it is made of; Level 15, Ethanol, C₂H₆O
- Collection: the Known Molecules the Player has built so far; 12 of 60
- Progress: per Level, whether it is solved or its solution was seen, plus the Collection; stored in the browser

## Where things are

- [CONTRIBUTING.md](CONTRIBUTING.md): starting point for new developers and coding agents.
- [`index.html`](index.html): the code, the whole game. There are no automated tests yet (see the [backlog](docs/plans/README.md)).
- [docs/spec/](docs/spec/README.md): specification of the current version.
- [docs/decisions.md](docs/decisions.md): any decisions made about the project.
- [docs/plans/](docs/plans/README.md): implementation plans, for small changes or bigger parts of the specification.
- [docs/workflow/](docs/workflow/): the software development lifecycle of this project.

## Development

From this folder:

- Run: open `index.html` in a browser, e.g. `xdg-open index.html`. No build, server or network needed.
- Test: none yet; the setup slice in the backlog adds them ([decision 0012](docs/decisions.md#0012)).
- Check: none yet.
