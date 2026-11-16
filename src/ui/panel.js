// The panel: the open Puzzle between ‹ and ›, whether it is solved, the
// mystery molecule or its name, formula and fact, and the rules. ‹, › and
// "Next puzzle →" carry data-open, the index of the Puzzle they open: whoever
// owns the page listens for clicks on them.

const RULES = [
  "Bonds run straight along a row or column, between atoms with nothing in between. The dotted lines show where they can go.",
  "Click a dotted line to bond. Click again for a double, then a triple bond; once more removes it. Right-click lowers it.",
  "Bonds can't cross.",
  "Each atom needs exactly its number of bonds (orange badge): H 1, O 2, N 3, C 4.",
  "All atoms join into one molecule. There is exactly one solution.",
];

const BADGES = { solved: "✓ Solved" };

function build(panel) {
  const doc = panel.ownerDocument;
  panel.innerHTML = `
    <nav class="puzzle-nav" aria-label="Puzzle">
      <button id="prev" aria-label="Previous puzzle">‹</button>
      <span id="counter"></span>
      <button id="next" aria-label="Next puzzle">›</button>
      <span id="badge" class="badge"></span>
    </nav>
    <div>
      <div class="eyebrow">Mystery molecule</div>
      <h1 id="title"></h1>
      <div id="formula" class="legend"></div>
    </div>
    <p id="fact" class="legend" hidden></p>
    <button id="nextPuzzle" class="primary" hidden>Next puzzle →</button>
    <ol class="rules"></ol>`;
  panel.querySelector(".rules").append(...RULES.map(rule => {
    const li = doc.createElement("li");
    li.textContent = rule;
    return li;
  }));
}

/**
 * Fills the panel, the first time from nothing, after that in place, so a
 * focused button keeps its focus.
 * @param {HTMLElement} panel
 * @param {{ puzzles: {id:string,name:string,formula:string,fact:string}[], index: number,
 *   progress: {puzzles: Record<string,string>}, done: boolean }} view
 */
export function renderPanel(panel, { puzzles, index, progress, done }) {
  if (!panel.querySelector("nav")) build(panel);
  const $ = id => panel.querySelector(`#${id}`);
  const puzzle = puzzles[index], last = index === puzzles.length - 1;
  const opens = (button, i, can) => { button.disabled = !can; button.dataset.open = String(i); };

  $("counter").textContent = `Puzzle ${index + 1} of ${puzzles.length}`;
  opens($("prev"), index - 1, index > 0);
  opens($("next"), index + 1, !last);
  const state = progress.puzzles[puzzle.id];
  $("badge").textContent = BADGES[state] ?? "Unsolved";
  $("badge").className = `badge ${state ?? ""}`;

  $("title").textContent = done ? puzzle.name : "?";
  if (done) $("formula").replaceChildren(...formulaNodes(panel.ownerDocument, puzzle.formula));
  else $("formula").textContent = "Bond every atom to find out what it is.";
  $("fact").textContent = puzzle.fact;
  $("fact").hidden = !done;
  opens($("nextPuzzle"), index + 1, !last);
  $("nextPuzzle").hidden = !done || last;
}

/** Formula with its numbers as subscripts, as DOM nodes. */
export function formulaNodes(doc, formula) {
  return formula.split(/(\d+)/).filter(Boolean).map(part => {
    if (!/^\d+$/.test(part)) return doc.createTextNode(part);
    const sub = doc.createElement("sub");
    sub.textContent = part;
    return sub;
  });
}
