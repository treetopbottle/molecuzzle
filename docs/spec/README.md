# Specification

The functional specification of Molecuzzle from a user perspective, using examples for further clarification. Roles and domain entities can be found in the [README](../../README.md); the reasons are in the [decisions](../decisions.md).

Feature specification can be found in [features.md](./features.md). Each feature lists its rules. A rule has an id, `<Feature>.<NN>`, and an example. Each rule is tested by a unit test or a UI test whose name starts with its id.

A general narrative is used to describe a typical usage flow, see [narratives.md](./narratives.md).

## Scope

In scope: Puzzles on a Grid, where the Player fills in the Bonds so every Atom has exactly its valence ([0002](../decisions.md#0002)), with every hydrogen an Atom of its own ([0003](../decisions.md#0003)), and each Puzzle has exactly one solution ([0016](../decisions.md#0016)); seeing a solution; Progress kept in the browser ([0010](../decisions.md#0010)).

Left out: building freely without a Grid, recognising other Molecules (Isomers), charges and ions, Elements other than H, C, N and O, stereochemistry, 3D shapes, and saving Progress anywhere but the browser. Other puzzle modes are in `prototypes/`, outside this spec.

## Examples

The examples fit inline. The format of the stored Progress is in [schemas.md](schemas.md#progress).

Boards in examples are drawn as text, as the unit tests do: Atoms by Element at the Grid points, `·` a Dotted line, `─ │` single, `═ ║` double, and `≡ ⦀` triple Bonds. Places are written "row,column", counted from 1. Glycine, with no Bonds and solved:

```
  O·C·O·H            O═C─O─H
  · · · ·            · │ · ·
H···C···H          H───C───H
  · · ·              · │ ·
  · · ·              · │ ·
  · · ·              · │ ·
  H·N·H              H─N─H
```
