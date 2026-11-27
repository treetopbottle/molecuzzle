// Searches for a Grid layout of a Molecule that makes a Puzzle with exactly
// one solution. For the developer, through scripts/generate.js: its errors
// are not for the Player.
import { candidateBonds, crossings } from "./grid.ts";
import { solve } from "./solver.ts";
import { ELEMENTS } from "./elements.ts";
import type { Atom, Candidate, ElementSymbol, Puzzle } from "./api.ts";

type Point = [number, number];
/** An Atom of the Molecule, before it has a place: its Element and its hydrogens. */
type Kind = Omit<Atom, "r" | "c">;
/** A layout: its Atoms with their places, and its Grid. */
type Layout = { atoms: Atom[]; rows: number; cols: number };

const ORDERS: Record<string, 1 | 2 | 3> = { "-": 1, "=": 2, "#": 3 };
const isSymbol = (s: string): s is ElementSymbol => Object.hasOwn(ELEMENTS, s);

/**
 * Bonds are written between labelled Atoms, e.g. "CH3-C C#N": a label is
 * the Atom as in a formula, its Element and then its hydrogens (C, CH3, OH),
 * and Atoms with the same label are told apart by `:` and a name after it
 * (CH2:a, CH2:b); `-` `=` `#` are a single, double and triple Bond. A Bond
 * that doesn't read so, names an Element the game doesn't have or H, or an
 * Atom whose hydrogens leave it no room for a Bond, throws "can't read <bond>".
 * Returns the best of `tries` random layouts (2000 if left out) of at most
 * maxRows by maxCols (6 by 5 if left out, as every Puzzle's Grid) whose only
 * solution is this Molecule, with these Bonds, as { rows, cols, atoms, solution }
 * of a Puzzle, the Atoms in reading order with their hydrogens; or null if
 * no try has exactly one solution. The same arguments give the same layout.
 */
