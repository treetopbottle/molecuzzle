// The entry point: the only file that uses the browser's globals. Makes the
// dependencies and starts the app.
import { startApp } from "./app.ts";
import { PUZZLES } from "./puzzle/puzzles.js";
import { createGame } from "./puzzle/game.js";
import { ELEMENTS } from "./puzzle/elements.js";
import { createProgressStore } from "./storage/api.ts";
import { createUi } from "./ui/ui.js";

// The Elements of the key in the panel, in its order: each with the number of Bonds it needs.
const KEY = (["C", "N", "O", "S"] as const).map(symbol => ({ symbol, valence: ELEMENTS[symbol].valence }));

let storage: Storage | undefined;
try { storage = window.localStorage; } catch { /* blocked: play without saving */ }
startApp({ puzzles: PUZZLES, createGame, store: createProgressStore(storage), createUi: handlers => createUi(document, handlers, { elements: KEY }) });
