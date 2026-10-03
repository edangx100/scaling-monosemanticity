// Isometric projection.
//
// World axes: x runs to the lower right, y to the lower left, z straight up.
// True isometric (30°): a world unit along x or y covers cos30 across and
// 0.5 down; a unit of z covers 1 up. Scale is applied by the camera.
//
// Colours are CSS custom properties, so scenes follow light/dark mode with no
// JS. Box faces are shaded with color-mix() (one light, upper left).

export const C30 = Math.cos(Math.PI / 6);
export const S30 = 0.5;

/** World point → screen point (before camera scale). */
export function project(x, y, z = 0) {
  return [(x - y) * C30, (x + y) * S30 - z];
}

/** CSS fill for a colour token, darkened for the left or right face. */
export function faceFill(token, face) {
  const base = `var(--${token})`;
  if (face === 'left') return `color-mix(in oklab, ${base} 80%, #000)`;
  if (face === 'right') return `color-mix(in oklab, ${base} 62%, #000)`;
  return base;
}

export const col = token => `var(--${token})`;
