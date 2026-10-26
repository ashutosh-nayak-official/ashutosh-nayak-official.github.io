import { mulberry32 } from './rng';

/**
 * Heart "breathing" (owner request): every triacontahedron vertex drifts toward and
 * away from the centre on its own, so the solid subtly re-forms while it turns.
 *
 * Each vertex sums 3 sines with seeded per-vertex frequencies (0.15-0.6 Hz), phases
 * and weights. Weights are normalised to sum 1, so the wave stays in [-1, 1] and the
 * radial scale factor stays within 1 ± amp. Incommensurate random frequencies make
 * the motion look non-repeating.
 */
export const BREATH_AMP = 0.1056;

const WAVES = 3;
const F_MIN = 0.15;
const F_MAX = 0.6;
const TAU = Math.PI * 2;

/** Per-vertex wave table: `count × WAVES × [freqHz, phase, weight]`. Build once, read every frame. */
export function breathTable(seed: number, count: number): Float64Array {
  const rng = mulberry32((seed ^ 0x9e3779b9) >>> 0);
  const tab = new Float64Array(count * WAVES * 3);
  for (let i = 0; i < count; i++) {
    let sum = 0;
    for (let w = 0; w < WAVES; w++) {
      const k = (i * WAVES + w) * 3;
      tab[k] = F_MIN + rng() * (F_MAX - F_MIN);
      tab[k + 1] = rng() * TAU;
      tab[k + 2] = 0.5 + rng();
      sum += tab[k + 2];
    }
    for (let w = 0; w < WAVES; w++) tab[(i * WAVES + w) * 3 + 2] /= sum;
  }
  return tab;
}

/** Radial scale factor for vertex `i` at breath time `t` (s). Allocation-free. */
export function breathAt(tab: Float64Array, i: number, t: number, amp = BREATH_AMP): number {
  if (amp === 0) return 1;
  let s = 0;
  const base = i * WAVES * 3;
  for (let w = 0; w < WAVES; w++) {
    const k = base + w * 3;
    s += tab[k + 2] * Math.sin(TAU * tab[k] * t + tab[k + 1]);
  }
  return 1 + amp * s;
}

const cache = new Map<number, Float64Array>();
const CACHE_COUNT = 32;

/** Convenience form: radial scale factor of heart vertex `i` (0-31) at time `t` for `seed`. */
export function vertexBreath(i: number, t: number, seed: number): number {
  let tab = cache.get(seed);
  if (!tab) {
    if (cache.size > 16) cache.clear();
    tab = breathTable(seed, CACHE_COUNT);
    cache.set(seed, tab);
  }
  return breathAt(tab, i, t);
}
