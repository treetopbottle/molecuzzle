// Searches for a grid layout of a Molecule that makes a puzzle with exactly
// one solution, and prints it as an entry for src/puzzle/puzzles.js.
//
//   node scripts/generate.js "O1=C1 C1-O2 O2-H1 ..." [tries] [maxRows] [maxCols] [seed]
//
// Bonds are written between labelled Atoms: the label's letters are the
// Element, `-` `=` `#` the Bond order. The search is findLayout in
// src/puzzle/generate.js.
import { findLayout } from "../src/puzzle/generate.js";
import { candidateBonds } from "../src/puzzle/grid.js";

const [spec, tries = "20000", maxRows = "5", maxCols = "6", seed = "1"] = process.argv.slice(2);
if (!spec) { console.error("usage: node scripts/generate.js \"<bonds>\" [tries] [maxRows] [maxCols] [seed]"); process.exit(1); }

let layout;
try {
  layout = findLayout(spec, { tries: +tries, maxRows: +maxRows, maxCols: +maxCols, seed: +seed });
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
if (!layout) { console.error("no unique layout found"); process.exit(2); }

const { rows, cols, atoms, solution } = layout;
const unused = candidateBonds(atoms.map(([el, r, c]) => ({ el, r, c }))).length - solution.length;
const grid = Array.from({ length: rows }, () => Array(cols).fill("·"));
for (const [el, r, c] of atoms) grid[r][c] = el;
console.log(grid.map(row => "  // " + row.join(" ")).join("\n"));
console.log(`  rows: ${rows}, cols: ${cols}, // ${unused} unused candidate bonds`);
console.log(`  atoms: [${atoms.map(a => JSON.stringify(a)).join(",")}],`);
console.log(`  solution: [${solution.map(x => `[${x}]`).join(",")}],`);
