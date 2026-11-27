// The state of one puzzle being played: Bond orders, undo history and its
// status. No DOM, and no text for the Player: the UI words the statuses and
// reasons.
import type { Board, ChangeResult, Counts, Game, Puzzle, Saved, Status } from "./api.ts";
import { ELEMENTS, MAX_ORDER } from "./elements.ts";
import { candidateBonds, crosses, connected } from "./grid.ts";

export const UNDO_LIMIT = 100;

/**
 * A Puzzle being played. It starts with no Bonds, or where it was left:
 * { bonds, revealed, undo } as saved() gave them. If that Board, or one in
 * its history, can't be on the Grid, it starts with no Bonds, nothing to
 * undo and the solution not shown. A solved Board starts with nothing to
 * undo, since solving ends the undo history.
 */
export function createGame(puzzle: Puzzle, { bonds: left, revealed: shown = false, undo: past = [] }: Partial<Saved> = {}): Game {
  // An Atom's hydrogens are bonded from the start (Puzzle.07).
  const atoms = puzzle.atoms.map(([el, r, c, h]) => ({ el, r, c, h }));
  /** The Bonds an Atom takes from other Atoms: its valence minus its hydrogens. */
  const room = (i: number) => ELEMENTS[atoms[i].el].valence - atoms[i].h;
  const bonds = candidateBonds(atoms);
  const empty = () => bonds.map(() => 0);

  const bondCount = (i: number, o: number[]) => bonds.reduce((t, e, k) => t + (e.a === i || e.b === i ? o[k] : 0), 0);

  /**
   * A Board as Bond orders per candidate Bond, or null if it can't be on the
   * Grid: a Bond on no Dotted line, a pair bonded twice, or Bonds that cross.
   * Its shape was checked by whoever stored it.
   */
  function orders(board: Board): number[] | null {
    const o = empty();
    for (const [a, b, n] of board) {
      const k = bonds.findIndex(e => e.a === a && e.b === b);
      if (k < 0 || o[k]) return null;
      o[k] = n;
    }
    if (o.some((n, k) => n && o.some((m, j) => m && crosses(atoms, bonds[k], bonds[j])))) return null;
    return o;
  }

  let order = empty();
  let history: number[][] = [];
  let revealed = false; // the solution was shown, and the Board wasn't emptied since
  if (left !== undefined) {
    const now = orders(left), before = past.map(orders);
    const valid = before.filter(o => o !== null);
    if (now && valid.length === before.length) {
      order = now;
      history = valid.slice(-UNDO_LIMIT);
      revealed = shown === true && order.some(Boolean);
    }
  }

  /** What an Atom still needs: below 0 when it has too many Bonds. */
  const remaining = (i: number) => room(i) - bondCount(i, order);
  // The Bonds of the solution: half of what the Atoms need together (Puzzle.09).
  const budget = atoms.reduce((t, _, i) => t + room(i), 0) / 2;

  /** The Bonds used, the budget, and the Atoms with too few and with too many Bonds (Valence.03). */
  const counts = (): Counts => ({
    used: order.reduce((t, n) => t + n, 0), budget,
    few: atoms.filter((_, i) => remaining(i) > 0).length,
    many: atoms.filter((_, i) => remaining(i) < 0).length,
  });

  function status(): Status {
    const { few, many } = counts();
    if (!order.some(Boolean)) return { kind: "empty" };
    if (few || many) return { kind: "open", few, many };
    if (!connected(atoms.length, bonds, order)) return { kind: "pieces" };
    return { kind: revealed ? "revealed" : "solved" };
  }
  const done = () => ["solved", "revealed"].includes(status().kind);
  if (status().kind === "solved") history = []; // Undo goes back only to the last solve (Bond.08, Bond.10)

  function commit(next: number[]): void {
    history.push(order);
    if (history.length > UNDO_LIMIT) history.shift();
    order = next;
    if (!order.some(Boolean)) revealed = false;
  }

  /**
   * Makes candidate Bond k one stronger (dir +1) or weaker (dir -1). Stronger
   * past a triple Bond removes it, whatever its Atoms have. When a Bond can't
   * be made, the reason is "crossing"; other changes that change nothing have
   * no reason.
   */
  function change(k: number, dir: 1 | -1): ChangeResult {
    if (done()) return { changed: false };
    const e = bonds[k], cur = order[k];
    let next = cur + dir;
    if (dir > 0 && next > MAX_ORDER) next = 0;
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
    const before = history.pop();
    if (!before) return false;
    order = before;
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
  const toBoard = (o: number[]): Board => bonds.flatMap((e, k): Board => {
    const n = o[k];
    return n === 1 || n === 2 || n === 3 ? [[e.a, e.b, n]] : [];
  });
  const board = () => toBoard(order);

  /**
   * Where the Puzzle was left, for createGame: { bonds, revealed, undo }, the
   * undo history oldest first, also when it is solved. Null with no Bonds and
   * nothing to undo.
   */
  function saved(): Saved | null {
    if (!order.some(Boolean) && !history.length) return null;
    return { bonds: board(), revealed, undo: history.map(toBoard) };
  }

  return {
    puzzle, atoms, bonds,
    get order() { return [...order]; },
    get canUndo() { return history.length > 0; },
    remaining, budget, counts, status, done, change, undo, reset, showSolution, board, saved,
  };
}
