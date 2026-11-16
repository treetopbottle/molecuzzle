// The state of one puzzle being played: Bond orders, undo history and its
// status. No DOM, and no text for the Player: the UI words the statuses and
// reasons.
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
   * removes it. When a Bond can't be made, the reason is "full", with the
   * Atom that has no room, or "crossing"; other changes that change nothing
   * have no reason.
   */
  function change(k, dir) {
    if (done()) return { changed: false };
    const e = bonds[k], cur = order[k];
    let next = cur + dir;
    if (dir > 0 && cur === 0) {
      const full = [e.a, e.b].find(i => remaining(i) === 0);
      if (full !== undefined) return { changed: false, reason: "full", atom: full };
    }
    if (dir > 0 && (next > MAX_ORDER || next - cur > Math.min(remaining(e.a), remaining(e.b)))) next = 0;
    if (next < 0 || next === cur) return { changed: false };
    if (cur === 0 && bonds.some((f, j) => order[j] && crosses(atoms, e, f)))
      return { changed: false, reason: "crossing" };
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
