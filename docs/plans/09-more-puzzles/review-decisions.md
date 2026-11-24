# Review of the decisions of plan 09

Commits reviewed: e45b487 and e7e6b7f, which change `docs/decisions.md` (0026 and 0027 new, a note on 0021's status, a clarification of 0008's Cost), checked against the code, the spec and the backlog at c9e3c07. `npm test` passes, 408 tests. The index lists 0026 under Technical and 0027 under Game; 0026 and 0027 match the code and the spec, and keep why, cost and alternatives; no decision still says the game doesn't use the difficulty.

## Findings

1. **should fix**, `docs/decisions.md:301` (0024, Cost) and `docs/plans/README.md:28` (backlog): both say no Puzzle has Dotted lines that cross; Uridine, Carnosine and Sucrose have such lines now, and N-Acetylneuraminic acid since c854b42. 0024 needs a status note, and the backlog item can go.
2. **should fix**, `docs/decisions.md:135` (0008, Cost): "Bonds can each move one place round it, a double Bond to the next Bond" fits benzene and adenine, but not penicillin's β-lactam (1,1,1,1 becomes 2,0,2,0) or guanine's ring. The rule: the Bonds round an even ring can be made one stronger and one weaker in turn, down to no Bond, while every Atom keeps its count and all stay joined.
3. **should fix**, `docs/decisions.md:240` (0019, status) and `:245` (Cost): Citric acid and Glucose no longer come nearest the limit; nine Puzzles are on the full 6 by 5. Since 0026, Molecules of up to 25 Atoms fit; what waits for the hex grid is those with no layout there.
4. **note**, `docs/decisions.md:323` (0026, Cost): "about 10 ms for 20 Atoms" and "half a minute for 25 Atoms" can't be checked with the reviewer's commands; 200 tries of Caffeine take 0.12 s. Say where the figures come from.
5. **note**, `docs/decisions.md:334` (0027, Cost): leaves out the room the line takes on a phone, and that a new measure of difficulty would change the numbers Players see.
6. **note**, `docs/decisions.md:333`, `:335` (0027): "it rises along the list" is loose, as six pairs are tied; "Only the number in the list" means the Puzzle's place, so "Only its number" is clearer.
7. **note**, `docs/decisions.md:262`, `:269` (0021): its Alternatives still end "Showing the difficulty to the Player: not asked for yet"; the status note could say 0027 takes it up.
8. **note**, `docs/decisions.md:301` (0024, Cost), from before plan 09: "and S too, as its one candidate, Cysteine, is Serine's layout" is out of date since Biotin, Cystine and Glutathione.
9. **note**, `docs/plans/README.md`: nothing else in the backlog is obsolete or missing; the two `scripts/generate.js` items still hold.
