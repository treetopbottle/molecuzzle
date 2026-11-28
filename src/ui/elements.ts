// How each Element looks: its name, and from the theme the colours of its
// ball and its size. H is also how the small hydrogens beside an Atom look.
import { THEME } from "./theme.ts";

const { elements: look } = THEME;
export const ELEMENTS = {
  H:  { name: "Hydrogen", ...look.H },
  C:  { name: "Carbon",   ...look.C },
  N:  { name: "Nitrogen", ...look.N },
  O:  { name: "Oxygen",   ...look.O },
  S:  { name: "Sulfur",   ...look.S },
  F:  { name: "Fluorine", ...look.F },
  Cl: { name: "Chlorine", ...look.Cl },
  Br: { name: "Bromine",  ...look.Br },
  I:  { name: "Iodine",   ...look.I },
} satisfies Record<keyof typeof look, { name: string; color: string; stroke: string; text: string; r: number }>;
