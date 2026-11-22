# 08: Atoms don't show what they need, and a budget of Bonds

Status: Done (2026-11-22)

The Puzzles are too easy because every Atom shows how many Bonds it still needs and refuses more. Now an Atom shows nothing of that, any Atom can get too many Bonds, and a Puzzle has a budget, the Bonds of its solution. Under the Board a line counts the Bonds used against the budget, and the Atoms with too few and with too many Bonds; going over only means the Puzzle isn't solved. A key in the panel shows each Element's number of Bonds, so the Player can look it up ([decision 0025](../../decisions.md#0025)). A hint that marks which Atoms is left for later.

## Scope

Covers:

- Puzzle: Puzzle.03 (a stored Board may have an Atom with too many Bonds), Puzzle.09 (new: the budget), Valence.01 (below 0 is too many), Valence.03 (new: the counts), Bond.03 (wrap only after a triple Bond), Bond.04 (now: too many is allowed; it was `full`), Bond.05 (crossing is the only reason), Check.02 (open, with the counts), Check.04 (solved is the budget used)
- UI: Board.02 (no badge, no glow), Board.04 (names without what an Atom needs), Board.05 (new: the counts line), Page.01 (the counts line in its parts), Messages.01 (the open text), Messages.02 (no `full`), Panel.04 (the rules), Panel.05 (new: the key)
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
- `ui/messages.js`: the `open` text of Messages.01, which no longer reads a count; `reasonText` has only `crossing`.
- `app.js`: the view gets `counts: game.counts()` next to `status`.
- `ui/board.js`: no Atom badge (`.atom .badge`) and no `.ok` in the Atoms; the name of an Atom is "<Element> <place>[, with <h> hydrogen(s)]". `style.css` loses only the Atom's rules, `.atom.ok .body`, `.atom .badge circle`, `.atom .badge text` and `.atom.ok .badge`. `#badge` and `.puzzle-nav .badge`, the Solved/Unsolved pill of the panel, stay.
- `ui/index.html` and `ui/ui.js`: a `#counts` element between the Board and `#status`, filled by `render` from `view.counts`: three spans, "Bonds <used> of <budget>", "Too few: <few>" and "Too many: <many>", with " · " between them as text and an `aria-label` each; the first has the class `warn` when `used > budget`.
- `ui/ui.js`, `ui/panel.js` and `browser.js`: the key needs each Element's valence, which the UI may not import from the puzzle component ([decision 0011](../../decisions.md#0011)). `browser.js` passes `elements: [{ symbol, valence }]`, from `puzzle/elements.js`, in the options of `createUi(doc, handlers, { confirm, elements })`, and `createUi` hands it to `renderPanel`. `app.js` and `startApp` don't change for it. The valences are then written once for the key and the rules, where [decision 0011](../../decisions.md#0011) had them twice.
- `ui/panel.js`: the texts of the rules, and the key: inside the list item of the rule on valence, an inline SVG per Element of C, N, O, S, F, Cl, Br, I: the ball and symbol as in `ui/elements.js`, round it as many short sticks as the valence, evenly spaced from the top and clockwise, and the number beside it, in a `figure` named "<Element>: <n> bond(s)" (`role="img"`).

[Decision 0025](../../decisions.md#0025) is the choice that wasn't obvious: before it, `full` and the badge of each Atom were the Player's only help.

## Steps

1. **The rules count, allow too many, and the texts that follow.** `[DONE]` ([review](review-step-1.md)) Puzzle.03, Puzzle.09, Valence.01, Valence.03, Bond.03, Bond.04, Bond.05, Check.02, Check.04, Messages.01, Messages.02.
   - (a) Tests in `tests/unit/puzzle/game.test.js`: the Bond.04 example on Glycine, the Bond.03 example, Acetic acid's Valence.03 example with its counts (and not solved at the budget), the Check.01–02 example with its counts (`status` is `{ kind: "open", few, many }`; the tests that read `open: n` at `game.test.js:281-283` and `:381` and `app.test.js:66` change), a stored Board with an Atom over its need is read as it is (Puzzle.03; the test that refused it goes), crossing the one reason given (Bond.05), solved only at exactly every need (Check.04). In `puzzles.test.js`, for each Puzzle, the budget is the sum of the orders of its solution and half the sum of what its Atoms need (Puzzle.09, with the Acetic acid example). In `messages.test.js` the open text and no `full`; in `ui.test.js` the crossing message on the made-up Grid of the Grid.02 example, in place of the `full` message of `:98`; in `bonding.spec.js` an OH can be bonded twice and shows no message; and the end-to-end tests that read the old status text (`check.spec.js:12`, `narrative.spec.js`).
   - (b) Implementation: `game.js` as in Design, and `messages.js`.
2. **Atoms show no needs.** `[DONE]` ([review](review-step-2.md)) Board.02, Board.04.
   - (a) Tests: `board.test.js` (no badge, no `.ok` after C═O, the names of the Board.04 example, hydrogens still don't pulse, `:90`), and the end-to-end tests that name Atoms or look for the glow: `puzzle.spec.js:24-28`, `bonding.spec.js`, `screenshots.spec.js:72-73`.
   - (b) Implementation: `board.js` and the Atom rules of `style.css`. Remake every screenshot that changes and look at each against ui.md: no badge or glow, Glucose too.
3. **The counts line.** `[DONE]` ([review](review-step-3.md)) Board.05, Page.01, and the narrative.
   - (a) Tests: `ui.test.js` (the line of the Board.05 example, the `warn` on the first span when over, an `aria-label` each, the same line when solved), `app.test.js` (`counts` in the view), `narrative.spec.js` as the narrative now reads, and the screenshot tests.
   - (b) Implementation: `app.js`, `index.html`, `ui.js`, `style.css`. Remake the screenshots that change, on a desktop and on a phone, Citric acid too.
4. **The rules in the panel.** `[DONE]` ([review](review-step-4.md)) Panel.04.
   - (a) Tests: `panel.test.js` for the two rule texts, replacing `:79`, and the screenshots that show the panel.
   - (b) Implementation: the texts in `panel.js`. Remake `panel-mystery.png` and the `page-*.png` that change.
5. **The key.** `[DONE]` ([review](review-step-5.md)) Panel.05.
   - (a) Tests: `panel.test.js` (the key has C, N, O, S, F, Cl, Br and I, each named "<Element>: <n> bond(s)", with as many sticks as bonds, inside the rule on valence), `ui.test.js` (`elements` reaches the panel), `phone.spec.js` (it fits a phone, no sideways scrolling), and the screenshots.
   - (b) Implementation: `panel.js`, `ui.js`, `browser.js`, `style.css`. Remake the screenshots that change and look at each.
6. **Finish.** `[DONE]` No rule ids. `Status: Done` in the plan and the table; `docs/architecture.md` only if its text on `game.js` (the status and the reasons) or the panel is no longer right. The hint is in the backlog already.

Each step also changes the end-to-end tests its change breaks, so `npm run check` passes after it; the screenshots are remade in the step that changes them.
