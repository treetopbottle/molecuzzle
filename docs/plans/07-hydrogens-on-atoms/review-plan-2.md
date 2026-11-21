# Second review of plan 07: Hydrogens on their Atoms, and Puzzles with loops

Commits reviewed: e49d056 (fixes after the first review; Morpholine for 1,4-Dioxane) and 9f06363 (the first review's Outcome). The plan itself is in 65502cb. Everything was read at HEAD in a separate worktree.

## What was checked

- **Outcome against the fixes:** each of the 13 Outcome lines was compared with what e49d056 changed.
  - Lines 1, 2, 3, 5 and 7 to 12 match.
  - Line 13 needed nothing.
  - Lines 4 and 6 are covered in Findings.
- **Morpholine:** reproduced with `findLayout`, ELEMENTS patched at runtime (Cb valence 2, Na valence 2), Bonds `"O1-Cb1 Cb1-Cb2 Cb2-Na1 Na1-Cb3 Cb3-Cb4 Cb4-O1"`, 100000 tries, 6×5, seed 1.
  - The plan's Bonds as generic stand-ins in the same label order give the same layout.
  - The result is 3×2: NH 1,1, CH₂ 1,2, CH₂ 2,1, CH₂ 2,2, CH₂ 3,1, O 3,2.
  - It has 6 Atoms, 7 Dotted lines, 2 loops, 1 empty line and difficulty 11. It has exactly one solution, no crossing lines, and the ring is O-C-C-N-C-C.
  - The formula is C₄H₉NO (four CH₂ and one NH give 9 hydrogens).
  - No Puzzle in the table, removed Puzzle in the spec's table, or entry in `src/puzzle/removed.js` has that formula.
  - The plan's three obvious moves leave all 7 lines open.
  - Its place in the order (tied at 11, after Glycerol) is unchanged.
- **Spec wording:**
  - Room (`docs/spec/puzzle.md:171`) now matches Valence.01.
  - Puzzle.03 (`puzzle.md:11`) says "valence minus its hydrogens".
  - Board.01 (`docs/spec/ui.md:32`) says the hydrogens don't glow or pulse.
  - The second Grid.02 example (`puzzle.md:197-202`) is right for Glycine's layout: OH 1,1 to NH₂ 1,2 runs along a row, OH 1,1 to C 2,1 along a column, and they meet at OH, one of their own Atoms.
- **Candidates left out** (`docs/plans/07-hydrogens-on-atoms/README.md:60-70`): each row's Bonds were turned into stand-in labels in the same order and run with `100000 6 5 1`.
  - Halothane has 2 loops and the obvious moves leave 0 of 8 lines.
  - Lactic acid, Ethyl acetate and Alanine each have 1 loop and leave 0 of 6.
  - Cysteine gives exactly Serine's layout.
  - Threonine and Valine have 3 loops each; see finding 1.
- **1,4-Dioxane:** the spec, decisions and plan now name it only where it was left out (`README.md:58`) and in the first review.

## Findings

1. **should fix**: `docs/plans/07-hydrogens-on-atoms/README.md:68-69`, `docs/decisions.md:297`, `docs/spec/puzzle.md:62-63`: for Threonine and Valine, the table says "0 of 10", 0024 says "the obvious moves solve them", and the spec says "the obvious moves leave nothing to choose". None of these hold for the Bonds now recorded.
   - Their layouts, built from those Bonds, have 3 loops as stated, but the plan's three moves (`README.md:58`) leave 5 of 10 lines open in each. This is what the first review found (its finding 6). Recording the Bonds (Outcome 6) didn't settle it.
   - By the same moves, today's 20 Puzzles give 9 solved outright, not the 12 that 0023 states (`decisions.md:285`).
   - Either the script that wasn't kept used other moves, or the claims are wrong. Either way, the moves the plan states and the numbers it gives should agree.
2. **should fix**: `docs/decisions.md:285`: "97 had a single nearest Atom along their Dotted lines, and it was their partner" doesn't reproduce as written.
   - As written, it counts 44 of 110.
   - 97 reproduces only as a single nearest Atom with more than one Bond, which leaves out other H and halogens.
   - The qualifier is missing, so Outcome 4's "says how nearest was measured" is only partly true.
   - Outcome 4 also says "Halothane's three halogens". Halothane has five halogen Atoms (3 F, Cl, Br), and 105 + 5 = 110. The decision itself is right.
3. **should fix**: `docs/decisions.md:285`: "the obvious moves (those of [0024](#0024))". 0024 (`decisions.md:294-298`) doesn't list the moves. Only the plan does (`README.md:58`), so the link points at nothing.
4. **note**: `docs/decisions.md:297`: "That leaves S and the halogens with no Puzzle for now: in the Molecules tried, each closes its loops." This is wrong for S. The only S candidate, Cysteine, was left out as Serine's layout (`README.md:70`, `puzzle.md:61`), not for closed loops. Its layout has 2 loops, and the obvious moves leave 4 of 8 lines open.
5. **note**: `docs/spec/puzzle.md:11`: Puzzle.03 says "an Atom with more Bonds than its valence minus its hydrogens". The check counts Bond orders (`bondCount` in `src/puzzle/game.js:33`). "A bond count over its valence minus its hydrogens", using the term defined at `puzzle.md:171`, would be exact: one double Bond is one Bond but a bond count of 2.
6. **note**: `prototypes/implicit-hydrogens.html:122-123` still has 1,4-Dioxane as a Puzzle. Prototypes are outside the spec, so this is only for the record.
