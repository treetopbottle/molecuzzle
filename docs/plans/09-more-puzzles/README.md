# 09: Ten more Puzzles, and the difficulty in the panel

Status: Done (2026-11-24), with a [review of the decisions](review-decisions.md)

The Player asked for five more Puzzles as hard as Puzzles 16 to 20 (difficulty 34 to 52), five harder ones, and to see each Puzzle's difficulty. The generator can't make them as it is: it places the Atoms as a tree and closes a ring only by luck, so for Molecules with two rings or more, such as Sucrose, it finds nothing in 400,000 tries. It now places one Atom at a time, in line with the Atoms it is bonded to, and goes back when one has no place ([decision 0026](../../decisions.md#0026)). With it, ten Puzzles of difficulty 36 to 67 go into the list by difficulty, which then has 30, and the panel shows "Difficulty <d>" under "Puzzle <n> of <N>" ([decision 0027](../../decisions.md#0027)).

## Scope

Covers:

- Puzzle: Generate.01 (its example prints another layout of Acetonitrile), Generate.03 (new: Molecules with several rings), Puzzle.01 (30 Puzzles), Puzzle.04 (N-Acetylneuraminic acid is Puzzle 23), Puzzle.05 (the table)
- UI: Panel.01 (the difficulty, and its example on Puzzle 30), Page.01 (the difficulty among the parts), List.02 (its example: "Solved 1 of 30")
- The screenshots that show the panel or the list

Left out:

- The difficulty in the Puzzles list (the Player chose the panel), or as a word or stars: [decision 0027](../../decisions.md#0027).
- A new measure of difficulty, such as one from a solver that plays like a Player (backlog): the number shown is Puzzle.05's.
- Progress: its key stays; new Puzzles are new ids ([decision 0016](../../decisions.md#0016)). A Player's open Puzzle stays open, under its new number.
- Molecules with a benzene ring, a purine such as adenine or guanine, or a β-lactam fused to a second ring: each has two solutions on any Grid, as its Bonds can swap round an even ring, so they can't be Puzzles ([decision 0008](../../decisions.md#0008)'s cost, which now names them).
- Halogens: still none ([decision 0024](../../decisions.md#0024)), so the key keeps C, N, O and S.

## Design

Interfaces that change:

- `puzzle/generate.js`: `findLayout` keeps its arguments and its result; its default tries go from 20000 to 2000, as a try takes about 10 ms for 20 Atoms instead of well under 1 ms (2000 tries of Citric acid take 1.6 s, 20000 take 12 s, over Vitest's 5 s). Each try, with the random numbers drawn in this order:
  - the first Atom is a random one, at point 0,0; the Grid is the box round the placed Atoms, and may grow in any direction up to `maxRows` by `maxCols`;
  - next is the unplaced Atom with the most Bonds to placed ones, a tie broken at random as it is met (the k-th tie replaces the choice with chance 1/k), Atoms in the order of the Bonds text;
  - its places are the points 1, 2 and 3 steps right, left, down and up from its first placed partner in the Bonds text, stopping in a direction at an Atom or a Bond in the way; a place must keep the box within `maxRows` by `maxCols`, and be in a row or column with every placed partner, with no Atom or Bond between. Each place gets a random weight, times 3 for 1 step, and they are tried heaviest first;
  - a place taken marks its point and the points of its Bonds; when the next Atom has no place left, the try goes back and takes the Atom before's next place. A try gives up after 3000 places taken.
  The check for exactly one solution, and the best layout by its empty Dotted lines and size, stay as they are. The same arguments still give the same layout, but not the one they gave before.
- `scripts/generate.js`: only its top comment, if it names the default.
- `puzzle/puzzles.js`: the ten, each where its difficulty puts it and after those of the same difficulty, with a fact.
- `puzzle/difficulty.js`: its comment, as the game now uses it.
- `app.js`: imports `difficulty` from `puzzle/difficulty.js`, as it imports `markSolved` from Storage, and the view gets `difficulty`, the open Puzzle's.
- `ui/panel.js`: a `<p id="difficulty" class="legend">` after the nav, "Difficulty <d>", filled by `renderPanel` from `view.difficulty`, so a screen reader reads it as its own paragraph; `style.css` puts it right under the nav (`order: 1`), and its comment on the panel's order names it. The view's JSDoc in `ui/ui.js` and `ui/panel.js` gains `difficulty`; `ui.js` passes the view on as it is.
- `docs/architecture.md`: `difficulty.js` is used by the Glue too, not only by the tests and the generator. Its line on `generate.js`, "finds layouts for new Puzzles", stays.

The prototype of this search, in a scratch folder, found the ten below; a port to the order above gives the same ten layouts and the outputs of step 1, checked before this plan. If the port in step 1 gives another layout for any of them, stop: its checks below have to be made again. The ten, from `node scripts/generate.js "<bonds>" 2000 6 5 <seed>`; all have at least 2 loops, the obvious moves of [decision 0024](../../decisions.md#0024) leave most of their Dotted lines open, and none has more than 9 of its points on Atoms of the same need as another Puzzle or a removed one, under any turn, flip or shift ([decision 0020](../../decisions.md#0020)); checked by scripts that aren't kept, as for plan 07:

| # | Molecule | Formula | Grid | Atoms | Dotted lines | Loops | Difficulty | Open after the obvious moves | Seed |
|---|---|---|---|---|---|---|---|---|---|
| 18 | Uridine | C₉H₁₂N₂O₆ | 5×5 | 17 | 24 | 8 | 36 | 22 | 3 |
| 19 | Carnosine | C₉H₁₄N₄O₃ | 4×5 | 16 | 23 | 8 | 37 | 23 | 2 |
| 20 | Streptozotocin | C₈H₁₅N₃O₇ | 6×5 | 18 | 26 | 9 | 42 | 22 | 3 |
| 22 | Abscisic acid | C₁₅H₂₀O₄ | 6×5 | 19 | 27 | 9 | 43 | 21 | 2 |
| 24 | Retinol | C₂₀H₃₀O | 6×5 | 21 | 31 | 11 | 51 | 27 | 3 |
| 26 | Domoic acid | C₁₅H₂₁NO₆ | 6×5 | 22 | 33 | 12 | 55 | 31 | 2 |
| 27 | Sucrose | C₁₂H₂₂O₁₁ | 6×5 | 23 | 35 | 13 | 57 | 28 | 5 |
| 28 | Picrocrocin | C₁₆H₂₆O₇ | 6×5 | 23 | 35 | 13 | 57 | 27 | 1 |
| 29 | Mugineic acid | C₁₂H₂₀N₂O₈ | 6×5 | 22 | 34 | 13 | 58 | 31 | 4 |
| 30 | Prostaglandin E2 | C₂₀H₃₂O₅ | 6×5 | 25 | 39 | 15 | 67 | 38 | 7 |

The list then runs: 1 to 17 as now, 18 Uridine, 19 Carnosine, 20 Streptozotocin, 21 Tetraglycine (was 18), 22 Abscisic acid, 23 N-Acetylneuraminic acid (was 19), 24 Retinol, 25 Glutathione (was 20), then 26 to 30.

Their Bonds:

| Molecule | Bonds |
|---|---|
| Uridine | `N:1-C:2 C:2=O:2 C:2-NH:3 NH:3-C:4 C:4=O:4 C:4-CH:5 CH:5=CH:6 CH:6-N:1 N:1-CH:1p CH:1p-O:r CH:1p-CH:2p CH:2p-OH:2 CH:2p-CH:3p CH:3p-OH:3 CH:3p-CH:4p CH:4p-O:r CH:4p-CH2:5 CH2:5-OH:5` |
| Carnosine | `NH2-CH2:a CH2:a-CH2:b CH2:b-C:c C:c=O:c C:c-NH:d NH:d-CH:e CH:e-C:f C:f=O:f C:f-OH CH:e-CH2:g CH2:g-C:4 C:4=CH:5 CH:5-NH:1 NH:1-CH:2 CH:2=N:3 N:3-C:4` |
| Streptozotocin | `CH:1-O:r O:r-CH:5 CH:5-CH:4 CH:4-OH:4 CH:4-CH:3 CH:3-OH:3 CH:3-CH:2 CH:2-CH:1 CH:1-OH:1 CH:5-CH2:6 CH2:6-OH:6 CH:2-NH:a NH:a-C:u C:u=O:u C:u-N:m N:m-CH3 N:m-N:n N:n=O:n` |
| Abscisic acid | `C:1-C:2 C:2=CH:3 CH:3-C:4 C:4=O:4 C:4-CH2:5 CH2:5-C:6 C:6-C:1 C:2-CH3:a C:6-CH3:b C:6-CH3:c C:1-OH:1 C:1-CH:s1 CH:s1=CH:s2 CH:s2-C:s3 C:s3-CH3:d C:s3=CH:s4 CH:s4-C:s5 C:s5=O:s5 C:s5-OH:s5` |
| Retinol | `C:1-CH2:2 CH2:2-CH2:3 CH2:3-CH2:4 CH2:4-C:5 C:5=C:6 C:6-C:1 C:1-CH3:a C:1-CH3:b C:5-CH3:c C:6-CH:7 CH:7=CH:8 CH:8-C:9 C:9-CH3:d C:9=CH:10 CH:10-CH:11 CH:11=CH:12 CH:12-C:13 C:13-CH3:e C:13=CH:14 CH:14-CH2:15 CH2:15-OH` |
| Domoic acid | `NH-CH:2 CH:2-CH:3 CH:3-CH:4 CH:4-CH2:5 CH2:5-NH CH:2-C:a C:a=O:a C:a-OH:a CH:3-CH2:b CH2:b-C:c C:c=O:c C:c-OH:c CH:4-C:d C:d-CH3:d C:d=CH:e CH:e-CH:f CH:f=CH:g CH:g-CH:h CH:h-CH3:h CH:h-C:i C:i=O:i C:i-OH:i` |
| Sucrose | `CH:g1-O:g5 O:g5-CH:g5 CH:g5-CH:g4 CH:g4-OH:g4 CH:g4-CH:g3 CH:g3-OH:g3 CH:g3-CH:g2 CH:g2-OH:g2 CH:g2-CH:g1 CH:g5-CH2:g6 CH2:g6-OH:g6 CH:g1-O:x O:x-C:f2 C:f2-O:f5 O:f5-CH:f5 CH:f5-CH:f4 CH:f4-OH:f4 CH:f4-CH:f3 CH:f3-OH:f3 CH:f3-C:f2 C:f2-CH2:f1 CH2:f1-OH:f1 CH:f5-CH2:f6 CH2:f6-OH:f6` |
| Picrocrocin | `CH:g1-O:g5 O:g5-CH:g5 CH:g5-CH:g4 CH:g4-OH:g4 CH:g4-CH:g3 CH:g3-OH:g3 CH:g3-CH:g2 CH:g2-OH:g2 CH:g2-CH:g1 CH:g5-CH2:g6 CH2:g6-OH:g6 CH:g1-O:x O:x-CH:4 CH:4-CH2:3 CH2:3-C:2 C:2=C:1 C:1-C:6 C:6-CH2:5 CH2:5-CH:4 C:2-CH3:a C:6-CH3:b C:6-CH3:c C:1-CH:f CH:f=O:f` |
| Mugineic acid | `N:1-CH:2 CH:2-CH2:3 CH2:3-CH2:4 CH2:4-N:1 CH:2-C:a C:a=O:a C:a-OH:a N:1-CH2:b CH2:b-CH:c CH:c-OH:c CH:c-CH:d CH:d-C:e C:e=O:e C:e-OH:e CH:d-NH NH-CH2:f CH2:f-CH2:g CH2:g-CH:h CH:h-OH:h CH:h-C:i C:i=O:i C:i-OH:i` |
| Prostaglandin E2 | `CH:8-C:9 C:9=O:9 C:9-CH2:10 CH2:10-CH:11 CH:11-OH:11 CH:11-CH:12 CH:12-CH:8 CH:8-CH2:7 CH2:7-CH2:6 CH2:6-CH:5 CH:5=CH:4 CH:4-CH2:3 CH2:3-CH2:2 CH2:2-C:1 C:1=O:1 C:1-OH:1 CH:12-CH:13 CH:13=CH:14 CH:14-CH:15 CH:15-OH:15 CH:15-CH2:16 CH2:16-CH2:17 CH2:17-CH2:18 CH2:18-CH2:19 CH2:19-CH3:20` |

Their ids and facts (Panel.03):

| Molecule | Id | Fact |
|---|---|---|
| Uridine | `uridine` | The base uracil on the sugar ribose; with a phosphate added, it is one of the four building blocks of RNA. In DNA, thymine takes uracil's place. |
| Carnosine | `carnosine` | β-Alanine and histidine joined together. Muscles are full of it, and during a sprint it soaks up the acid that builds up in them. |
| Streptozotocin | `streptozotocin` | A soil bacterium makes this sugar. The insulin-making cells of the pancreas take it in as if it were glucose, and it destroys them, so it is used against tumours of those cells. |
| Abscisic acid | `abscisic-acid` | A plant hormone: in a drought it closes the pores of the leaves to save water, and it keeps seeds from sprouting too early. |
| Retinol | `retinol` | Retinol is vitamin A. Your eyes turn it into retinal, which changes shape when light hits it: the first step of seeing. |
| Domoic acid | `domoic-acid` | Made by algae, it builds up in shellfish. In 1987 mussels with it poisoned over a hundred people in Canada, and some never got their memory back. |
| Sucrose | `sucrose` | Table sugar: a glucose and a fructose joined by an oxygen. It comes from sugar cane and sugar beet. |
| Picrocrocin | `picrocrocin` | It gives saffron its bitter taste; as saffron dries, it breaks down into safranal, which gives saffron its smell. |
| Mugineic acid | `mugineic-acid` | Barley sends it out from its roots to grab iron in the soil, and takes it back in with the iron held inside. |
| Prostaglandin E2 | `prostaglandin-e2` | A signal your body makes at an injury, where it brings pain and swelling, and in an infection, where it raises a fever; aspirin and ibuprofen block the enzyme that starts making it. |

Left out after trying: Caffeine (21) and Captopril (29), too easy; Kainic acid (33), Domoic acid's ring; KDO and Nicotianamine, near N-Acetylneuraminic acid and Mugineic acid; and those with two solutions in every layout tried, or no layout in 6 by 5 in 6,000 tries: Tryptophan, Melatonin, Aspartame, Penicillin G and F, Thienamycin, Meropenem, Adenosine, Guanosine, Indigo, Thalidomide, Salicin, Arbutin, Resveratrol, Riboflavin, Biopterin, Gly-Pro-Hyp, Aucubin, Testosterone, Chlorogenic acid, Capsaicin, S-Adenosylhomocysteine and Biocytin.

## Steps

1. **The generator closes rings.** `[DONE]` ([review](review-step-1.md)) Generate.01, Generate.03; [decision 0026](../../decisions.md#0026).
   - (a) Spec and tests. Generate.03, new: "Rings: as it places each Atom in line with its partners already placed, inside the Grid, and goes back when one has no place, it finds layouts of Molecules with several rings, which the Atoms placed as a tree rarely close ([decision 0026](../decisions.md#0026))", with the example: Caffeine, `N:1-C:2 C:2=O:2 C:2-N:3 N:3-C:4 C:4=C:5 C:5-C:6 C:6=O:6 C:6-N:1 C:4-N:9 N:9=CH:8 CH:8-N:7 N:7-C:5 N:1-CH3:a N:3-CH3:b N:7-CH3:c`, 200 tries, seed 1, gives a layout of at most 6 by 5 whose one solution is these Bonds (the old search finds none in 400,000). Generate.01's example becomes `rows: 1, cols: 3, atoms: [["N",0,0,0],["C",0,1,0],["C",0,2,3]], solution: [[0,1,3],[1,2,1]]` and difficulty 2. Tests: `generate.test.js`, the Generate.03 example and Acetonitrile's new layout; `generate-script.test.js`, Acetonitrile's, the drawing of `CH3-C C=O C-OH` with `2000 3 3 1`, now `["O",0,1,0],["O",1,0,1],["C",1,1,0],["C",1,2,3]` on 2 rows by 3, that of `O:a=O:b`, now `O O` on one row, and the default size with Caffeine in place of Citric acid, which at the new default comes out 4 by 5: Caffeine's is 6 by 5, using the 6th row.
   - (b) Implementation: `generate.js` as in Design; then each of the ten prints its layout as in `puzzles.js` of step 2.
2. **Ten more Puzzles.** `[DONE]` ([review](review-step-2.md)) Puzzle.01, Puzzle.04, Puzzle.05, List.02, Panel.01's example.
   - (a) Tests: `tests/unit/puzzle/puzzles.test.js` (the 30 with their difficulty, Puzzle.09's count, N-Acetylneuraminic acid as `PUZZLES[22]`), `tests/unit/ui/ui.test.js` (30 buttons, "of 30"), and the end-to-end tests that read "of 20", open Puzzle 19 or 20, or build `PUZZLES[19]` as the last Puzzle: `puzzle.spec.js`, `check.spec.js`, `narrative.spec.js`, `progress.spec.js`, and `phone.spec.js`, whose Puzzle.04 test opens N-Acetylneuraminic acid as Puzzle 23, no longer "the largest", and gains Prostaglandin E2, Puzzle 30, 6 by 5 with the most Atoms.
   - (b) Implementation: the ten in `puzzles.js`. Remake the screenshots that show the count or the list (`page-start.png`, `page-solved.png`, `page-phone.png`, `panel-mystery.png`, `panel-solved.png`, `list.png`) and look at each.
3. **The difficulty in the panel.** `[DONE]` ([review](review-step-3.md)) Panel.01, Page.01; [decision 0027](../../decisions.md#0027).
   - (a) Tests: `tests/unit/app.test.js` (the view's `difficulty` is the open Puzzle's, 2 for Acetonitrile, and changes when another opens), `tests/unit/ui/panel.test.js` ("Difficulty 2" right after the nav; it changes in place), `tests/e2e/puzzle.spec.js` (the Panel.01 example: Puzzle 30 shows "Difficulty 67"), the ARIA snapshots of the panel in `puzzle.spec.js` and `check.spec.js`, which get `paragraph: Difficulty 7` after the navigation (Page.01's order), `phone.spec.js` (Page.01: on Puzzle 1, the actions end within the 844 px of the screen), and the screenshot tests.
   - (b) Implementation: `app.js`, `panel.js`, `style.css`, the comment in `difficulty.js`, `docs/architecture.md`. Remake the screenshots that show the panel, on a computer and a phone, and look at each.
4. **Finish.** `[DONE]` No rule ids. The spec is written in steps 1 to 3, and the decisions with this plan; check they still say what was done. `Status: Done` in the plan and the table.

Each step writes its spec changes first, in its (a) commit, and changes the end-to-end tests its change breaks, so `npm run check` passes after it.
