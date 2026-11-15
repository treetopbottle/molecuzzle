import { startApp } from "./app.js";

let storage;
try { storage = window.localStorage; } catch { /* blocked: play without saving */ }
startApp(document, { storage });
