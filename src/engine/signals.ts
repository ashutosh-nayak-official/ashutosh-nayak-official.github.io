export type Vec2 = [number, number];
type Rng = () => number;

/** Each bolt lives 260-440 ms. */
export const BOLT_LIFE_MS = [260, 440] as const;
/** A live bolt re-jitters its path every 55 ms. */
export const BOLT_JITTER_MS = 55;

/** Next electric burst: 1300-3200 ms away, 1 bolt (p=0.7) or 2 staggered 40-130 ms. */
export function nextBurst(rng: Rng): { delayMs: number; bolts: 1 | 2; staggerMs: number[] } {
  const delayMs = 1300 + rng() * 1900;
  const bolts = rng() < 0.7 ? 1 : 2;
  const staggerMs = bolts === 1 ? [0] : [0, 40 + rng() * 90];
  return { delayMs, bolts, staggerMs };
}

function displace(a: Vec2, b: Vec2, disp: number, depth: number, out: Vec2[], rng: Rng): void {
  if (depth === 0) {
    out.push(b);
    return;
  }
  const m: Vec2 = [(a[0] + b[0]) / 2 + (rng() - 0.5) * disp, (a[1] + b[1]) / 2 + (rng() - 0.5) * disp];
  displace(a, m, disp / 2, depth - 1, out, rng);
  displace(m, b, disp / 2, depth - 1, out, rng);
}

/** Jagged bolt by midpoint displacement (5 levels, 0.32 x length); at most one fork (p=0.7). */
export function boltPath(from: Vec2, to: Vec2, rng: Rng, opts: { fork?: boolean } = {}): { main: Vec2[]; branch: Vec2[] } {
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const main: Vec2[] = [from];
  displace(from, to, L * 0.32, 5, main, rng);
  const branch: Vec2[] = [];
  if ((opts.fork ?? true) && rng() < 0.7) {
    const k = 8 + Math.floor(rng() * 12);
    const s = main[k];
    const ang = Math.atan2(to[1] - from[1], to[0] - from[0]) + (rng() - 0.5) * 1.6;
    const l = L * (0.2 + rng() * 0.25);
    const e: Vec2 = [s[0] + Math.cos(ang) * l, s[1] + Math.sin(ang) * l];
    branch.push(s);
    displace(s, e, l * 0.35, 4, branch, rng);
  }
  return { main, branch };
}
