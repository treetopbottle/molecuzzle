// Searches for a grid layout of a Molecule that makes a puzzle with exactly
// one solution, and prints it as an entry for src/puzzle/puzzles.js.
//
//   node scripts/generate.js "CH3-C C=O C-OH" [tries] [maxRows] [maxCols] [seed]
//
// Bonds are written between labelled Atoms: a label is the Element and then
// its hydrogens, as in a formula, with `:` and a name to tell Atoms with the
// same label apart (CH2:a, CH2:b); `-` `=` `#` are the Bond order. The search
// is findLayout in src/puzzle/generate.js.
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
const { dotted, loops } = dottedLines(layout);
// Each Atom by its label as in a formula, CH₂, and every point as wide as the
// longest label, as in the spec's drawings: a shorter one, or · for no Atom,
// is padded.
const label = (el, h) => el + (h ? "H" + (h > 1 ? "₀₁₂₃₄₅₆₇₈₉"[h] : "") : "");
const width = Math.max(...atoms.map(([el, , , h]) => label(el, h).length));
const grid = Array.from({ length: rows }, () => Array(cols).fill("·"));
for (const [el, r, c, h] of atoms) grid[r][c] = label(el, h);
console.log(grid.map(row => ("  // " + row.map(p => p.padEnd(width)).join(" ")).trimEnd()).join("\n"));
console.log(`  rows: ${rows}, cols: ${cols}, // difficulty ${difficulty(layout)}: ${dotted} Dotted lines, ${loops} loops`);
console.log(`  atoms: [${atoms.map(a => JSON.stringify(a)).join(",")}],`);
console.log(`  solution: [${solution.map(x => `[${x}]`).join(",")}],`);
