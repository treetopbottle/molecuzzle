// Searches for a grid layout of a Molecule that makes a puzzle with exactly
// one solution, and prints it as an entry for src/puzzle/puzzles.js.
//
//   node scripts/generate.js "O1=C1 C1-O2 O2-H1 ..." [tries] [maxRows] [maxCols] [seed]
//
// Bonds are written between labelled Atoms: the label's letters are the
// Element, `-` `=` `#` the Bond order. The search is findLayout in
// src/puzzle/generate.js.
import { findLayout } from "../src/puzzle/generate.js";
import { difficulty, dottedLines } from "../src/puzzle/difficulty.js";

// Arguments left out are findLayout's defaults, such as a Grid of at most 6
// rows by 5 columns, as every Puzzle's (decision 0019).
const [spec, ...numbers] = process.argv.slice(2);
const [tries, maxRows, maxCols, seed] = numbers.map(Number);
if (!spec) { console.error("usage: node scripts/generate.js \"<bonds>\" [tries] [maxRows] [maxCols] [seed]"); process.exit(1); }

let layout;
try {
  layout = findLayout(spec, { tries, maxRows, maxCols, seed });
} catch (e) {
  if (!e.message.startsWith("can't read ")) throw e;
  console.error(e.message);
  process.exit(1);
}
if (!layout) { console.error("no unique layout found"); process.exit(2); }

const { rows, cols, atoms, solution } = layout;
const { dotted, empty } = dottedLines(layout);
// With a two-letter symbol, every point is two characters wide, as in the
// spec's drawings: a one-letter symbol, or · for no Atom, is padded.
const width = Math.max(...atoms.map(([el]) => el.length));
const grid = Array.from({ length: rows }, () => Array(cols).fill("·"));
for (const [el, r, c] of atoms) grid[r][c] = el;
console.log(grid.map(row => ("  // " + row.map(p => p.padEnd(width)).join(" ")).trimEnd()).join("\n"));
console.log(`  rows: ${rows}, cols: ${cols}, // difficulty ${difficulty(layout)}: ${dotted} Dotted lines, ${empty} empty`);
console.log(`  atoms: [${atoms.map(a => JSON.stringify(a)).join(",")}],`);
console.log(`  solution: [${solution.map(x => `[${x}]`).join(",")}],`);
