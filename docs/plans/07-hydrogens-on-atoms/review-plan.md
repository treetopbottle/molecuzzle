# Review of plan 07: Hydrogens on their Atoms, and Puzzles with loops

Commits reviewed: 65502cb (the plan, its spec changes, decisions 0023 and 0024, and `prototypes/implicit-hydrogens.html`).

## What was checked

- **Request:** the plan covers it. Hydrogens are bonded from the start, drawn small with a thin line and can't be clicked. Every Puzzle after the tutorial has at least 2 loops.
- **Rule ids:** Puzzle.07 and Puzzle.08 are new. No id was removed and none is duplicated. Every rule id in Scope has a step.
- **Design against the code:** checked against `game.js`, `solver.js`, `generate.js`, `difficulty.js`, `board.js`, `draw.js` and the tests. The schema JSON keeps its three-item Atoms (`items: false`) until step 7, as intended, and `npm test` passes at 65502cb.
- **The 15 Puzzles:** each was reproduced with stand-in Elements through `findLayout` (100000 tries, 6×5, seed 1). For each one:
  - the Bonds give the named Molecule, with every valence filled, and the right formula;
  - it has exactly one solution and no crossing Dotted lines;
  - the Dotted lines, loops and difficulty match the spec's table.
- **More layout checks:** the Generate.01 example (2000 tries, 3×3) gives the printed layout. With the plan's three obvious moves, every Puzzle after the first three still has lines open.
- **Spec examples against those layouts:** all hold.
  - Places, Board indexes, "open, with 3 Atoms" (also in Messages.01), Bond.04 / Messages.02 `full` on OH 1,1, Puzzle.04 sizes.
  - Puzzle.05 (5−5+1) and Puzzle.08 (7−6+1).
  - The Check.03 drawing is a valid pieces Board: every Atom is complete, every Bond is on a Dotted line, and none cross.
  - The Board.04 names and the Progress and schemas.md JSON.
  - Glycine and every other drawing follow the drawing rule.
  - The README entity examples.
  - The made-up Grid of Grid.02 and Bond.05.
