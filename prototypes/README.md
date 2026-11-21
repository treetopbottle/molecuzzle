# Prototypes

Throwaway try-outs of puzzle modes, outside the spec. Each is one HTML file; open it in a browser.

- [drag-and-bond.html](drag-and-bond.html): the first version of the game: drag atoms freely and bond them into a target molecule, over 25 levels, with isomers named and collected. Its spec and decisions are in git history.
- [bond-grid.html](bond-grid.html): atoms sit on a grid; bond them along rows and columns, without crossings, until every atom is complete and all join into one molecule. Puzzle: glycine. It grew into the game in `../src/`.
- [free-build.html](free-build.html): atoms with no target; any valid molecule that uses them all counts, and the page counts how many different ones each set can make. Sets: C₂H₆O (2), C₃H₆O (9), C₄H₂ (7). Built from copies of the code in `drag-and-bond.html`.
- [implicit-hydrogens.html](implicit-hydrogens.html): the bond grid without hydrogens on the Grid: each atom's hydrogens are drawn small beside it, already bonded, so it needs its valence minus them in bonds to other atoms, and the reasoning is about the skeleton, its bond orders and its loops of dotted lines. Seven Puzzles, from acetic acid to glucose, most of them rings. Layouts from `scripts/generate.js` with stand-in Elements, each with exactly one solution.
- [fill-elements.html](fill-elements.html): a molecule's skeleton without elements or bond types; place the atoms so every one can get its number of bonds. Puzzle: N-methylacetamide.

The bond grid and fill-elements puzzles were checked by trying every possibility: the bond grid has exactly one solution; in fill-elements only one molecule fits, placed either way round on its symmetric skeleton. If a mode is kept, it goes through the workflow: backlog, spec rules, a plan.
