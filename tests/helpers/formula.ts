// @ts-nocheck
// Counting Atoms per Element, in a formula and in a Puzzle, to compare them.

/** A formula's Atoms, counted per Element: C2H4O2 is { C: 2, H: 4, O: 2 }. */
export const formulaCount = f => Object.fromEntries([...f.matchAll(/([A-Z][a-z]?)(\d*)/g)].map(([, el, n]) => [el, Number(n || 1)]));

/** A Puzzle's Atoms and their hydrogens, counted per Element, as in a formula. */
export const atomCount = p => p.atoms.reduce((m, [el, , , h]) => {
  m[el] = (m[el] ?? 0) + 1;
  if (h) m.H = (m.H ?? 0) + h;
  return m;
}, {});
