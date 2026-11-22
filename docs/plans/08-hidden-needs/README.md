# 08: Atoms don't show what they need, and a budget of Bonds

Status: Draft

The Puzzles are too easy because every Atom shows how many Bonds it still needs and refuses more. Now an Atom shows nothing of that, any Atom can get too many Bonds, and a Puzzle has a budget, the Bonds of its solution. Under the Board a line counts the Bonds used against the budget, and the Atoms with too few and with too many Bonds; going over only means the Puzzle isn't solved. A key in the panel shows each Element's number of Bonds, so the Player can look it up ([decision 0025](../../decisions.md#0025)). A hint that marks which Atoms is left for later.

## Scope

Covers:

- Puzzle: Puzzle.03 (a stored Board may have an Atom with too many Bonds), Puzzle.09 (new: the budget), Valence.01 (below 0 is too many), Valence.03 (new: the counts), Bond.03 (wrap only after a triple Bond), Bond.04 (now: too many is allowed; it was `full`), Bond.05 (crossing is the only reason), Check.02 (open, with the counts), Check.04 (solved is the budget used)
- UI: Board.02 (no badge, no glow), Board.04 (names without what an Atom needs), Board.05 (new: the counts line), Messages.01 (the open text), Messages.02 (no `full`), Panel.04 (the rules), Panel.05 (new: the key)
- The examples that change: Board.01–02 screenshots, Check.01–02, Panel.01–02, Page.01, the narrative
- The README's entity Budget

Left out:

- A hint that marks the Atoms with too few or too many Bonds, limited per Puzzle (backlog).
- A new difficulty or order of the Puzzles: they measure the layout ([Puzzle.05](../../spec/puzzle.md#puzzle)), which doesn't change. Whether the Puzzles are now hard enough is for play to show.
- Progress: its key stays, as a Board saved before can still be on the Grid, and solved stays solved ([decision 0016](../../decisions.md#0016)).
- A hard limit at the budget ([decision 0025](../../decisions.md#0025)).

"Molecules with too few or too many bonds" is read as Atoms: a Molecule is one thing, and it is the Atoms that have Bonds.

## Design

Interfaces that change:

- `puzzle/game.js`: `remaining(i)` may be below 0, an Atom with too many Bonds. New: `budget` (half the sum of what the Atoms need from the start, which is the sum of the solution's orders) and `counts()`, `{ used, budget, few, many }`, `used` the sum of the orders of the Bonds, `few` the Atoms with `remaining > 0`, `many` those with `remaining < 0`. `status()` is `{ kind: "open", few, many }` instead of `{ kind: "open", open }`; the others as now, with the check for `pieces` and `solved` still "every Atom at 0". `change()`: no `full` reason and no wrap when an Atom has no room: stronger is 0 → 1 → 2 → 3 → 0 on every Dotted line, except that `crossing` still stops a new Bond. `createGame` stops refusing a Board for an Atom's bond count; crossing and the rest stay.
- `puzzle/solver.js`, `puzzle/generate.js`, `puzzle/difficulty.js`: unchanged; they work on a solution, not on a Player's moves.
- `ui/messages.js`: the `open` text of Messages.01; `reasonText` has only `crossing`.
- `ui/board.js`: no `.badge` and no `.ok` in the Atoms; the name of an Atom is "<Element> <place>[, with <h> hydrogen(s)]". `style.css` loses the badge and the glow.
- `ui/index.html` and `ui/ui.js`: a `#counts` element between the Board and `#status`, filled by `render` from `game.counts()` (`ui.js` holds the game it was opened with, so the view and `app.js` don't change): three spans, "Bonds <used> of <budget>", "Too few: <few>" and "Too many: <many>", each with an `aria-label`; the first has the class `warn` when `used > budget`.
- `ui/panel.js`: the texts of the rules, and the key: inside the list item of the rule on valence, an inline SVG per Element of C, N, O, S, F, Cl, Br, I: the ball and symbol as in `ui/elements.js`, round it as many short sticks as the valence, evenly spaced from the top and clockwise, and the number beside it, in a `figure` named "<Element>: <n> bonds" (`role="img"`). The key reads its numbers from the Elements of `puzzle/elements.js` through the Glue's view, not by the UI importing the puzzle component ([decision 0011](../../decisions.md#0011)): `renderPanel` gets `elements: [{ symbol, valence }]` in its view, which `browser.js` fills.

A choice that wasn't obvious is [decision 0025](../../decisions.md#0025), and `full` and the badge of the Atom were the Player's only help before it.

## Steps

1. **The rules count, and allow too many.** Puzzle.03, Puzzle.09, Valence.01, Valence.03, Bond.03, Bond.04, Bond.05, Check.02, Check.04.
   - (a) Tests in `tests/unit/puzzle/game.test.js`: the Bond.04 example on Glycine (a single, then a triple Bond on OH, then none, and OH needs −1), the Bond.03 example, Acetic acid's Valence.03 example with its counts (and not solved at the budget), the Check.01–02 example with its counts, a stored Board with an Atom over its need is read as it is (Puzzle.03, the old test that refused it goes), crossing still the one reason (Bond.05), solved only at exactly every need (Check.04). In `puzzles.test.js`, for each Puzzle, the budget is the sum of the orders of its solution and half the sum of what its Atoms need (Puzzle.09, with the Acetic acid example).
   - (b) Implementation: `game.js` as in Design.
2. **The texts.** Messages.01, Messages.02.
   - (a) Tests: `messages.test.js` for the open text and for no `full`; `ui.test.js` for the crossing message on the made-up Grid of the Grid.02 example; the end-to-end test of the `full` message in `bonding.spec.js` becomes one that an OH can be bonded twice, and shows no message; the narrative test, `narrative.spec.js`, as the narrative now reads.
   - (b) Implementation: `messages.js`.
3. **The Board shows no needs, and counts.** Board.02, Board.04, Board.05.
   - (a) Tests: `board.test.js` (no badge, no `.ok` after C═O, the names of the Board.04 example), `ui.test.js` (the counts line of the Board.05 example, the orange `warn` when over, an `aria-label` each, and the same line when solved), and the end-to-end tests that name Atoms or look for the glow, `puzzle.spec.js` and `bonding.spec.js`, and the screenshot tests.
   - (b) Implementation: `board.js`, `index.html`, `ui.js`, `style.css`. Remake every screenshot that changes, and look at each against ui.md: no badge or glow, the counts line on a desktop and on a phone, with Glucose and Citric acid.
4. **The key.** Panel.04, Panel.05.
   - (a) Tests: `panel.test.js` (the rule texts; the key has C, N, O, S, F, Cl, Br and I, each named "<Element>: <n> bonds", with as many sticks as bonds), an end-to-end test that the key is on the page and fits a phone without sideways scrolling (`phone.spec.js`), and the screenshot tests.
   - (b) Implementation: `panel.js`, `browser.js` (the Elements in the view), `style.css`. Remake the screenshots that change (`panel-mystery.png`, `page-*.png`) and look at each.
5. **Docs.** No rule ids. `docs/architecture.md` where it names the badge or `full`, the backlog (the hint, with its limit per Puzzle and a mark of a hinted Puzzle in Progress), `Status: Done` in the plan and the table.

Each step also changes the end-to-end tests its change breaks, so `npm run check` passes after it.
