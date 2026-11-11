// Builds dist/index.html: src/index.html with the CSS and the bundled
// JavaScript inlined, so the game is one file that opens from disk.
import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const src = path => new URL(`src/${path}`, root);

const [html, css, js] = await Promise.all([
  readFile(src("index.html"), "utf8"),
  readFile(src("style.css"), "utf8"),
  build({ entryPoints: [src("main.js").pathname], bundle: true, format: "iife", write: false, target: "es2020" })
    .then(r => r.outputFiles[0].text),
]);

const replace = (text, find, by) => {
  if (!text.includes(find)) throw new Error(`build: ${find} not found in src/index.html`);
  return text.replace(find, () => by);
};
let out = replace(html, '<link rel="stylesheet" href="style.css">', `<style>\n${css}</style>`);
out = replace(out, '<script type="module" src="main.js"></script>', `<script>\n${js.replaceAll("</script", "<\\/script")}</script>`);

await mkdir(new URL("dist/", root), { recursive: true });
await writeFile(new URL("dist/index.html", root), out);
console.log(`dist/index.html: ${(out.length / 1024).toFixed(1)} kB`);
