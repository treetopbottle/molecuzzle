// The UI's interface: what it offers the Glue, and what it needs from the
// others, in its own terms (decision 0028).
import type { ELEMENTS } from "./elements.ts";

/** An Element the UI has a look for. */
export type LookSymbol = keyof typeof ELEMENTS;

/** A Board's status, as the UI words it. */
export interface Status {
  kind: "empty" | "open" | "pieces" | "solved" | "revealed";
}

/** What the Board draws of a game: its Grid, its Atoms, its Dotted lines and their orders, and whether it is solved. */
export interface BoardModel {
  puzzle: { rows: number; cols: number };
  atoms: { el: LookSymbol; r: number; c: number; h: number }[];
  bonds: { a: number; b: number; horizontal: boolean }[];
  /** Each Dotted line's Bond order, 0 for none. */
  readonly order: number[];
  status(): Status;
}

/** What a change of a Bond did: the reason it made no Bond, if there is one to tell. */
export interface SayResult {
  reason?: "crossing";
}

/** What the UI shows of a Puzzle. */
export interface PuzzleInfo {
  id: string;
  name: string;
  formula: string;
  fact: string;
}

/** Which Puzzles are solved, by id. */
export interface ProgressView {
  puzzles: Record<string, string>;
}

/** The Bonds used, and the budget. */
export interface Counts {
  used: number;
  budget: number;
}

/** An Element of the key in the panel, with the number of Bonds it needs. */
export interface KeyElement {
  symbol: LookSymbol;
  valence: number;
}

/**
 * What the Player does. onReset and onSolve come only after the Player
 * confirms. Properties, not methods, so tsc checks the handlers given by
 * what the UI passes them.
 */
export interface Handlers {
  onChange: (k: number, dir: 1 | -1) => void;
  onOpen: (index: number) => void;
  onUndo: () => void;
  onReset: () => void;
  onSolve: () => void;
}

/** What to show, beside the Board. */
export interface View {
  puzzles: PuzzleInfo[];
  index: number;
  progress: ProgressView;
  status: Status;
  counts: Counts;
  difficulty: number;
  done: boolean;
  canUndo: boolean;
  hasBonds: boolean;
}

/** The page: open shows a game's Board, render what to show, say why a change made no Bond. */
export interface Ui {
  open(model: BoardModel): void;
  render(view: View): void;
  say(result: SayResult): void;
}

/** confirm asks the Player; elements is the key of the panel, in its order. */
export interface UiOptions {
  confirm?: (question: string) => boolean;
  elements?: KeyElement[];
}

export { createUi } from "./ui.ts";
