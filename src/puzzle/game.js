// The state of one puzzle being played: Bond orders, undo history, and what
// the status line says. No DOM.
import { ELEMENTS, MAX_ORDER } from "./elements.js";
import { candidateBonds, crosses, connected } from "./grid.js";

export const UNDO_LIMIT = 300;

export function createGame(puzzle) {
  const atoms = puzzle.atoms.map(([el, r, c]) => ({ el, r, c }));
  const bonds = candidateBonds(atoms);
  let order = bonds.map(() => 0);
  let history = [];
  let revealed = false; // the solution was shown, and the Board wasn't emptied since

  const bondCount = i => bonds.reduce((t, e, k) => t + (e.a === i || e.b === i ? order[k] : 0), 0);
  const remaining = i => ELEMENTS[atoms[i].el].valence - bondCount(i);

  function status() {
    const open = atoms.filter((_, i) => remaining(i) > 0).length;
    if (!order.some(Boolean)) return { kind: "empty" };
    if (open) return { kind: "open", open };
    if (!connected(atoms.length, bonds, order)) return { kind: "pieces" };
    return { kind: revealed ? "revealed" : "solved" };
  }
  const done = () => ["solved", "revealed"].includes(status().kind);

  function commit(next) {
    history.push(order);
    if (history.length > UNDO_LIMIT) history.shift();
    order = next;
    if (!order.some(Boolean)) revealed = false;
  }

  /**
   * Makes candidate Bond k one stronger (dir +1) or weaker (dir -1).
   * Stronger past a triple Bond, or past what either Atom has room for,
   * removes it. Returns a message when nothing changed and the Player
   * should be told why.
   */
  function change(k, dir) {
    if (done()) return { changed: false };
    const e = bonds[k], cur = order[k];
    let next = cur + dir;
    if (dir > 0 && cur === 0) {
      const full = [e.a, e.b].find(i => remaining(i) === 0);
      if (full !== undefined) return { changed: false, message: `${ELEMENTS[atoms[full].el].name} already has all its bonds.` };
    }
    if (dir > 0 && (next > MAX_ORDER || next - cur > Math.min(remaining(e.a), remaining(e.b)))) next = 0;
    if (next < 0 || next === cur) return { changed: false };
    if (cur === 0 && bonds.some((f, j) => order[j] && crosses(atoms, e, f)))
      return { changed: false, message: "Bonds can't cross." };
    const copy = [...order];
    copy[k] = next;
    commit(copy);
    return { changed: true };
  }

  function undo() {
    if (!history.length) return false;
    order = history.pop();
    if (!order.some(Boolean)) revealed = false;
    return true;
  }

  function reset() {
    if (!order.some(Boolean)) return false;
    commit(bonds.map(() => 0));
    return true;
  }

  function showSolution() {
    const next = bonds.map(e => {
      const s = puzzle.solution.find(([a, b]) => (a === e.a && b === e.b) || (a === e.b && b === e.a));
      return s ? s[2] : 0;
    });
    if (!done()) revealed = true;
    if (next.some((o, k) => o !== order[k])) commit(next);
  }

  return {
    puzzle, atoms, bonds,
    get order() { return [...order]; },
    get canUndo() { return history.length > 0; },
    remaining, status, done, change, undo, reset, showSolution,
  };
}

/** The status line for a status from game.status(). */
export function statusText(status, puzzle) {
  switch (status.kind) {
    case "empty": return "Click a dotted line between two atoms to bond them.";
    case "open": return `${status.open} atom${status.open > 1 ? "s" : ""} still need${status.open > 1 ? "" : "s"} bonds.`;
    case "pieces": return "Every atom has its bonds, but they form more than one molecule. Everything must join up.";
    case "solved": return `✓ Solved! It's ${puzzle.name}.`;
    case "revealed": return `Here is ${puzzle.name}. Reset and build it yourself to mark it solved.`;
  }
}
