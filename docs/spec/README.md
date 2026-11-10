# Specification

What Molecuzzle does, as it stands, by example. Roles and entities are in the [README](../../README.md); the reasons are in the [decisions](../decisions.md).

Each feature lists its rules. A rule has an id, `<Feature>.<NN>`, that is never reused, and an example. Each rule is translated into a test; one that can't be tested automatically says how it is checked.

## Scope

In scope: building real Molecules from exactly the Atoms a Level gives, under a simple bonding model of fixed valences ([0002](../decisions.md#0002)), with every hydrogen placed by the Player ([0003](../decisions.md#0003)); naming other Known Molecules the Player builds ([0007](../decisions.md#0007)).

Left out: charges and ions, lone pairs, stereochemistry, 3D shapes, building freely without a Level, and saving Progress anywhere but the browser ([0010](../decisions.md#0010)).

## Data

The examples fit inline. The format of the stored Progress is in [schemas.md](schemas.md#progress).

## Playing

### Level

- Levels: there are 25, in the order of the table below. A Level gives exactly the Atoms of its target, and the panel shows the target's name and formula, an intro, and per Element the count, name and valences (Level.01)
- Open: any Level can be started from the Levels list or with Previous and Next, solved or not (Level.02)
- Ends: Previous is disabled on Level 1, Next on Level 25 (Level.03)
- Start: a Level starts with no Bonds and its Atoms scattered apart over the Board, above the status line (Level.04)
- Levels list: per Level its number, name and formula, ✓ if solved and 👁 if its solution was seen; the current Level is outlined, and a bar shows how many are solved (Level.05)
- Badge: the panel shows "Unsolved", "✓ Solved" or "Solution seen" for the current Level (Level.06)

Example (Level.01, Level.04):

```
Given no Level is open
When the Player starts Level 15
Then the panel shows "Ethanol", "C2H6O" and the Atoms "×2 Carbon 4 bonds", "×6 Hydrogen 1 bond", "×1 Oxygen 2 bonds"
And the Board has 2 C, 6 H and 1 O Atoms and no Bonds
```

Example (Level.02, Level.03, Level.05, Level.06):

```
Given no Level is solved, and Level 3's solution was seen
When the Player opens Levels
Then Level 3 shows 👁 and the bar shows 0 of 25
When the Player picks Level 25
Then Level 25 starts, its badge says "Unsolved", and Next is disabled
```

| # | Target | Formula | Structure (SMILES) |
|---|---|---|---|
| 1 | Hydrogen | H₂ | `[H][H]` |
| 2 | Water | H₂O | `O` |
| 3 | Ammonia | NH₃ | `N` |
| 4 | Methane | CH₄ | `C` |
| 5 | Oxygen | O₂ | `O=O` |
| 6 | Carbon dioxide | CO₂ | `O=C=O` |
| 7 | Nitrogen | N₂ | `N#N` |
| 8 | Hydrogen cyanide | HCN | `C#N` |
| 9 | Formaldehyde | CH₂O | `C=O` |
| 10 | Hydrogen peroxide | H₂O₂ | `OO` |
| 11 | Ethylene | C₂H₄ | `C=C` |
| 12 | Acetylene | C₂H₂ | `C#C` |
| 13 | Methanol | CH₄O | `CO` |
| 14 | Freon-12 | CCl₂F₂ | `ClC(Cl)(F)F` |
| 15 | Ethanol | C₂H₆O | `CCO` |
| 16 | Dimethyl ether | C₂H₆O | `COC` |
| 17 | Cyclopropane | C₃H₆ | `C1CC1` |
| 18 | Acetic acid | C₂H₄O₂ | `CC(=O)O` |
| 19 | Acetone | C₃H₆O | `CC(=O)C` |
| 20 | Urea | CH₄N₂O | `NC(N)=O` |
| 21 | Glycine | C₂H₅NO₂ | `NCC(=O)O` |
| 22 | Sulfuric acid | H₂SO₄ | `OS(=O)(=O)O` |
| 23 | Phosphoric acid | H₃PO₄ | `OP(=O)(O)O` |
| 24 | Benzene | C₆H₆ | `C1=CC=CC=C1` |
| 25 | Phenol | C₆H₆O | `OC1=CC=CC=C1` |

### Help

- Hint shows or hides the Level's hint (Help.01)
- Show solution asks for confirmation, then bonds all Atoms into the target and lays them out (Help.02)
- Seen: after Show solution, the status says "Here is <name>. Clear the bonds and try building it yourself to mark it solved.", no dialog shows, and the Level is marked as solution seen, unless it was already solved (Help.03)
- Retry: once the Board has no Bonds again, building the target solves the Level as usual (Help.04)
- How to play explains the controls and the Elements' valences; it opens by itself on the first visit (Help.05)

Example (Help.01):

```
Given Level 2
When the Player clicks Hint
Then the hint "Oxygen in the middle, one hydrogen on each side." shows
When the Player clicks Hint again
Then it is hidden
```

Example (Help.02, Help.03, Help.04):

```
Given Level 19, unsolved
When the Player clicks Show solution and confirms
Then the Board shows Acetone, the badge says "Solution seen", and no dialog shows
When the Player clicks Clear bonds and builds Acetone
Then the badge says "✓ Solved" and the dialog shows
```

## Building

| Element | Valences (Bonds) |
|---|---|
| H, F, Cl | 1 |
| O | 2 |
| N | 3 |
| C | 4 |
| P | 3 or 5 |
| S | 2, 4 or 6 |

An Atom's bond count is the sum of its Bonds: single 1, double 2, triple 3. An Atom is complete when its bond count is one of its valences; an Atom with no Bonds never is. Its max is its largest valence.

### Board

- Drag: pressing an Atom and moving more than 5 px drags it; it stays inside the Board (Board.01)
- Select: clicking an Atom (moving 5 px or less) with none selected selects it: a dashed ring marks it, and a dashed line follows the pointer (Board.02)
- Deselect: clicking the selected Atom, clicking the empty Board, or pressing Esc deselects (Board.03)
- Shuffle atoms scatters the Atoms again and keeps the Bonds (Board.04)
- Tidy up moves the Atoms into a layout of their current Bonds and keeps the Bonds; checked by hand: no Atoms overlap afterwards (Board.05)

Example (Board.02, Board.03):

```
Given Level 2 and no Atom selected
When the Player clicks the O Atom
Then the O Atom is selected
When the Player clicks the empty Board
Then no Atom is selected
```

### Bond

- Bond: with an Atom selected, clicking another Atom bonds them with a single Bond and deselects (Bond.01)
- Stronger: if those two Atoms are already bonded, their Bond goes up one: single to double, double to triple (Bond.02)
- Max: a Bond is never made or strengthened past an Atom's max; the message "<Element> can't form more than <max> bond(s)." shows instead (Bond.03)
- Triple: a triple Bond isn't strengthened; the message "Triple bonds are as strong as it gets." shows instead (Bond.04)
- Click a Bond: clicking a Bond deselects and makes the Bond one stronger; a triple Bond, or one that can't get stronger because of Bond.03, is removed (Bond.05)
- Undo, or Ctrl+Z / Cmd+Z, restores the Bonds as they were before the last change to them, up to 300 changes back in this Level. Positions aren't undone. Undo is disabled with nothing to undo (Bond.06)
- Clear bonds removes every Bond; Undo brings them back (Bond.07)

Example (Bond.01, Bond.02, Bond.04):

```
Given Level 7, with two N Atoms and no Bonds
When the Player clicks one N, then the other N
Then they have a single Bond
When the Player does that twice more
Then they have a triple Bond
When the Player does it once more
Then the message is "Triple bonds are as strong as it gets." and the Bond stays triple
```

Example (Bond.03):

```
Given Level 2, with one H bonded to the O
When the Player clicks that H, then the other H
Then no Bond is made and the message is "Hydrogen can't form more than 1 bond."
```

Example (Bond.05):

```
Given Level 5, with a single Bond between the two O Atoms
When the Player clicks the Bond
Then it is double
When the Player clicks it again
Then it is removed, because O's max is 2
```

Example (Bond.06, Bond.07):

```
Given Level 3, with three N–H Bonds
When the Player clicks Clear bonds
Then there are no Bonds
When the Player presses Ctrl+Z
Then the three N–H Bonds are back
```

### Valence

- Dots: each Atom shows one orange dot per Bond it still needs: the smallest valence that is at least its bond count, minus its bond count (Valence.01)
- Glow: a complete Atom glows; others don't (Valence.02)

Example:

```
Given Level 22
When nothing is bonded
Then the S Atom shows 2 dots and doesn't glow
When the S has 2 single Bonds
Then it shows no dots and glows
When it has 3 single Bonds
Then it shows 1 dot and doesn't glow
```

## Checking

### Check

After every change to the Bonds, the status line shows the first that applies:

- No Bonds: "Click an atom, then another atom, to bond them. Drag atoms to move them." (Check.01)
- Incomplete: "<N> atom(s) still need(s) bonds (orange dots)." (Check.02)
- Pieces: all Atoms complete but in more than one piece: "Every bond is filled, but you built <K> separate molecules: <A> + <B>. Use all atoms in one molecule.", with each piece named if it is a Known Molecule, or "an unknown piece" (Check.03)
- Target: one Molecule that is the target: the Level is solved, see Check.09 (Check.04)
- Isomer: one Molecule that is another Known Molecule: "That's <name> — a real molecule with the same atoms, but not <target>. Rearrange the bonds!" (Check.05)
- Unknown: one Molecule that isn't a Known Molecule: "All the bonding rules are satisfied, but this isn't <target>. Try a different arrangement." (Check.06)

Two Molecules are the same when the same Elements are connected the same way with the same Bond orders:

- Structure only: which Atom of an Element sits where, and where Atoms are on the Board, doesn't matter (Check.07)
- Rings: a ring of six Atoms with alternating single and double Bonds is the same whichever way the alternation is drawn (Check.08)

When the target is built:

- Solved: the status says "✓ You built <name>!", the Atoms pulse, the Level is marked solved, and after about a second a dialog shows the name, formula and fact, how many Levels are solved and Molecules collected, and the buttons "Stay here" and "Next level →" ("See your collection" on Level 25). The dialog shows once, until the Board has no Bonds again or the Level restarts (Check.09)

Example (Check.02):

```
Given Level 3
When the Player bonds one H to the N
Then the status is "3 atoms still need bonds (orange dots)."
```

Example (Check.03):

```
Given Level 18 (C2H4O2)
When the Player builds CH4 and O=C=O
Then the status is "Every bond is filled, but you built 2 separate molecules: Methane + Carbon dioxide. Use all atoms in one molecule."
```

Example (Check.05, Check.07):

```
Given Level 15 (Ethanol)
When the Player builds CH3–O–CH3, using any of the C and H Atoms
Then the status is "That's Dimethyl ether — a real molecule with the same atoms, but not Ethanol. Rearrange the bonds!"
```

Example (Check.06):

```
Given Level 22 (Sulfuric acid)
When the Player builds H–S–O–O–O–O–H
Then the status is "All the bonding rules are satisfied, but this isn't Sulfuric acid. Try a different arrangement."
```

Example (Check.04, Check.08, Check.09):

```
Given Level 24 (Benzene), unsolved
When the Player builds the ring with its double Bonds on either set of alternate ring Bonds, one H on each C
Then the status is "✓ You built Benzene!", the badge says "✓ Solved", and the dialog shows "Benzene", "C6H6" and "Next level →"
```

### Collection

- Discover: a complete piece of two or more Atoms that is a Known Molecule other than the target, built for the first time, joins the Collection with the message "New in your collection: <name>", even if other Atoms are incomplete (Collection.01)
- Target: solving a Level, or seeing its solution, adds its target to the Collection (Collection.02)
- List: the header shows "Collection <n>/60". The Collection list shows every Known Molecule, smallest first: discovered ones with name, formula and fact, others as "???" with their formula and "Not discovered yet." (Collection.03)

Example (Collection.01, Collection.03):

```
Given Water isn't in the Collection, which has 5 Known Molecules, and Level 15 is open
When the Player bonds the O to two H Atoms
Then the message is "New in your collection: Water" and the header shows "Collection 6/60"
```

Known Molecules: the 25 targets above, and:

- Cl₂: Chlorine. ClF: Chlorine monofluoride. F₂: Fluorine.
- H₂S: Hydrogen sulfide. SO₂: Sulfur dioxide. SO₃: Sulfur trioxide.
- N₂H₂: Diazene. N₂H₄: Hydrazine. NH₂OH: Hydroxylamine. HNCO: Isocyanic acid.
- CH₃N: Methanimine. CH₅N: Methylamine. CH₃NO: Formamide. CH₂N₂: Cyanamide. CH₂O₂: Formic acid.
- C₂H₆: Ethane. C₂H₂O: Ketene. C₂H₄O: Acetaldehyde, Ethylene oxide, Vinyl alcohol.
- C₂H₄O₂: Methyl formate, Glycolaldehyde. C₂H₅NO₂: Methyl carbamate, Glycolamide.
- C₃H₆: Propene. C₃H₆O: Propanal, Allyl alcohol, Propylene oxide, Oxetane, Cyclopropanol, Methyl vinyl ether.
- C₆H₆: Prismane, Dewar benzene, Fulvene, Hexa-1,5-diyne.

## Browser

### Progress

- Saved: which Levels are solved or seen, the Collection, the current Level and whether How to play was seen are kept in the browser, in the format of [Progress](schemas.md#progress); a reload starts at the last Level played (Progress.01)
- No storage: if the browser can't store data, the game works and saves nothing; checked by hand in a private window with storage blocked (Progress.02)
- Reset progress, in the Levels list, asks for confirmation, then clears all Progress and starts Level 1 (Progress.03)

Example (Progress.01, Progress.03):

```
Given Levels 1–4 are solved and the Player is on Level 5
When the Player reloads the page
Then Level 5 is open and Levels 1–4 show ✓ in the Levels list
When the Player clicks Reset progress and confirms
Then Level 1 is open, no Level is solved and the Collection is empty
```

### Layout

- Screens: wider than 820 px, the Board is left and the panel right; narrower, the Board is on top with the label "<N>. Build <name> · <formula>", and the panel below. Checked by hand at 1280×800 and 390×844 (Layout.01)
- Touch: dragging and tapping work as with a mouse; checked by hand on a phone (Layout.02)
- Dialogs close with their button, Esc, or a click outside them (Layout.03)

Example (Layout.03):

```
Given the Collection list is open
When the Player presses Esc
Then it closes, and the selected Atom, if any, stays selected
```

## Narratives

### First day

Noor opens Molecuzzle for the first time and reads [Help] How to play. Level 1 starts [Level] with two H Atoms on the [Board]; Noor clicks one, then the other, and makes a [Bond]. Both stop showing dots and glow [Valence], and the game says Hydrogen is built [Check]. In Level 5 Noor learns to click the Bond to make it double, and in Level 7 triple.

In Level 15 Noor joins the O between the two C Atoms; the game says that is Dimethyl ether, not Ethanol [Check], and the [Collection] shows a new Known Molecule. Noor asks for a Hint [Help], moves the O to the end of the chain, and solves the Level. Stuck on Level 24, Noor uses Show solution, clears the Bonds and builds Benzene alone. The next day, in the same browser, the page opens on Level 25 with everything solved still marked [Progress]. Noor also tries it on a phone, with the Board above the panel [Layout].

An end-to-end test follows it.
