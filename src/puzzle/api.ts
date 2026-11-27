// The Puzzle's interface: what it offers the Glue (decision 0028). It needs
// nothing from the others.

/** The symbols of the Elements in ELEMENTS. */
export type ElementSymbol = "H" | "C" | "N" | "O" | "S" | "F" | "Cl" | "Br" | "I";

/** The Bonds of a Puzzle as [atom, atom, order], by first Atom, then second. */
export type Board = [number, number, 1 | 2 | 3][];

/** A Puzzle, as puzzle.schema.json says: its Atoms are [symbol, row, column, hydrogens], in reading order. */
export interface Puzzle {
  id: string;
  name: string;
  formula: string;
  fact: string;
  rows: number;
  cols: number;
  atoms: [Exclude<ElementSymbol, "H">, number, number, number][];
  solution: Board;
}

/** Where a Puzzle was left: its Board, whether its solution was shown, and the Boards to undo, oldest first. */
export interface Saved {
  bonds: Board;
  revealed: boolean;
  undo: Board[];
}

/** An Atom of a game: its symbol, row, column and hydrogens. */
export interface Atom {
  el: Exclude<ElementSymbol, "H">;
  r: number;
  c: number;
  h: number;
}

/** A Dotted line: from Atom a to the nearest Atom b to its right (horizontal) or below. */
export interface Candidate {
  a: number;
  b: number;
  horizontal: boolean;
}

/** A Board's status; open has the Atoms with too few and with too many Bonds. */
export type Status =
  | { kind: "empty" }
  | { kind: "open"; few: number; many: number }
  | { kind: "pieces" }
  | { kind: "solved" }
  | { kind: "revealed" };

/** What a change did, and why a Bond couldn't be made. */
export interface ChangeResult {
  changed: boolean;
  reason?: "crossing";
}

/** The Bonds used, the budget, and the Atoms with too few and with too many Bonds. */
export interface Counts {
  used: number;
  budget: number;
  few: number;
  many: number;
}

/** A Puzzle being played. */
export interface Game {
  puzzle: Puzzle;
  atoms: Atom[];
  /** The Dotted lines, the candidate Bonds. */
  bonds: Candidate[];
  /** Each candidate Bond's order, 0 for none. */
  readonly order: number[];
  readonly canUndo: boolean;
  /** What Atom i still needs: below 0 when it has too many Bonds. */
  remaining(i: number): number;
  budget: number;
  counts(): Counts;
  status(): Status;
  done(): boolean;
  change(k: number, dir: 1 | -1): ChangeResult;
  undo(): boolean;
  reset(): boolean;
  showSolution(): void;
  board(): Board;
  /** Null with no Bonds and nothing to undo. */
  saved(): Saved | null;
}

/** A game of a Puzzle, with no Bonds or where it was left. */
export type CreateGame = (puzzle: Puzzle, saved?: Partial<Saved>) => Game;

export { PUZZLES } from "./puzzles.ts";
export { createGame } from "./game.ts";
export { ELEMENTS } from "./elements.ts";
export { difficulty } from "./difficulty.ts";
