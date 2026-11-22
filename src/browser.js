// The entry point: the only file that uses the browser's globals. Makes the
// dependencies and starts the app.
import { startApp } from "./app.js";
import { PUZZLES } from "./puzzle/puzzles.js";
import { createGame } from "./puzzle/game.js";
import { ELEMENTS } from "./puzzle/elements.js";
import { createProgressStore } from "./storage/progress.js";
import { createUi } from "./ui/ui.js";

// The Elements of the key in the panel, in its order: each with the number of Bonds it needs.
const KEY = ["C", "N", "O", "S", "F", "Cl", "Br", "I"].map(symbol => ({ symbol, valence: ELEMENTS[symbol].valence }));

let storage;
try { storage = window.localStorage; } catch { /* blocked: play without saving */ }
startApp({ puzzles: PUZZLES, createGame, store: createProgressStore(storage), createUi: handlers => createUi(document, handlers, { elements: KEY }) });
