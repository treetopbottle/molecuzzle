// The Board: draws a game's Atoms and candidate Bonds as SVG, and turns
// clicks and keys on a Bond into onChange(bond, +1 or -1).
import { ELEMENTS } from "./elements.js";

const SVGNS = "http://www.w3.org/2000/svg";
export const CELL = 84, PAD = 46, SCALE = 1.25, HIT = 22;
const ORDER_NAMES = ["no bond", "single bond", "double bond", "triple bond"];
const OFFSETS = [[], [0], [-4.5, 4.5], [-8, 0, 8]];

function el(tag, attrs, parent) {
  const e = parent.ownerDocument.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
}

/** Where an Atom is, for people: row and column counted from 1. */
export const place = a => `${a.r + 1},${a.c + 1}`;

/**
 * @param {SVGSVGElement} svg
 * @param {ReturnType<import("./game.js").createGame>} game
 * @param {{ onChange: (bond: number, dir: 1 | -1) => void }} handlers
 */
export function createBoard(svg, game, { onChange }) {
  const { puzzle, atoms, bonds } = game;
  const xy = a => [PAD + a.c * CELL, PAD + a.r * CELL];
  svg.replaceChildren();
  svg.classList.remove("solved");
  const width = PAD * 2 + (puzzle.cols - 1) * CELL, height = PAD * 2 + (puzzle.rows - 1) * CELL;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", width * SCALE);
  svg.setAttribute("role", "group");
  svg.setAttribute("aria-label", `Board, ${puzzle.rows} by ${puzzle.cols}`);

  const cells = el("g", { "aria-hidden": "true" }, svg), edgesLayer = el("g", {}, svg), atomsLayer = el("g", {}, svg);
  for (let r = 0; r < puzzle.rows; r++)
    for (let c = 0; c < puzzle.cols; c++) el("circle", { class: "cell", cx: PAD + c * CELL, cy: PAD + r * CELL, r: 2.5 }, cells);

  const edgeEls = bonds.map((e, k) => {
    const g = el("g", { class: "edge", role: "button", tabindex: 0, "data-bond": k }, edgesLayer);
    const lines = el("g", {}, g);
    const [x1, y1] = xy(atoms[e.a]), [x2, y2] = xy(atoms[e.b]);
    el("rect", e.horizontal
      ? { class: "hit", x: x1, y: y1 - HIT / 2, width: x2 - x1, height: HIT }
      : { class: "hit", x: x1 - HIT / 2, y: y1, width: HIT, height: y2 - y1 }, g);
    g.addEventListener("click", () => onChange(k, +1));
    g.addEventListener("contextmenu", ev => { ev.preventDefault(); onChange(k, -1); });
    g.addEventListener("keydown", ev => {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onChange(k, +1); }
      else if (ev.key === "Backspace" || ev.key === "Delete" || ev.key === "-") { ev.preventDefault(); onChange(k, -1); }
    });
    return { g, lines };
  });

  const atomEls = atoms.map(a => {
    const E = ELEMENTS[a.el], [x, y] = xy(a);
    const g = el("g", { class: "atom", role: "img", transform: `translate(${x},${y})` }, atomsLayer);
    el("circle", { class: "body", r: E.r, fill: E.color, stroke: E.stroke }, g);
    el("circle", { class: "shine", r: E.r * .42, cx: -E.r * .32, cy: -E.r * .36 }, g);
    const t = el("text", { class: "sym", "text-anchor": "middle", "dominant-baseline": "central", fill: E.text, y: 1 }, g);
    t.textContent = a.el;
    const badge = el("g", { class: "badge", transform: `translate(${E.r * .78},${-E.r * .78})` }, g);
    el("circle", { r: 9 }, badge);
    const count = el("text", { "text-anchor": "middle", "dominant-baseline": "central", y: .5 }, badge);
    return { g, count };
  });

  function render() {
    const order = game.order;
    bonds.forEach((e, k) => {
      const A = atoms[e.a], B = atoms[e.b], [x1, y1] = xy(A), [x2, y2] = xy(B), o = order[k];
      const [nx, ny] = e.horizontal ? [0, 1] : [1, 0];
      const { g, lines } = edgeEls[k];
      lines.replaceChildren();
      if (!o) el("line", { class: "maybe", x1, y1, x2, y2 }, lines);
      for (const d of OFFSETS[o])
        el("line", { class: "vis", x1: x1 + nx * d, y1: y1 + ny * d, x2: x2 + nx * d, y2: y2 + ny * d }, lines);
      g.setAttribute("data-order", o);
      g.setAttribute("aria-label", `${A.el} ${place(A)} to ${B.el} ${place(B)}: ${ORDER_NAMES[o]}`);
    });
    atoms.forEach((a, i) => {
      const left = game.remaining(i), { g, count } = atomEls[i];
      g.classList.toggle("ok", left === 0);
      count.textContent = left;
      g.setAttribute("aria-label", `${ELEMENTS[a.el].name} ${place(a)}: ${left ? `needs ${left} more bond${left > 1 ? "s" : ""}` : "complete"}`);
    });
    svg.classList.toggle("solved", game.status().kind === "solved");
  }

  render();
  return { render };
}
