- I think we need more schemas, for example of a puzzle, of the board state
- Components should be more clear:
  + Puzzle component creates new puzzles, defines the puzzle schema, and provides the code to validate puzzle solutions
  + Data component / layer to store and retrieve puzzle progress and UI state 
  + UI components that defines the UI elements and provides triggers for the functionality
  + Glue component that combines the different components into a playable game, for example using dependency injection
- Then the features should be split per component. Puzzle features that specifies the puzzle functionality. Data features that define what data is stored, where and how, and how it's accessible and by who. The UI features explain how to interact with the puzzles and how it is shown (should include screenshots of UI elements, like buttons, that are tested with snapshot testing, could be a single screenshot or one per component; should also include screenshots of the different pages in the application, like the homepage). The glue component doesn't need any defined features, it is just an architectural decision.
