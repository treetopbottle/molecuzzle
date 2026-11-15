# Review of plan 02: Components, round 2

Commits reviewed: `5a77a88..978e173`. f8d79b1 has the fixes for the [first review](review-plan.md). a4315fd and ec75ed1 add and update its Outcome. 1c17cf4 keeps the open Puzzle's Board (0014). 978e173 keeps every Puzzle in progress, with its undo history, until it is solved or reset (0015 supersedes 0014; Bond.08–10 change; Input.05 is new). The code and tests were read at 978e173. `npm test` passes (66 tests), as expected for a docs-only range. Ajv isn't installed, so the schema was checked by reading it.

## Findings

1. **must fix**: The spec says the revealed flag means "whether the Bonds show the solution". That contradicts Help.02 and the code, and it can count a shown solution as solved after a reload.
   - Where: `docs/spec/puzzle.md:11` (Puzzle.03: "whether it shows the solution"), `docs/spec/data.md:11` (Progress.05: "whether they show the solution") and `docs/spec/schemas/progress.schema.json:34` ("Whether the Bonds show the solution").
   - The rules: `docs/spec/puzzle.md:124` (Bond.10) now allows Undo while the solution is shown. `docs/spec/puzzle.md:242` (Help.02) says building solves only "once the Board has no Bonds again".
   - The code: `src/game.js:65-68` and `tests/unit/game.test.js:238` ("back to one Bond: still revealed") keep the flag true after that Undo. The Bonds no longer show the solution at that point.
   - The risk: a `saved()` written from the spec stores `revealed: false` after Show solution and Undo. After a reload the Player rebuilds the last Bond and the Puzzle is marked solved, which breaks 0004 and the "also after a reload" goal.
   - Fix: define the flag as "the solution was shown since the Board last had no Bonds", in Puzzle.03, Progress.05, the schema and Bond.08 (Undo keeps it). Add an example and a step 9 test: show the solution, Undo, reload, rebuild, and the status is still revealed.
2. **should fix**: Bond.10's parts are untested again, and the Outcome is stale.
   - 978e173 removed step 2's "Bond.10 also while the solution is shown, and with Reset" (`docs/plans/02-components/README.md:85-86`).
   - Step 9 (`README.md:107`) only tests Undo while the solution is shown, and nothing to undo after solving.
   - No step tests that "changes don't change Bonds" while the solution is shown, or that "Reset still works" on a solved or revealed Board. The only existing test is `tests/unit/game.test.js:149`, for a solved Board.
   - That is first-round finding 4 again. `review-plan.md:59` (Outcome 4) still says step 2 tests Bond.10. `review-plan.md:67` (Outcome 12) names 0014 and its step 9, which 978e173 replaced.
3. **should fix**: The Data component's part in Progress.05 is in no step.
   - `README.md:46` gives `createProgressStore` no `boards`. Today `loadProgress` returns only `puzzles` and `current` (`src/progress.js:13`), so `boards` is dropped on load.
   - Step 6 tests the store "as the old functions did" (`README.md:98`). Step 9 (b) names only `game.js`, `app.js` and `ui/ui.js` (`README.md:108`).
   - So nothing loads `boards`. Nothing tests Progress.03's "a Puzzle's entry that doesn't fit the schema is left out" for a `boards` entry (`docs/spec/data.md:9`). That would be, for example, `undo` with 301 Boards, or `revealed: "yes"`, dropping the whole entry.
   - Add `data/progress.js` to step 9 with these tests. Also say the runtime check is written by hand: Ajv is a development dependency only, and 0012 lists hand-written checks as a rejected alternative.
4. **should fix**: That an empty `boards` is left out is only in an example.
   - In `docs/spec/data.md:19` (Progress.01), solving Water removes its entry, and the stored value has no `boards`.
   - In `docs/spec/data.md:43`, an empty `"puzzles":{}` is kept.
   - No rule says the two differ, and the Design (`README.md:50`) only says "without its entry". Step 9 tests the example, so say it in Progress.05 or in `docs/spec/schemas.md:35`.
