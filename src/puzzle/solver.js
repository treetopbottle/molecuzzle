// Finds the solutions of a puzzle: Bond orders for the candidate Bonds such
// that every Atom has exactly its valence, no Bonds cross, and all Atoms join
// into one Molecule.
import { ELEMENTS, MAX_ORDER } from "./elements.js";
import { candidateBonds, crossings, connected } from "./grid.js";

/**
 * @param {{el:string,r:number,c:number}[]} atoms
 * @param {number} [limit] stop after this many solutions
 * @returns {number[][]} each solution as an order per candidate Bond
 */
export function solve(atoms, limit = 2) {
  const bonds = candidateBonds(atoms);
  const cross = crossings(atoms, bonds);
  const need = atoms.map(a => ELEMENTS[a.el].valence);
  const order = bonds.map(() => 0);
  // Bonds not yet decided, per Atom, to prune Atoms that can't be filled.
  const open = atoms.map((_, i) => bonds.filter(e => e.a === i || e.b === i).length);
  const solutions = [];

  function fillable(i) {
    return need[i] <= open[i] * MAX_ORDER;
  }

  function step(k) {
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
