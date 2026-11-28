// The panel: the open Puzzle between ‹ and ›, whether it is solved, its
// difficulty, the mystery molecule or its name, formula and fact, and the
// rules. ‹, › and "Next puzzle →" carry data-open, the index of the Puzzle
// they open: whoever owns the page listens for clicks on them.
import type { KeyElement, View } from "./api.ts";
import { ELEMENTS as LOOKS } from "./elements.ts";

const RULES = [
  "Bonds run straight along a row or column, between atoms with nothing in between. The dotted lines show where they can go.",
  "Click a dotted line to bond. Click again for a double, then a triple bond; once more removes it. Right-click lowers it.",
  "Bonds can't cross.",
  "Each atom needs exactly its number of bonds, as in the key below. Its small hydrogens are already bonded and count.",
  "Under the board are the bonds you use, of the bonds the solution has. You may use more, but then it isn't solved.",
  "All atoms join into one molecule. There is exactly one solution.",
];

const SVGNS = "http://www.w3.org/2000/svg";
const KEY = 52, KEY_R = 12, STICK = 12; // the size of a key figure, its ball and its sticks

/** One figure of the key: the Element's ball, as many sticks round it as its number of bonds, and the number. */
function keyFigure(doc: Document, { symbol, valence }: KeyElement): HTMLElement {
  const look = LOOKS[symbol], c = KEY / 2;
  const svg = doc.createElementNS(SVGNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${KEY} ${KEY}`);
  svg.setAttribute("width", String(KEY));
  svg.setAttribute("height", String(KEY));
  svg.setAttribute("aria-hidden", "true");
  const add = (tag: string, attrs: Record<string, string | number>) => {
    const e = doc.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, String(attrs[k]));
    svg.appendChild(e);
    return e;
  };
  for (let i = 0; i < valence; i++) { // evenly round the ball, from the top, clockwise
    const a = (i * 2 * Math.PI) / valence, dx = Math.sin(a), dy = -Math.cos(a);
    add("line", { class: "stick", x1: c + dx * KEY_R, y1: c + dy * KEY_R, x2: c + dx * (KEY_R + STICK), y2: c + dy * (KEY_R + STICK) });
  }
  add("circle", { cx: c, cy: c, r: KEY_R, fill: look.color, stroke: look.stroke });
  add("text", { class: "sym", x: c, y: c + .5, "text-anchor": "middle", "dominant-baseline": "central", fill: look.text }).textContent = symbol;
  const figure = doc.createElement("figure");
  figure.setAttribute("role", "img");
  figure.setAttribute("aria-label", `${look.name}: ${valence} bond${valence > 1 ? "s" : ""}`);
  const number = doc.createElement("figcaption");
  number.className = "valence";
  number.textContent = String(valence);
  figure.append(svg, number);
  return figure;
}

const BADGES: Partial<Record<string, string>> = { solved: "✓ Solved" };

/** The element the panel built that matches this selector. */
function find<E extends Element = HTMLElement>(panel: HTMLElement, selector: string): E {
  const e = panel.querySelector<E>(selector);
  if (!e) throw new Error(`no ${selector} in the panel`);
  return e;
}

function build(panel: HTMLElement, elements: KeyElement[]): void {
  const doc = panel.ownerDocument;
  panel.innerHTML = `
    <nav class="puzzle-nav" aria-label="Puzzle">
      <button id="prev" aria-label="Previous puzzle">‹</button>
      <span id="counter"></span>
      <button id="next" aria-label="Next puzzle">›</button>
      <span id="badge" class="badge"></span>
    </nav>
    <p id="difficulty" class="legend"></p>
    <div class="mystery">
      <div class="eyebrow">Mystery molecule</div>
      <h1 id="title"></h1>
    </div>
    <div id="formula" class="legend"></div>
    <p id="fact" class="legend" hidden></p>
    <button id="nextPuzzle" class="primary" hidden>Next puzzle →</button>
    <ol class="rules"></ol>`;
  find(panel, ".rules").append(...RULES.map(rule => {
    const li = doc.createElement("li");
    li.textContent = rule;
    return li;
  }));
  const key = doc.createElement("div");
  key.className = "key";
  key.append(...elements.map(e => keyFigure(doc, e)));
  panel.querySelectorAll(".rules li")[RULES.findIndex(r => r.startsWith("Each atom needs"))].append(key); // the rule on valence
}

/**
 * Fills the panel, the first time from nothing, after that in place, so a
 * focused button keeps its focus.
 */
export function renderPanel(panel: HTMLElement,
  { puzzles, index, progress, done, difficulty, elements = [] }: Pick<View, "puzzles" | "index" | "progress" | "done" | "difficulty"> & { elements?: KeyElement[] }): void {
  if (!panel.querySelector("nav")) build(panel, elements);
  const $ = (id: string) => find(panel, `#${id}`);
  const puzzle = puzzles[index], last = index === puzzles.length - 1;
  const opens = (id: string, i: number, can: boolean) => {
    const button = find<HTMLButtonElement>(panel, `#${id}`);
    button.disabled = !can;
    button.dataset.open = String(i);
  };

  $("counter").textContent = `Puzzle ${index + 1} of ${puzzles.length}`;
  $("difficulty").textContent = `Difficulty ${difficulty}`;
  opens("prev", index - 1, index > 0);
  opens("next", index + 1, !last);
  const state = progress.puzzles[puzzle.id];
  $("badge").textContent = BADGES[state] ?? "Unsolved";
  $("badge").className = `badge ${state ?? ""}`;

  $("title").textContent = done ? puzzle.name : "?";
  if (done) $("formula").replaceChildren(...formulaNodes(panel.ownerDocument, puzzle.formula));
  else $("formula").textContent = "Bond every atom to find out what it is.";
  $("fact").textContent = puzzle.fact;
  $("fact").hidden = !done;
  opens("nextPuzzle", index + 1, !last);
  $("nextPuzzle").hidden = !done || last;
}

/** Formula with its numbers as subscripts, as DOM nodes. */
export function formulaNodes(doc: Document, formula: string): Node[] {
  return formula.split(/(\d+)/).filter(Boolean).map(part => {
    if (!/^\d+$/.test(part)) return doc.createTextNode(part);
    const sub = doc.createElement("sub");
    sub.textContent = part;
    return sub;
  });
}
