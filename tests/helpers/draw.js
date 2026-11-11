// Draws a game's Board as text, for inline snapshots.
//
//   H─O     Atoms by Element; a space where there's none
//     │     Bonds: ─ │ single, ═ ║ double, ≡ ⦀ triple
//   H·N     · a dotted line (no Bond yet)
export function draw(game) {
  const { puzzle, atoms, bonds } = game, order = game.order;
  const W = puzzle.cols * 2 - 1, H = puzzle.rows * 2 - 1;
  const grid = Array.from({ length: H }, () => Array(W).fill(" "));
  bonds.forEach((e, k) => {
    const A = atoms[e.a], B = atoms[e.b], o = order[k];
    const ch = e.horizontal ? " ─═≡"[o] : " │║⦀"[o];
    if (e.horizontal) for (let x = A.c * 2 + 1; x < B.c * 2; x++) grid[A.r * 2][x] = o ? ch : "·";
    else for (let y = A.r * 2 + 1; y < B.r * 2; y++) grid[y][A.c * 2] = o ? ch : "·";
  });
  atoms.forEach(a => (grid[a.r * 2][a.c * 2] = a.el));
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
