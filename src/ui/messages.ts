// @ts-nocheck
// The texts for the Player: the status line for each status, and why a Bond
// wasn't made.
/** @import { PuzzleInfo, SayResult, Status } from "./api.ts" */

/**
 * The status line for the Board's status.
 * @param {Status} status
 * @param {Pick<PuzzleInfo, "name">} puzzle
 * @returns {string}
 */
export function statusText(status, puzzle) {
  switch (status.kind) {
    case "empty": return "Click a dotted line between two atoms to bond them.";
    case "open": return "Not every atom has the right number of bonds yet.";
    case "pieces": return "Every atom has its bonds, but they form more than one molecule. Everything must join up.";
    case "solved": return `✓ Solved! It's ${puzzle.name}.`;
    case "revealed": return `Here is ${puzzle.name}. Reset and build it yourself to mark it solved.`;
  }
}

/**
 * Why a change made no Bond, or null if there is no reason to give.
 * @param {SayResult} result
 * @returns {string | null}
 */
export function reasonText(result) {
  switch (result.reason) {
    case "crossing": return "Bonds can't cross.";
    default: return null;
  }
}
