// The Glue: the only file that uses the browser's globals. Makes the
// dependencies and starts the app.
import { startApp } from "./app.js";
import { PUZZLES } from "./puzzle/puzzles.js";
import { createGame } from "./puzzle/game.js";
import { createProgressStore } from "./storage/progress.js";
import { createUi } from "./ui/ui.js";

let storage;
try { storage = window.localStorage; } catch { /* blocked: play without saving */ }
startApp({ puzzles: PUZZLES, createGame, store: createProgressStore(storage), createUi: handlers => createUi(document, handlers) });
