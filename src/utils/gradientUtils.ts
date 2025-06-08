
/**
 * Helper function to convert hex color to rgb for gradients
 */
export function hexToRgb(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Function for smooth color interpolation
 */
export function interpolateColors(color1: string, color2: string, factor: number): string {
  // Convert hex to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  // Enhanced interpolation with improved smoothness
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Enhanced color palettes for 2025 modern design
export const gradientColorPalettes = [
  ['#0f172a', '#1e293b', '#334155', '#475569'], // Slate shades
  ['#1e1b4b', '#312e81', '#4338ca', '#6366f1'], // Indigo shades
  ['#581c87', '#7e22ce', '#a855f7', '#d8b4fe'], // Purple shades
  ['#134e4a', '#115e59', '#14b8a6', '#5eead4'], // Teal shades - new palette
  ['#3f1d2b', '#9a3412', '#c2410c', '#fb923c']  // Amber shades - new palette
];
