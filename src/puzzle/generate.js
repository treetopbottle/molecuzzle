// Searches for a Grid layout of a Molecule that makes a Puzzle with exactly
// one solution. For the developer, through scripts/generate.js: its errors
// are not for the Player.
import { candidateBonds, crossings } from "./grid.js";
import { solve } from "./solver.js";
import { ELEMENTS } from "./elements.js";

/**
 * Bonds are written between labelled Atoms, e.g. "CH3-C C#N": a label is
 * the Atom as in a formula, its Element and then its hydrogens (C, CH3, OH),
 * and Atoms with the same label are told apart by `:` and a name after it
 * (CH2:a, CH2:b); `-` `=` `#` are a single, double and triple Bond. A Bond
 * that doesn't read so, names an Element the game doesn't have or H, or an
 * Atom whose hydrogens leave it no room for a Bond, throws "can't read <bond>".
 * Returns the best of `tries` random layouts of at most maxRows by maxCols
 * (6 by 5 if left out, as every Puzzle's Grid)
 * whose only solution is this Molecule, with these Bonds, as { rows, cols, atoms, solution }
 * of a Puzzle, the Atoms in reading order with their hydrogens; or null if
 * no try has exactly one solution. The same arguments give the same layout.
 */
export function findLayout(text, { tries = 20000, maxRows = 6, maxCols = 5, seed = 1 } = {}) {
  let s = seed >>> 0 || 1;
  const random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const pick = list => list[Math.floor(random() * list.length)];

  /** A label's Element and hydrogens, or null if it isn't a label of an Atom with room for a Bond. */
  function atom(label) {
    const m = label.match(/^([A-Z][a-z]?)(H([2-9])?)?(:[A-Za-z0-9]+)?$/);
    if (!m) return null;
    const [, el, hs, count] = m, h = hs ? Number(count ?? 1) : 0;
    if (el === "H" || !Object.hasOwn(ELEMENTS, el) || ELEMENTS[el].valence - h < 1) return null;
    return { el, h };
  }
  const labels = [], bonds = [];
  for (const token of text.trim().split(/\s+/)) {
    const m = token.match(/^([^-=#]+)([-=#])([^-=#]+)$/);
    if (!m || !atom(m[1]) || !atom(m[3])) throw new Error(`can't read ${token}`);
    const [, x, op, y] = m;
    for (const l of [x, y]) if (!labels.includes(l)) labels.push(l);
    bonds.push({ a: labels.indexOf(x), b: labels.indexOf(y), order: { "-": 1, "=": 2, "#": 3 }[op] });
  }
  const kinds = labels.map(atom);
  const neighbours = labels.map((_, i) => bonds.filter(e => e.a === i || e.b === i));

  function layout() {
    const pos = new Map(), cells = new Map(); // cell "r,c" -> "atom" | "segment"
    const root = Math.floor(random() * labels.length);
    pos.set(root, [0, 0]); cells.set("0,0", "atom");
    const stack = [root];
    while (stack.length) {
      const u = stack.splice(Math.floor(random() * stack.length), 1)[0];
      for (const e of neighbours[u]) {
        const v = e.a === u ? e.b : e.a;
        if (pos.has(v)) continue;
        const [r, c] = pos.get(u);
        const options = [];
        for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]])
          for (let len = 1; len <= 3; len++) {
            const path = [];
            for (let t = 1; t < len; t++) path.push(`${r + dr * t},${c + dc * t}`);
            const end = `${r + dr * len},${c + dc * len}`;
            if (cells.has(end) || path.some(p => cells.has(p))) break;
            options.push({ end: [r + dr * len, c + dc * len], path, weight: len === 1 ? 3 : 1 });
          }
        if (!options.length) return null;
        const weighted = options.flatMap(o => Array(o.weight).fill(o));
        const o = pick(weighted);
        pos.set(v, o.end); cells.set(o.end.join(), "atom");
        for (const p of o.path) cells.set(p, "segment");
        stack.push(v);
      }
    }
    const rs = [...pos.values()].map(p => p[0]), cs = [...pos.values()].map(p => p[1]);
    const r0 = Math.min(...rs), c0 = Math.min(...cs);
    const rows = Math.max(...rs) - r0 + 1, cols = Math.max(...cs) - c0 + 1;
    if (rows > maxRows || cols > maxCols) return null;
    const atoms = labels.map((_, i) => ({ ...kinds[i], r: pos.get(i)[0] - r0, c: pos.get(i)[1] - c0 }));
    return { atoms, rows, cols };
  }

  function check(p) {
    const cand = candidateBonds(p.atoms);
    const order = cand.map(() => 0);
    for (const e of bonds) {
      const k = cand.findIndex(f => (f.a === e.a && f.b === e.b) || (f.a === e.b && f.b === e.a));
      if (k < 0) return null;
      order[k] = e.order;
    }
    const cross = crossings(p.atoms, cand);
    if (order.some((o, k) => o && cross[k].some(j => order[j]))) return null;
    // Exactly one solution, and it is these Bonds: Bonds that don't give each
    // Atom its valence, with its hydrogens, never are.
    const solutions = solve(p.atoms, 2);
    if (solutions.length !== 1 || solutions[0].some((o, k) => o !== order[k])) return null;
    return { cand };
  }

  let best = null;
  for (let t = 0; t < tries; t++) {
    const p = layout();
    if (!p) continue;
    const ok = check(p);
    if (!ok) continue;
    const score = (ok.cand.length - bonds.length) * 10 - p.rows * p.cols;
    if (!best || score > best.score) best = { ...p, score };
  }
  if (!best) return null;

  // The Atoms in reading order, and the Bonds as a Board.
  const idx = best.atoms.map((_, i) => i).sort((i, j) => best.atoms[i].r - best.atoms[j].r || best.atoms[i].c - best.atoms[j].c);
  const rank = new Map(idx.map((i, n) => [i, n]));
  return {
    rows: best.rows, cols: best.cols,
    atoms: idx.map(i => [best.atoms[i].el, best.atoms[i].r, best.atoms[i].c, best.atoms[i].h]),
    solution: bonds.map(e => [rank.get(e.a), rank.get(e.b)].sort((x, y) => x - y).concat(e.order))
      .sort((x, y) => x[0] - y[0] || x[1] - y[1]),
  };
}
