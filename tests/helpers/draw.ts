// @ts-nocheck
// Draws a game's Board as text, for inline snapshots, as the spec's README
// draws them.
//
//   OH··NH₂   Atoms by their label: Element, then hydrogens (C, CH₂, OH)
//   │   ·     Bonds: ─ │ single, ═ ║ double, ≡ ⦀ triple
//   C───CH₂   · a dotted line (no Bond yet); a space where there's no Atom
//
// Every Grid point is as wide as the longest label on the Board, a shorter
// label in its first characters, and the columns are one character more
// apart. A Bond along a column runs under the first characters of its labels.
const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";

/** An Atom as in a formula: CH₂, OH, C. */
const label = a => a.el + (a.h ? "H" + (a.h > 1 ? SUBSCRIPTS[a.h] : "") : "");

export function draw(game) {
  const { puzzle, atoms, bonds } = game, order = game.order;
  const labels = atoms.map(a => [...label(a)]);
  const width = Math.max(...labels.map(l => l.length)), step = width + 1;
  const W = (puzzle.cols - 1) * step + width, H = puzzle.rows * 2 - 1;
  const grid = Array.from({ length: H }, () => Array(W).fill(" "));
  bonds.forEach((e, k) => {
    const A = atoms[e.a], B = atoms[e.b], o = order[k];
    const ch = e.horizontal ? " ─═≡"[o] : " │║⦀"[o];
    if (e.horizontal) for (let x = A.c * step + labels[e.a].length; x < B.c * step; x++) grid[A.r * 2][x] = o ? ch : "·";
    else for (let y = A.r * 2 + 1; y < B.r * 2; y++) grid[y][A.c * step] = o ? ch : "·";
  });
  atoms.forEach((a, i) => labels[i].forEach((ch, x) => (grid[a.r * 2][a.c * step + x] = ch)));
  return "\n" + grid.map(row => row.join("").trimEnd()).join("\n") + "\n";
}

/** Bonds a game's candidate Bond between the Atoms at two places, "row,col" from 1. */
export function bondIndex(game, from, to) {
  const at = p => game.atoms.findIndex(a => `${a.r + 1},${a.c + 1}` === p);
  const [i, j] = [at(from), at(to)];
  const k = game.bonds.findIndex(e => (e.a === i && e.b === j) || (e.a === j && e.b === i));
  if (k < 0) throw new Error(`no candidate Bond between ${from} and ${to}`);
  return k;
}

/** Clicks the Bond between two places `times` times (dir +1) and returns the last result. */
export function click(game, from, to, times = 1, dir = 1) {
  let result;
  for (let n = 0; n < times; n++) result = game.change(bondIndex(game, from, to), dir);
  return result;
}

/** Builds a puzzle's solution by clicking, as a Player would. */
export function build(game) {
  for (const [a, b, o] of game.puzzle.solution) {
    const k = game.bonds.findIndex(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
    for (let n = 0; n < o; n++) game.change(k, +1);
  }
}
