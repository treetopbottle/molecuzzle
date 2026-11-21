// Judging colours by hue and lightness, for the unit and end-to-end tests.
// Colours are [r, g, b], each 0–255.

/** A colour written "#rrggbb" as [r, g, b]. */
export const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

/** The hue of an [r, g, b] colour in degrees, or null for one that is (nearly) grey. */
export function hue([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d < 25) return null;
  const h = max === r ? (g - b) / d : max === g ? 2 + (b - r) / d : 4 + (r - g) / d;
  return (h * 60 + 360) % 360;
}

/** How light an [r, g, b] colour is, from 0 (black) to 1 (white), as in HSL. */
export const lightness = c => (Math.max(...c) + Math.min(...c)) / 2 / 255;

/** A test for colours whose hue is from one angle to another, going round past 360 if `from` is the larger. */
export const inHue = (from, to) => c => {
  const h = hue(c);
  return h !== null && (from <= to ? h >= from && h <= to : h >= from || h <= to);
};
export const isGreen = inHue(90, 180);
export const isOrange = inHue(15, 50);
