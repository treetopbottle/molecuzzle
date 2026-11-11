// Searches for a grid layout of a Molecule that makes a puzzle with exactly
// one solution, and prints it as an entry for src/puzzles.js.
//
//   node scripts/generate.js "O1=C1 C1-O2 O2-H1 ..." [tries] [maxRows] [maxCols] [seed]
//
// Bonds are written between labelled Atoms: the label's letters are the
// Element, `-` `=` `#` the Bond order.
import { candidateBonds, crossings } from "../src/grid.js";
import { solve } from "../src/solver.js";

const [spec, tries = "20000", maxRows = "5", maxCols = "6", seed = "1"] = process.argv.slice(2);
if (!spec) { console.error("usage: node scripts/generate.js \"<bonds>\" [tries] [maxRows] [maxCols] [seed]"); process.exit(1); }

let s = Number(seed) >>> 0 || 1;
const random = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const pick = list => list[Math.floor(random() * list.length)];

const labels = [], bonds = [];
for (const token of spec.trim().split(/\s+/)) {
  const m = token.match(/^([A-Za-z]+\d*)([-=#])([A-Za-z]+\d*)$/);
  if (!m) throw new Error(`can't read ${token}`);
  const [, x, op, y] = m;
  for (const l of [x, y]) if (!labels.includes(l)) labels.push(l);
  bonds.push({ a: labels.indexOf(x), b: labels.indexOf(y), order: { "-": 1, "=": 2, "#": 3 }[op] });
}
const element = l => l.replace(/\d+$/, "");
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
  if (rows > +maxRows || cols > +maxCols) return null;
  const atoms = labels.map((l, i) => ({ el: element(l), r: pos.get(i)[0] - r0, c: pos.get(i)[1] - c0 }));
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
  const sols = solve(p.atoms, 2);
  if (sols.length !== 1) return null;
  return { cand, order };
}

let best = null;
for (let t = 0; t < +tries; t++) {
  const p = layout();
  if (!p) continue;
  const ok = check(p);
  if (!ok) continue;
  const unused = ok.cand.length - bonds.length;
  const score = unused * 10 - p.rows * p.cols;
  if (!best || score > best.score) best = { ...p, score, unused };
}
if (!best) { console.error("no unique layout found"); process.exit(2); }

// Print with Atoms in reading order.
const idx = best.atoms.map((_, i) => i).sort((i, j) => best.atoms[i].r - best.atoms[j].r || best.atoms[i].c - best.atoms[j].c);
const rank = new Map(idx.map((i, n) => [i, n]));
const grid = Array.from({ length: best.rows }, () => Array(best.cols).fill("·"));
for (const a of best.atoms) grid[a.r][a.c] = a.el;
console.log(grid.map(row => "  // " + row.join(" ")).join("\n"));
console.log(`  rows: ${best.rows}, cols: ${best.cols}, // ${best.unused} unused candidate bonds`);
console.log(`  atoms: [${idx.map(i => `["${best.atoms[i].el}",${best.atoms[i].r},${best.atoms[i].c}]`).join(",")}],`);
console.log(`  solution: [${bonds.map(e => [rank.get(e.a), rank.get(e.b)].sort((x, y) => x - y).concat(e.order)).sort((x, y) => x[0] - y[0] || x[1] - y[1]).map(x => `[${x}]`).join(",")}],`);
