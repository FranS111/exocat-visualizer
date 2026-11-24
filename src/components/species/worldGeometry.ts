import type { WorldGeometry } from './originMapGeometry';

export type { WorldGeometry };

let promise: Promise<WorldGeometry> | null = null;

/** Lazily loads (once) the world outline + projection shared by every origin map. */
export const loadWorldGeometry = () => (promise ??= import('./originMapGeometry').then((mod) => mod.buildWorldGeometry()));

/** Curved route from the native range to Catalonia (quadratic Bézier, bowed upwards). */
export function routePath([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${(my - dist * 0.35).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}
