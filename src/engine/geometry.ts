export type Vec3 = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const RADIUS = 1.05;

export interface RingSpec {
  r: number;
  width: number;
  rot0: number;
  spin: number;
  tumble: number;
  phase: number;
  ticks: number;
  dash: number[];
}

/** Armillary rings, ported from the mockup's ARM. */
export const RINGS: RingSpec[] = [
  { r: 1, width: 2.2, rot0: 0.2, spin: 0.02, tumble: 0.25, phase: 0, ticks: 36, dash: [70, 12, 6, 22] },
  { r: 0.88, width: 1.4, rot0: 1.3, spin: -0.03, tumble: 0.33, phase: 1, ticks: 24, dash: [48, 10, 6, 16] },
  { r: 0.76, width: 1.8, rot0: 2.4, spin: 0.04, tumble: 0.2, phase: 2, ticks: 18, dash: [60, 14, 6, 26] },
  { r: 0.64, width: 1.1, rot0: 0.7, spin: -0.05, tumble: 0.4, phase: 3, ticks: 12, dash: [40, 9, 6, 14] },
];

/**
 * Rhombic triacontahedron: 12 icosahedral vertices (indices 0-11), 20
 * dodecahedral vertices (12-31), 60 edges joining each icosahedral vertex to
 * its 5 nearest dodecahedral vertices. Normalised so max radius is 1.05.
 */
export function triacontahedron(): { vertices: Vec3[]; edges: [number, number][] } {
  const raw: Vec3[] = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    raw.push([0, a * PHI, b], [a * PHI, b, 0], [b, 0, a * PHI]);
  }
  const ni = raw.length;
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) raw.push([a, b, c]);
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    raw.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [b * PHI, 0, a / PHI]);
  }
  const d3 = (p: Vec3, q: Vec3) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const edges: [number, number][] = [];
  for (let i = 0; i < ni; i++) {
    const d: [number, number][] = [];
    for (let j = ni; j < raw.length; j++) d.push([d3(raw[i], raw[j]), j]);
    d.sort((x, y) => x[0] - y[0]);
    d.slice(0, 5).forEach(([, j]) => edges.push([i, j]));
  }
  const m = Math.max(...raw.map((v) => Math.hypot(...v)));
  const vertices = raw.map((v) => v.map((c) => (c / m) * RADIUS) as Vec3);
  return { vertices, edges };
}
