// The look of the page, in one place: its colours, its font and its corners,
// and how each Element's ball looks. style.css has no values of its own: it
// reads each of `page` as a CSS variable, `--<name>`, which applyTheme sets.
// For another look, change DARK, or write another theme and make it THEME.

/** The page's colours, font and corners, by the name of their CSS variable; and the Elements' balls, drawn in SVG. */
export type Theme = typeof DARK;

export const DARK = {
  page: {
    // the page and its boxes
    "bg": "#0e1320",
    "panel": "#161d2e",
    "panel-2": "#1d2639",
    "stage": "#111827",
    "line": "#2a3550",
    "text": "#e6ebf5",
    "muted": "#93a0bb",
    "accent": "#3ce0b4",
    "accent-2": "#7dd3ff",
    "button-hover": "#24304a",
    "primary": "#1f6f5c",
    // the status line, the Solved badge and the counts over the budget
    "good-line": "rgba(60,224,180,.6)",
    "good-text": "#b9f7e4",
    "warn": "#ffb347",
    "warn-line": "rgba(255,179,71,.5)",
    "warn-text": "#ffe0b3",
    "toast": "#2a3550",
    "toast-line": "#3d4b72",
    // the Board: its points, Dotted lines, Bonds and the shine on the balls
    "cell": "rgba(255,255,255,.09)",
    "dotted": "rgba(201,211,230,.22)",
    "dotted-hover": "rgba(125,211,255,.7)",
    "bond": "#c9d3e6",
    "bond-hover": "#fff",
    "focus-hit": "rgba(125,211,255,.14)",
    "hydrogen-line": "rgba(201,211,230,.55)",
    "shine": "#fff",
    "shine-opacity": ".22",
    // the font and the corners
    "font": 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    "radius": "10px",
    "radius-note": "12px",
    "radius-box": "16px",
    "radius-pill": "99px",
  },
  // Each Element's ball: its fill, its outline, the colour of its symbol and its radius.
  // H is also how the small hydrogens beside an Atom look.
  elements: {
    H:  { color: "#eef2f7", stroke: "#9aa6b8", text: "#2a2f38", r: 17 },
    C:  { color: "#454b55", stroke: "#1e2228", text: "#ffffff", r: 22 },
    N:  { color: "#3d6ef5", stroke: "#1f3f9e", text: "#ffffff", r: 22 },
    O:  { color: "#e5443f", stroke: "#8f201d", text: "#ffffff", r: 22 },
    S:  { color: "#ede04a", stroke: "#958a12", text: "#2a2f38", r: 22 },
    F:  { color: "#a8e07a", stroke: "#5c8f33", text: "#1d2a12", r: 22 },
    Cl: { color: "#3cb44b", stroke: "#1e6b27", text: "#0f2412", r: 22 },
    Br: { color: "#9e2a2b", stroke: "#561516", text: "#ffffff", r: 22 },
    I:  { color: "#7d3fa8", stroke: "#45205f", text: "#ffffff", r: 22 },
  },
};

/** The theme the game uses. */
export const THEME: Theme = DARK;

/** Sets the page's part of a theme as CSS variables on an element, the page's root. */
export function applyTheme(root: HTMLElement, theme: Theme = THEME): void {
  for (const [name, value] of Object.entries(theme.page)) root.style.setProperty(`--${name}`, value);
}
