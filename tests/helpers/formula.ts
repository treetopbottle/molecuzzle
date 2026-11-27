// Counting Atoms per Element, in a formula and in a Puzzle, to compare them.
import type { Puzzle } from "../../src/puzzle/api.ts";

/** A formula's Atoms, counted per Element: C2H4O2 is { C: 2, H: 4, O: 2 }. */
export const formulaCount = (f: string): Record<string, number> => Object.fromEntries([...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(([, el, n]) => [el, Number(n || 1)]));

/** A Puzzle's Atoms and their hydrogens, counted per Element, as in a formula. */
export const atomCount = (p: Puzzle): Record<string, number> => p.atoms.reduce((m: Record<string, number>, [el, , , h]) => {
  m[el] = (m[el] ?? 0) + 1;
  if (h) m.H = (m.H ?? 0) + h;
  return m;
}, {});
