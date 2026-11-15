# Plans

One folder per feature or slice of work, `NN-<slug>/`: the plan is its `README.md` and every review is a separate file. Finished plans stay as history.

The bond grid game, its tests and the move to the GAAD template's latest layout were done on request, without a plan; the [spec](../spec/README.md) and [decisions](../decisions.md) describe them as they are.

| Plan | Status |
|---|---|

## Backlog

Contains features, slices or small tasks to work on, in order of importance.

- Review the bond grid game against the spec ([review](../workflow/review.md) of the decisions and the code).
- Deploy the puzzle that is build from the `main` branch to a production environment, GitHub Pages is only for testing.
- More Puzzles, larger and harder; `scripts/generate.js` finds the layouts.
- The halogens (F, Cl, Br, I; 1 Bond) and S (2 Bonds) as Elements, for more real Molecules: chloroform, vinyl chloride, thiols, CS₂. They play like H and O, so they add variety, not harder logic.
- A hex grid, with Atoms in the cell centres, or diagonals on the square grid: up to 6 (or 8) neighbours instead of 4, so Atoms with 5 or 6 Bonds fit, such as P in PCl₅ and S in SF₆. Diagonals cross in every square; the hex grid doesn't, but every Puzzle's layout has to be generated again.
- A more complicated valence model: formal charges, and Elements with more than one valence (S 2, 4 or 6; P 3 or 5), for Molecules such as carbon monoxide (⁻C≡O⁺), nitro groups and nitric acid. Each Atom still shows the one number of Bonds it needs (N⁺ needs 4, O⁻ needs 1), so Puzzles stay logic with one solution; letting the Player choose an Atom's valence would leave few Grids with exactly one solution. Goes against [0001](../decisions.md#0001).
- Moving between Dotted lines with the arrow keys, instead of only Tab.
- Reset progress, from the Puzzles list.
- Import and export Progress, e.g. as a file or a code to paste, to move it to another browser or device, or keep it when site data is cleared ([0005](../decisions.md#0005)).
- Formatting and linting: there are none yet. Add a formatter and a linter (Biome alone, or Prettier with ESLint) and run them in `npm run check`.
