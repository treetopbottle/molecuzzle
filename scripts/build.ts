// Builds dist/index.html: src/ui/index.html with src/ui/style.css and the
// JavaScript bundled from src/browser.ts inlined, so the game is one file
// that opens from disk.
import { build } from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const root = new URL("..", import.meta.url);
const src = (path: string) => new URL(`src/${path}`, root);

const [html, css, js] = await Promise.all([
  readFile(src("ui/index.html"), "utf8"),
  readFile(src("ui/style.css"), "utf8"),
  build({ entryPoints: [src("browser.ts").pathname], bundle: true, format: "iife", write: false, target: "es2020" })
    .then(r => r.outputFiles[0].text),
]);

const replace = (text: string, find: string, by: string): string => {
  if (!text.includes(find)) throw new Error(`build: ${find} not found in src/ui/index.html`);
  return text.replace(find, () => by);
};
let out = replace(html, '<link rel="stylesheet" href="style.css">', `<style>\n${css}</style>`);
out = replace(out, '<script type="module" src="browser.ts"></script>', `<script>\n${js.replaceAll("</script", "<\\/script")}</script>`);

await mkdir(new URL("dist/", root), { recursive: true });
await writeFile(new URL("dist/index.html", root), out);
console.log(`dist/index.html: ${(out.length / 1024).toFixed(1)} kB`);
