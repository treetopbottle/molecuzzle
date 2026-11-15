// Where Bonds can go on a Grid: between an Atom and its nearest Atom to the
// right, and its nearest Atom below.

/** @param {{r:number,c:number}[]} atoms */
export function candidateBonds(atoms) {
  const bonds = [];
  atoms.forEach((a, i) => {
    let right = -1, down = -1;
    atoms.forEach((b, j) => {
      if (b.r === a.r && b.c > a.c && (right < 0 || b.c < atoms[right].c)) right = j;
      if (b.c === a.c && b.r > a.r && (down < 0 || b.r < atoms[down].r)) down = j;
    });
    if (right >= 0) bonds.push({ a: i, b: right, horizontal: true });
    if (down >= 0) bonds.push({ a: i, b: down, horizontal: false });
  });
  return bonds;
}

/** Whether two candidate Bonds cross each other between their Atoms. */
export function crosses(atoms, e, f) {
  if (e.horizontal === f.horizontal) return false;
  const h = e.horizontal ? e : f, v = e.horizontal ? f : e;
  const r = atoms[h.a].r, c = atoms[v.a].c;
  return c > atoms[h.a].c && c < atoms[h.b].c && r > atoms[v.a].r && r < atoms[v.b].r;
}

/** For each candidate Bond, the indexes of the candidate Bonds it crosses. */
export function crossings(atoms, bonds) {
  return bonds.map(e => bonds.flatMap((f, j) => (crosses(atoms, e, f) ? [j] : [])));
}

/** Whether the Bonds with order > 0 join all Atoms into one piece. */
export function connected(atomCount, bonds, order) {
  if (atomCount === 0) return true;
  const seen = new Set([0]), queue = [0];
  while (queue.length) {
    const u = queue.pop();
    bonds.forEach((e, k) => {
      if (!order[k] || (e.a !== u && e.b !== u)) return;
      const v = e.a === u ? e.b : e.a;
      if (!seen.has(v)) { seen.add(v); queue.push(v); }
    });
  }
  return seen.size === atomCount;
}
