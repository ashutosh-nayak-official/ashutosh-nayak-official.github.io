/**
 * Per-instance glow boost for <Engine glow>. 1 is the standard engine; the hero passes
 * HERO_GLOW so it glows "just a very little bit more" than its other appearances
 * (owner request). Scales the heart's core bloom (both modes) and, in dark mode, the
 * outer halo plus the edge/ring stroke alpha that feeds the bloom.
 */
export const GLOW_MIN = 0.5;
export const GLOW_MAX = 1.6;
export const HERO_GLOW = 1.2;

export function engineGlow(g?: number): number {
  if (g === undefined || !Number.isFinite(g)) return 1;
  return Math.min(GLOW_MAX, Math.max(GLOW_MIN, g));
}