export function findLayout(text: string, { tries = 2000, maxRows = 6, maxCols = 5, seed = 1 } = {}): Pick<Puzzle, "rows" | "cols" | "atoms" | "solution"> | null {
  let s = seed >>> 0 || 1;
  const random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);

  /** A label's Element and hydrogens, or null if it isn't a label of an Atom with room for a Bond. */
  function atom(label: string): Kind | null {
    const m = label.match(/^([A-Z][a-z]?)(H([2-9])?)?(:[A-Za-z0-9]+)?$/);
    if (!m) return null;
    const [, el, hs, count] = m, h = hs ? Number(count ?? 1) : 0;
    if (!isSymbol(el) || el === "H" || ELEMENTS[el].valence - h < 1) return null;
    return { el, h };
  }
  const labels: string[] = [], bonds: { a: number; b: number; order: 1 | 2 | 3 }[] = [];
  for (const token of text.trim().split(/\s+/)) {
    const m = token.match(/^([^-=#]+)([-=#])([^-=#]+)$/);
    if (!m || !atom(m[1]) || !atom(m[3])) throw new Error(`can't read ${token}`);
    const [, x, op, y] = m;
    for (const l of [x, y]) if (!labels.includes(l)) labels.push(l);
    bonds.push({ a: labels.indexOf(x), b: labels.indexOf(y), order: ORDERS[op] });
  }
  const kinds = labels.map(label => {
    const kind = atom(label);
    if (!kind) throw new Error(`can't read ${label}`); // each was read above
    return kind;
  });
  const neighbours = labels.map((_, i) => bonds.filter(e => e.a === i || e.b === i));

  const other = (e: { a: number; b: number }, x: number) => (e.a === x ? e.b : e.a);
  /** The points strictly between two points, or null if they aren't in a row or a column. */
  function between([r, c]: Point, [wr, wc]: Point): string[] | null {
    if (wr !== r && wc !== c) return null;
    const n = Math.abs(wr - r) + Math.abs(wc - c), sr = Math.sign(wr - r), sc = Math.sign(wc - c), out: string[] = [];
    for (let t = 1; t < n; t++) out.push(`${r + sr * t},${c + sc * t}`);
    return out;
  }

  // One Atom at a time, in line with every partner already placed, with no
  // Atom or Bond between, inside the Grid; back to the Atom before when one
  // has no place (decision 0026).
  function layout(): Layout | null {
    const pos = new Map<number, Point>(), taken = new Set<string>(); // the points "r,c" of the Atoms and their Bonds
    const placed = (i: number): Point => {
      const p = pos.get(i);
      if (!p) throw new Error(`Atom ${i} isn't placed`);
      return p;
    };
    let r0 = 0, r1 = 0, c0 = 0, c1 = 0, budget = 3000;
    const root = Math.floor(random() * labels.length);
    pos.set(root, [0, 0]); taken.add("0,0");

    function place(): boolean {
      if (pos.size === labels.length) return true;
      if (--budget < 0) return false;
      // Next, an unplaced Atom with the most Bonds to placed ones, a random one of those.
      let v = -1, most = 0, ties = 0;
      for (let x = 0; x < labels.length; x++) {
        if (pos.has(x)) continue;
        const n = neighbours[x].filter(e => pos.has(other(e, x))).length;
        if (n > most) { v = x; most = n; ties = 1; }
        else if (n === most && n > 0 && random() < 1 / ++ties) v = x;
      }
      const partners = neighbours[v].map(e => other(e, v)).filter(w => pos.has(w));
      const [r, c] = placed(partners[0]);
      const options: { at: Point; end: string; path: string[]; weight: number }[] = [];
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]])
        for (let len = 1; len <= 3; len++) {
          const at: Point = [r + dr * len, c + dc * len], end = at.join();
          if (taken.has(end)) break; // and every point further on
          if (Math.max(r1, at[0]) - Math.min(r0, at[0]) >= maxRows || Math.max(c1, at[1]) - Math.min(c0, at[1]) >= maxCols) continue;
          const path: string[] = [];
          const fits = partners.every(w => {
            const points = between(at, placed(w));
            if (!points || points.some(q => taken.has(q) || path.includes(q))) return false;
            path.push(...points);
            return true;
          });
          if (fits) options.push({ at, end, path, weight: (len === 1 ? 3 : 1) * random() });
        }
      options.sort((x, y) => y.weight - x.weight); // nearer points first, more often
      for (const { at, end, path } of options) {
        const box = [r0, r1, c0, c1];
        pos.set(v, at); taken.add(end);
        for (const q of path) taken.add(q);
        r0 = Math.min(r0, at[0]); r1 = Math.max(r1, at[0]); c0 = Math.min(c0, at[1]); c1 = Math.max(c1, at[1]);
        if (place()) return true;
        [r0, r1, c0, c1] = box;
        pos.delete(v); taken.delete(end);
        for (const q of path) taken.delete(q);
        if (budget < 0) return false;
      }
      return false;
    }

    if (!place()) return null;
    const atoms = labels.map((_, i) => ({ ...kinds[i], r: placed(i)[0] - r0, c: placed(i)[1] - c0 }));
    return { atoms, rows: r1 - r0 + 1, cols: c1 - c0 + 1 };
  }

  function check(p: Layout): { cand: Candidate[] } | null {
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

  let best: (Layout & { score: number }) | null = null;
  for (let t = 0; t < tries; t++) {
    const p = layout();
    if (!p) continue;
    const ok = check(p);
    if (!ok) continue;
    const score = (ok.cand.length - bonds.length) * 10 - p.rows * p.cols;
    if (!best || score > best.score) best = { ...p, score };
  }
  if (!best) return null;
  const { atoms } = best;

  // The Atoms in reading order, and the Bonds as a Board.
  const idx = atoms.map((_, i) => i).sort((i, j) => atoms[i].r - atoms[j].r || atoms[i].c - atoms[j].c);
  const rank = (i: number) => idx.indexOf(i);
  return {
    rows: best.rows, cols: best.cols,
    atoms: idx.map(i => [atoms[i].el, atoms[i].r, atoms[i].c, atoms[i].h]),
    solution: bonds.map((e): [number, number, 1 | 2 | 3] => {
      const [x, y] = [rank(e.a), rank(e.b)].sort((p, q) => p - q);
      return [x, y, e.order];
    }).sort((x, y) => x[0] - y[0] || x[1] - y[1]),
  };
}
