- I think we need more schemas, for example of a puzzle, of the board state
- Components should be more clear:
  + Puzzle component creates new puzzles, defines the puzzle schema, and provides the code to validate puzzle solutions
  + Data component / layer to store and retrieve puzzle progress and UI state 
  + UI components that defines the UI elements and provides triggers for the functionality
  + Glue component that combines the different components into a playable game, for example using dependency injection
- Then the features should be split per component. Puzzle features that specifies the puzzle functionality. Data features that define what data is stored, where and how, and how it's accessible and by who. The UI features explain how to interact with the puzzles and how it is shown (should include screenshots of UI elements, like buttons, that are tested with snapshot testing, could be a single screenshot or one per component; should also include screenshots of the different pages in the application, like the homepage). The glue component doesn't need any defined features, it is just an architectural decision.

## Outcome

Dealt with by [plan 02](../02-components/README.md). The commits are each step's tests and implementation; the fixes from its reviews are in the review files of that plan.

- More schemas: JSON Schemas of a Puzzle, a Board and Progress in `docs/spec/schemas/` (735d74c, e98dfdf: decision 0012), which the tests check the data against (966e16a, d1f1612, efe7b99). A Board is only the Bonds; Progress keeps the rest of a Board's state, whether the solution was shown and the undo history, in an entry per Puzzle in progress (978e173; 447602c, 5c8c915).
- Clearer components: four, each a folder but the Glue (e98dfdf: decision 0011; 5261b50):
  - Puzzle: finds the layout of a new Puzzle with `findLayout`, through `scripts/generate.js`; the name, formula and fact are still written by hand (70388da, 2df0b4d). Its schema is in the spec, as part of Puzzle.01, not in `src/` (735d74c, decision 0012). Its rules check a Board and give statuses and reasons, no text (d7b1b89, f33de91).
  - Data, named Storage (7a4979e): the Progress store, `load` and `update` (78b63d4, 7bbaa10). The UI state was taken to be the open Puzzle, kept already, and every Puzzle in progress with its undo history (978e173: decision 0015; a7e5e86, 2143e3d, 447602c, 5c8c915).
  - UI: the panel (8040b88, 732e8be) and `createUi`, which owns the page and calls its handlers (9ad8d21, f7cf6b0).
  - Glue: `app.js`, with its dependencies passed in by `browser.js`, no framework (9ad8d21, f7cf6b0).
- Features per component: `puzzle.md`, `storage.md` (what is kept, where and how, and who can read it) and `ui.md`, and none for the Glue (735d74c, 7a4979e). `ui.md` has screenshots of the game's one page, at the start, solved and on a phone, and of its parts, the buttons included, compared pixel for pixel with Playwright's default tolerance in Playwright's image (e98dfdf, eacc7b5, e5a3b50: decision 0013; b37074d, f20fb59).
