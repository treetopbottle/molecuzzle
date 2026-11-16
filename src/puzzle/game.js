// The state of one puzzle being played: Bond orders, undo history and its
// status. No DOM, and no text for the Player: the UI words the statuses and
// reasons.
import { ELEMENTS, MAX_ORDER } from "./elements.js";
import { candidateBonds, crosses, connected } from "./grid.js";

export const UNDO_LIMIT = 100;

/**
 * A Puzzle being played. It starts with no Bonds, or where it was left:
 * { bonds, revealed, undo } as saved() gave them. If that Board, or one in
 * its history, can't be on the Grid, it starts with no Bonds, nothing to
 * undo and the solution not shown.
 */
export function createGame(puzzle, { bonds: left, revealed: shown = false, undo: past = [] } = {}) {
  const atoms = puzzle.atoms.map(([el, r, c]) => ({ el, r, c }));
  const bonds = candidateBonds(atoms);
  const empty = () => bonds.map(() => 0);

  const bondCount = (i, o) => bonds.reduce((t, e, k) => t + (e.a === i || e.b === i ? o[k] : 0), 0);

  /** A Board as Bond orders per candidate Bond, or null if it can't be on the Grid. */
  function orders(board) {
    if (!Array.isArray(board)) return null;
    const o = empty();
    for (const bond of board) {
      const [a, b, n] = Array.isArray(bond) ? bond : [];
      const k = bonds.findIndex(e => e.a === a && e.b === b);
      if (k < 0 || o[k] || !Number.isInteger(n) || n < 1 || n > MAX_ORDER) return null;
      o[k] = n;
    }
    if (atoms.some((atom, i) => bondCount(i, o) > ELEMENTS[atom.el].valence)) return null;
    if (o.some((n, k) => n && o.some((m, j) => m && crosses(atoms, bonds[k], bonds[j])))) return null;
    return o;
  }

  let order = empty();
  let history = [];
  let revealed = false; // the solution was shown, and the Board wasn't emptied since
  if (left !== undefined) {
    const now = orders(left), before = Array.isArray(past) ? past.map(orders) : [null];
    if (now && !before.includes(null)) {
      order = now;
      history = before.slice(-UNDO_LIMIT);
      revealed = shown === true && order.some(Boolean);
    }
  }

  const remaining = i => ELEMENTS[atoms[i].el].valence - bondCount(i, order);

  function status() {
    const open = atoms.filter((_, i) => remaining(i) > 0).length;
    if (!order.some(Boolean)) return { kind: "empty" };
    if (open) return { kind: "open", open };
    if (!connected(atoms.length, bonds, order)) return { kind: "pieces" };
    return { kind: revealed ? "revealed" : "solved" };
  }
  const done = () => ["solved", "revealed"].includes(status().kind);
  if (status().kind === "solved") history = []; // a solved Board, as it was left, has nothing to undo

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
    if (status().kind === "solved") history = [];
    return { changed: true };
  }

  function undo() {
    if (!history.length) return false;
    order = history.pop();
    if (!order.some(Boolean)) revealed = false;
    return true;
  }

  /** Removes every Bond and the undo history; with neither, does nothing. */
  function reset() {
    if (!order.some(Boolean) && !history.length) return false;
    order = empty();
    history = [];
    revealed = false;
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

  /**
   * The Bonds as a Board: [atom, atom, order]. The candidate Bonds are
   * already by first Atom, then second, since the Atoms are in reading order.
   */
  const toBoard = o => bonds.flatMap((e, k) => (o[k] ? [[e.a, e.b, o[k]]] : []));
  const board = () => toBoard(order);

  /**
   * Where the Puzzle was left, for createGame: { bonds, revealed, undo }, the
   * undo history oldest first. Null unless it is in progress: with Bonds or
   * something to undo, and not solved.
   */
  function saved() {
    if ((!order.some(Boolean) && !history.length) || status().kind === "solved") return null;
    return { bonds: board(), revealed, undo: history.map(toBoard) };
  }

  return {
    puzzle, atoms, bonds,
    get order() { return [...order]; },
    get canUndo() { return history.length > 0; },
    remaining, status, done, change, undo, reset, showSolution, board, saved,
  };
}