- **Decisions:** 0023 and 0024 (why, cost, alternatives), the notes on 0002 and 0021, and the index.
- **Removed table:** the reasons were checked against layouts I made for the removed Molecules with the generator (the plan doesn't record their Bonds). Today's layouts with the H Atoms stripped don't match the reasons. The H counts in 0023 were checked against today's `puzzles.js`.

## Findings

1. **must fix**: `docs/spec/puzzle.md:24`, `docs/plans/07-hydrogens-on-atoms/README.md:47`: 1,4-Dioxane is C₄H₈O₂, the same formula as Ethyl acetate, which this plan removes (`docs/spec/puzzle.md:59`). That breaks Puzzle.06 ("no Puzzle has … the formula of a removed one", `puzzle.md:14`; decision 0022 keeps isomers out on purpose). The existing check in `tests/unit/puzzle/removed.test.js` compares formulas by Atom counts, so step 7's removed test would fail. Either replace Dioxane, which renumbers the table and difficulty ties, or change Puzzle.06 and 0022.
2. **should fix**: `docs/spec/puzzle.md:171`: "It has room for what it needs ([Valence.01]) minus its bond count" counts the bond count twice. Valence.01 (`puzzle.md:279`) already takes it off. Room should be the valence minus the hydrogens minus the bond count, which is what it needs. Puzzle.03 (`puzzle.md:11`, and plan line 11) has the same problem: "more Bonds than it needs" should say "more than its valence minus its hydrogens". Bond.03 and Bond.04 depend on "room".
3. **should fix**: `docs/decisions.md:297`: "rings of 3 or 5 can't, as every loop on it has an even number of Atoms" is false. A Dotted line can span empty points, and a straight run can pass through an Atom. The plan's own layouts have 5-Atom loops: Glutamic acid has C 2,2 – O 2,3 – O 4,3 – C 4,2 – CH₂ 3,2, and Malic acid has one too. So 5-rings are not ruled out by the Grid. Only 3-rings are. This also affects the backlog idea of "a ring with S in it".
4. **should fix**: `docs/decisions.md:285`: "97 of the 110 H Atoms" is wrong. Today's 20 Puzzles have 105 H Atoms, which matches the sum of their formulas. I couldn't reproduce 97, or "the obvious moves solved 13 Puzzles":
   - partner among its nearest Dotted-line neighbours: 103 of 105;
   - nearest heavy Atom: 101, or 88 when that Atom is the only nearest;
   - the plan's three obvious moves solve 9 of the 20.

   Give the right total and say how "nearest" and "obvious moves" were measured.
5. **should fix**: `docs/plans/07-hydrogens-on-atoms/README.md:14,79`: two rewritten examples are missing from Scope's list and from step 7's test files:
   - Puzzle.03, now on Acetonitrile (today's test uses Hydrogen cyanide);
   - Progress.03, now `acetonitrile`/`glycine` (`tests/unit/storage/progress.test.js:36` uses `water`/`urea`).

   Step 7 also doesn't list `difficulty.test.js`. It has the made-up Puzzles of step 4 and a Water test that has to go. Step 4 tests the Puzzle.08 example (line 70), but its heading names only Puzzle.05.
6. **note**: `docs/decisions.md:297`, `docs/spec/puzzle.md:62-63`: the claim for Threonine and Valine isn't reproducible, because the Bonds of the removed candidates aren't recorded. That claim is "the obvious moves solve them" (0024) and "nothing is left to choose" (the table). With natural Bond orders the generator gives both 3 loops, as stated, but the three obvious moves leave 5 of their 10 lines open. The other removed reasons held on the layouts I generated:
   - no loop for Acrylonitrile, Urea, Acetone and Ethanol;
   - Halothane solved by the obvious moves;
   - 1 loop for Lactic acid, Ethyl acetate and Alanine;
   - Cysteine has Serine's layout.
7. **note**: `docs/decisions.md:272`: 0022 says a new Puzzle earns its place by "having something to rule out", and its tutorial ends at "the first empty Dotted line". 0024 replaces that test with at least 2 loops after a tutorial of three, but 0022 has no "Partly superseded by 0024" note. 0023 and 0024 also don't record in a Cost that S, F, Cl, Br and I lose all their Puzzles. Only the plan's Left out and the backlog say it, while the Panel.04 rule still lists them.
8. **note**: `docs/spec/puzzle.md:190-195`: the old Grid.02 example also showed lines that meet at one of their Atoms and don't cross ("but not C 1,3 to C 2,3"). The made-up Grid has no such pair, so that half of the rule has no example any more.
9. **note**: `docs/spec/ui.md:32-34`: the spec doesn't say whether an Atom's hydrogens glow (Board.02) or pulse (Board.03) with it. The Board.03 screenshot test counts `.atom .body` animations, so the class of the H circles matters. Step 7(b) looks at "the glow" without a rule to check it against.
10. **note**: `docs/plans/07-hydrogens-on-atoms/README.md:78-80`: step 7 is large: 15 Puzzles, 16 removed, the schema, every example, the e2e and narrative tests, and the screenshots. It can't be split while the checks must pass in between, but its review will be long. "Remake every screenshot … which is all of them" probably doesn't hold for `actions.png`, which shows only the buttons.
11. **note**: these docs still point at old things:
    - `README.md:26` keeps "Water H2O" as the Molecule example, though Water is now removed.
    - `docs/plans/README.md:31` has a backlog item with the old label `H1-O1 H2-H3`, which is "can't read" after step 3.
    - `docs/spec/ui.md:43` links `board-glucose.png`, which doesn't exist until step 7.
12. **note**: `docs/decisions.md:285`: "the prototype … tried both" (hydrogens drawn, and CH₃ written on the ball). The prototype as committed only draws the hydrogens, so the CH₃ label version can't be seen.
13. **note**: the plan didn't come from the backlog (`docs/workflow/write-a-plan.md` step 1). It came straight from the user's request after the prototype, which is fine, and it replaces the Iodine backlog item properly.

## Outcome

1. Fixed in e49d056: Morpholine (C₄H₉NO) takes Dioxane's place, with the same Dotted lines, loops and difficulty, so the order stays; the plan says why.
2. Fixed in e49d056: room and Puzzle.03 say valence minus hydrogens minus bond count.
3. Fixed in e49d056: 0024 says only rings of 3 can't fit; rings of 4, 5 and 6 can.
4. Fixed in e49d056: 0023 counts the 110 Atoms with one Bond (105 H and Halothane's three halogens), says how nearest was measured, and gives 12 of 20 for the obvious moves, by the script used then.
5. Fixed in e49d056: Scope lists Puzzle.03 and Progress.03, step 4 names Puzzle.08, and step 7 names `difficulty.test.js` and `progress.test.js`.
6. Fixed in e49d056: the plan records the Bonds tried for the candidates whose reason depends on their layout, and the table says "in the layout tried".
7. Fixed in e49d056: 0022 is partly superseded by 0024, and 0024's cost says S and the halogens have no Puzzle for now.
8. Fixed in e49d056: a second Grid.02 example, in Glycine, of lines that meet at an Atom and don't cross.
9. Fixed in e49d056: Board.01 says the hydrogens don't glow or pulse with their Atom.
10. Fixed in e49d056: `actions.png` stays; step 7 says its review checks the examples one by one.
11. Fixed in e49d056: the README's Molecule is Acetic acid, and the backlog item uses the new labels. The link to `board-glucose.png` is kept: step 7 makes it, as the spec comes first.
12. Fixed in e49d056: 0023 says the prototype first wrote CH₃ on the ball.
13. Kept: no finding.
