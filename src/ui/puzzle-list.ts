// The list of puzzles: one button per puzzle, with ✓ if solved.
import type { ProgressView, PuzzleInfo } from "./api.ts";

/** current is the index of the open puzzle. */
export function renderPuzzleList(list: HTMLOListElement, puzzles: Pick<PuzzleInfo, "id" | "name">[], progress: ProgressView,
  current: number, onPick: (index: number) => void): void {
  const doc = list.ownerDocument;
  list.replaceChildren(...puzzles.map((p, i) => {
    const solved = progress.puzzles[p.id] === "solved";
    const li = doc.createElement("li");
    const button = doc.createElement("button");
    button.type = "button";
    button.textContent = `${i + 1}${solved ? " ✓" : ""}`;
    button.setAttribute("aria-label", `Puzzle ${i + 1}${solved ? `: ${p.name}, solved` : ""}`);
    if (solved) button.title = p.name;
    if (i === current) button.setAttribute("aria-current", "true");
    button.addEventListener("click", () => onPick(i));
    li.append(button);
    return li;
  }));
}
