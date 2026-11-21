# Plans

One folder per feature or slice of work, `NN-<slug>/`: the plan is its `README.md` and every review is a separate file. Finished plans stay as history.

The bond grid game, its tests and the move to the GAAD template's latest layout were done on request, without a plan; the [spec](../spec/README.md) and [decisions](../decisions.md) describe them as they are.

| Plan | Status |
|---|---|
| [02: Components](02-components/README.md) | Done (2026-11-21) |
| [03: Solved Puzzles keep their solution](03-keep-solved/README.md) | Done (2026-11-21) |
| [04: The halogens and sulfur](04-halogens-and-sulfur/README.md) | Done (2026-11-21) |
| [05: Larger and harder Puzzles](05-larger-puzzles/README.md) | Done (2026-11-21) |

## Backlog

Contains features, slices or small tasks to work on, in order of importance.

- Deploy the puzzle that is build from the `main` branch to a production environment, GitHub Pages is only for testing.
- A hex grid, with Atoms in the cell centres, or diagonals on the square grid: up to 6 (or 8) neighbours instead of 4, so Atoms with 5 or 6 Bonds fit, such as P in PCl₅ and S in SF₆. Diagonals cross in every square; the hex grid doesn't, but every Puzzle's layout has to be generated again.
- A more complicated valence model: formal charges, and Elements with more than one valence (S 2, 4 or 6; P 3 or 5), for Molecules such as carbon monoxide (⁻C≡O⁺), nitro groups and nitric acid. Each Atom still shows the one number of Bonds it needs (N⁺ needs 4, O⁻ needs 1), so Puzzles stay logic with one solution; letting the Player choose an Atom's valence would leave few Grids with exactly one solution. Goes against [decision 0001](../decisions.md#0001).
- Moving between Dotted lines with the arrow keys, instead of only Tab.
- Clicking the open Puzzle in the Puzzles list opens it again, which stops the pulse of a Puzzle just solved; it could do nothing (review of step 2 of plan 03).
- The buttons of the Puzzles list keep one width: a solved one, "11 ✓", is wider, so the buttons after it in its row are out of line with the rows above and below (review of step 4 of plan 04).
- The Puzzles list keeps focus: it rebuilds its buttons on every render, so the button the Player clicked or tabbed to loses focus (review of step 7 of plan 02).
- Import and export Progress, e.g. as a file or a code to paste, to move it to another browser or device, or keep it when site data is cleared ([decision 0005](../decisions.md#0005)).
- `scripts/generate.js` stops with a message for Bonds that don't join into one Molecule, such as `H1-O1 H2-H3`, which now end in a TypeError (review of step 3 of plan 04).
- Formatting and linting: there are none yet. Add a formatter and a linter (Biome alone, or Prettier with ESLint) and run them in `npm run check`.
- Use event sourcing for undo history
- Detect cycles in undo history: when the same actions are done in a row and that leads to the same state as before the latest actions are removed from the undo. For example, cycling through zero, one, two, and three bonds between two atoms.