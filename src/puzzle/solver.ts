// Finds the solutions of a puzzle: Bond orders for the candidate Bonds such
// that every Atom has exactly its valence, with its hydrogens, no Bonds
// cross, and all Atoms join into one Molecule.
import { ELEMENTS, MAX_ORDER } from "./elements.ts";
import type { ElementSymbol } from "./api.ts";
import { candidateBonds, crossings, connected, type Point } from "./grid.ts";

/**
 * The solutions, each as an order per candidate Bond, up to limit of them.
 * An Atom's h, its hydrogens, is 0 if left out.
 */
export function solve(atoms: (Point & { el: ElementSymbol; h?: number })[], limit = 2): number[][] {
  const bonds = candidateBonds(atoms);
  const cross = crossings(atoms, bonds);
  const need = atoms.map(a => ELEMENTS[a.el].valence - (a.h ?? 0));
  const order = bonds.map(() => 0);
  // Bonds not yet decided, per Atom, to prune Atoms that can't be filled.
  const open = atoms.map((_, i) => bonds.filter(e => e.a === i || e.b === i).length);
  const solutions: number[][] = [];

  function fillable(i: number): boolean {
    return need[i] <= open[i] * MAX_ORDER;
  }

  function step(k: number): void {
    if (solutions.length >= limit) return;
    if (k === bonds.length) {
      if (need.every(n => n === 0) && connected(atoms.length, bonds, order)) solutions.push([...order]);
      return;
    }
    const { a, b } = bonds[k];
    open[a]--; open[b]--;
    const blocked = cross[k].some(j => j < k && order[j]);
    const most = blocked ? 0 : Math.min(MAX_ORDER, need[a], need[b]);
    for (let o = most; o >= 0; o--) {
      need[a] -= o; need[b] -= o;
      if (fillable(a) && fillable(b)) { order[k] = o; step(k + 1); }
      need[a] += o; need[b] += o;
    }
    order[k] = 0;
    open[a]++; open[b]++;
  }

  step(0);
  return solutions;
}