5. **should fix**: "After every change" (`docs/spec/data.md:11`) isn't defined for Undo, Reset or Show solution.
   - `docs/spec/puzzle.md:114` defines a change as one stronger or one weaker, which leaves the three actions out.
   - The second Progress.05 example (`data.md:49-51`) needs Show solution to save. Undo and Reset must save too, or a reload brings back the Board before them.
   - The Design (`README.md:50`) and step 9's Glue tests ("a change saves…", `README.md:107`) only cover changes. Name Undo, Reset and Show solution in the rule and the tests.
6. **should fix**: `docs/spec/data.md:11`: "a Puzzle with Bonds or something to undo, whose Board isn't solved, is in progress" is unclear for a shown solution. That Board has every Atom complete and in one piece, and the second Progress.05 example needs it kept. Write "whose status isn't solved" ([Check.04](puzzle.md#check)), or name the shown solution.
7. **should fix**: The Player can't clear a Puzzle whose Board has no Bonds but has undo history.
   - Example: one Bond, then weaker. The history is `[[], [[0,1,1]]]` and there are no Bonds.
   - That Puzzle is in progress (`data.md:11`), but Reset does nothing and is disabled (`puzzle.md:123`, `ui.md:55`).
   - Its entry stays in `boards`, and it opens with Undo enabled, until the Player makes a Bond again and resets or solves.
   - That goes against 0015's "Reset is how a Player starts again" and its Cost "stays there until it is solved or reset" (`docs/decisions.md:200-201`). The rules don't say whether this is intended.
   - Fix one of three ways: enable Reset while there is something to undo; let Bond.09 clear the history with no Bonds; or don't count a Board with no Bonds as in progress.
8. **should fix**: `docs/decisions.md:77` (0004) says Show solution "changes nothing in Progress".
   - Show solution now writes a `boards` entry with the revealed flag (Progress.05, second example). So 0004 no longer matches the spec.
   - Supersede it, or have 0015 say that 0004's "Progress" means the solved marks.
9. **should fix**: Step 9 (`README.md:106-108`) is now the largest step.
   - It covers `createGame`'s options and the checks against the Grid, `saved()`, and clearing history on Reset and solving. It also covers the old Bond.08–10 tests, saving and restoring in the Glue and (finding 3) the store, the confirm for Reset, and three or more end-to-end tests with their dialogs.
   - The first review split the old step 6 for less. Split this one, for example: (i) Puzzle.03 and Bond.08–10 in `game.js`; (ii) Progress.05 in Data and the Glue; (iii) Input.05.
10. **should fix**: Several step 9 (a) tests pass before (b), and the plan doesn't say so. First-round finding 7 asked for this.
    - Undo while the solution is shown: `src/game.js:64` doesn't check `done()`.
    - The stored value of the Progress.01 example has no `boards`: nothing writes it today.
    - The third Progress.05 example, solved and then opened with no Bonds: nothing is kept today.
    - "A stored value that is a valid Progress".
    - In step 4 (`README.md:92`), "what `saveProgress` stores is a valid Progress" also passes at once, but only the other two tests there are listed as passing.
11. **should fix**: Saving on every change makes "last writer wins" between tabs much more frequent.
    - Today Progress is saved only when a Puzzle opens and when one is solved (`src/app.js:34,48`). Now every click writes the whole Progress from the tab's memory.
    - A second tab, for example the `main` build next to a branch build, which share the key by Progress.04 (`data.md:10`), overwrites the other tab's `boards` and its new solved marks on every click.
    - The `main` build as it is also drops `boards` on its next save (`src/progress.js:13`).
    - Progress.05 promises the Player "goes on where they were". State that the last writer wins, or have the Glue read the store before it writes.
12. **note**: Storage size.
    - A full Alanine Board is about 110 characters, so 300 Boards are about 33 KB for one Puzzle.
    - With all 13 Puzzles in progress, that is roughly 250–500 K characters. `localStorage` counts UTF-16, so up to about 1 MB of a 5 MB quota, shared by the whole origin, other Pages sites of the same account included. All of it is rewritten on every click.
    - The README's vision of hundreds of Puzzles grows this to many MB.
    - When `setItem` throws `QuotaExceededError`, `saveProgress` keeps nothing (`src/progress.js:21`). That includes the solved mark of the click that solved the Puzzle.
    - 0015's Cost names the size, but not the losses on a full quota.
13. **note**: The spec doesn't say what happens to a `boards` entry for a Puzzle id that no longer exists: it stays forever, as unknown ids in `puzzles` already do.
    - An entry that fails Puzzle.03 on opening is removed only after the next change to that Puzzle, not on opening.
    - That `current` with an unknown or missing id opens Puzzle 1 is only in an example (`data.md:25-27`), not a rule.
14. **note**: Gaps in the schema and in Puzzle.03.
    - The schema requires only `bonds` in an entry (`progress.schema.json:25-27`), and no rule gives the defaults for a missing `revealed` or `undo`. An entry with the solution's Bonds and no `revealed` would open as solved, and the Glue would mark it (as `src/app.js:46-48` does), against 0004. Require `revealed`, or say a restored Board is never marked solved.
    - `docs/spec/schemas.md:35` says "Every field is optional", but `bonds` is required in an entry.
    - Puzzle.03's list of Boards that can't be on the Grid (`puzzle.md:11`) leaves out a pair that appears twice, which the Board's "Also" forbids (`schemas.md:23`).
    - Puzzle.03 doesn't say the revealed flag is false when it starts with no Bonds.
15. **note**: Decisions.
    - 0014 is marked "Superseded by [0015]" and keeps its text and index entry. That is right.
    - 0015 keeps the why, the cost and the alternatives.
    - Its alternative "Reset that Undo brings back … then nothing ever ends the history" (`decisions.md:202`) isn't accurate: solving would still end it.
    - One alternative is missing: Reset that Undo can bring back during the session, without keeping it.
    - In the index, the Technical entries aren't in number order (0005, 0014, 0015, 0006; `decisions.md:23-28`). 0015 also changes Game rules (Reset, Undo), so it might belong under Game.
16. **note**: Small Design gaps.
    - `main.js` passes `h => createUi(document, h)` (`README.md:50`) with no `confirm`, so `createUi` needs a default, `doc.defaultView.confirm`, as `src/app.js:14` has today. The Design doesn't say so.
    - Step 3 (b) calls `reasonText(result)` (`README.md:90`), but the Design gives `reasonText(result, atoms)` (`README.md:47`).
17. **note**: Checked, no finding.
    - The first review's Outcomes 1, 3, 5–11, 13–15 and 17–25 hold as written: the Progress.03 wording and example, Help.01's solved case, the table, `saveProgress` in step 4, the guarded `localStorage`, `say(result)`, a Puzzle-shaped `findLayout`, the Generate.01 arrays, the split of the old step 6, Ajv2020, Bond.11, the Board's order, the Glue's tests with fakes, the paths in 0007 and 0008, and the narrative's tags.
    - Outcome 2 holds too: Panel.02 (`ui.md:120`) fits the static heading at `src/index.html:27`.
    - `progress.schema.json` is valid JSON Schema 2020-12: the relative `$ref` resolves against `$id`, `maxItems` matches `UNDO_LIMIT` (300), and the order "oldest first" matches `src/game.js:30`.
    - These examples fit the schema: `data.md:19`, `data.md:43` and `schemas.md:41-45`. The Progress.03 example `data.md:25` doesn't fit, on purpose.
    - These examples are right against `src/puzzles.js`: Puzzle.03 (`[[0,1,1]]` is H─C, history `[[]]`; `[[0,2,1]]` jumps over C), Bond.08/09 (Ammonia indexes 0–1 and 1–3), Bond.10 (Water: O 1,2 to H 2,2), Input.05, Progress.05 (Hydrogen cyanide, then `methanol` open) and Formaldehyde's `[[1,3,2]]` with `[[], [[1,3,1]]]`.
    - Every rule id in Scope has a step.
    - Step 1 says the Bond.08–10 tests keep the old behavior until step 9, so steps 1–8 don't depend on the changed rules.
    - Step 9 says the end-to-end tests that click Reset accept its dialog. They need it: `tests/ui/check.spec.js:87` and `tests/ui/narrative.spec.js:36` register `page.once` for Show solution only.
