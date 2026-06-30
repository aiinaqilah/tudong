function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;

  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
    case g: h = (b - r) / d + 2; break;
    default: h = (r - g) / d + 4; break;
  }
  h *= 60;

  return { h, s: s * 100, l: l * 100 };
}

export type ColorFamily =
  | "Black" | "White" | "Gray" | "Brown"
  | "Red" | "Orange" | "Yellow" | "Green" | "Teal"
  | "Blue" | "Purple" | "Pink";

// Heuristic grouping by hue range — not colorimetrically exact, just enough
// to cluster visually similar shades for recommendations.
export function getColorFamily(hex: string): ColorFamily {
  const { h, s, l } = hexToHsl(hex);

  if (s < 12) {
    if (l < 20) return "Black";
    if (l > 85) return "White";
    return "Gray";
  }

  // Warm, desaturated, mid/low lightness reads as brown regardless of exact hue
  if ((h <= 50 || h >= 345) && l < 65 && s < 70) return "Brown";

  if (h < 15 || h >= 345) return "Red";
  if (h < 40) return "Orange";
  if (h < 65) return "Yellow";
  if (h < 170) return "Green";
  if (h < 200) return "Teal";
  if (h < 255) return "Blue";
  if (h < 290) return "Purple";
  if (h < 345) return l < 35 ? "Purple" : "Pink";
  return "Red";
}
