// The texts for the Player: the status line for each status, and why a Bond
// wasn't made.
import { ELEMENTS } from "./elements.js";

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

/** Why a Bond wasn't made, for a result of game.change(), or null if there is no reason to give. */
export function reasonText(result, atoms) {
  switch (result.reason) {
    case "full": return `${ELEMENTS[atoms[result.atom].el].name} already has all its bonds.`;
    case "crossing": return "Bonds can't cross.";
    default: return null;
  }
}
