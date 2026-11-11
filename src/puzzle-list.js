// The list of puzzles: one button per puzzle, with its state.

const STATE_TEXT = { solved: "solved", revealed: "solution seen" };
const MARK = { solved: "✓", revealed: "👁" };

/**
 * @param {HTMLOListElement} list
 * @param {{id:string,name:string}[]} puzzles
 * @param {{puzzles: Record<string,string>}} progress
 * @param {number} current index of the open puzzle
 * @param {(index: number) => void} onPick
 */
export function renderPuzzleList(list, puzzles, progress, current, onPick) {
  const doc = list.ownerDocument;
  list.replaceChildren(...puzzles.map((p, i) => {
    const state = progress.puzzles[p.id];
    const li = doc.createElement("li");
    const button = doc.createElement("button");
    button.type = "button";
    button.textContent = `${i + 1}${state ? ` ${MARK[state]}` : ""}`;
    button.setAttribute("aria-label", `Puzzle ${i + 1}${state ? `: ${p.name}, ${STATE_TEXT[state]}` : ""}`);
    if (state) button.title = p.name;
    if (i === current) button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => onPick(i));
    li.append(button);
    return li;
  }));
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
