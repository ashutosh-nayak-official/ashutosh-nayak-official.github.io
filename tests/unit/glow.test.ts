import { describe, it, expect } from 'vitest';
import { GLOW_MAX, GLOW_MIN, HERO_GLOW, engineGlow } from '../../src/engine/glow';

describe('engineGlow (per-instance glow boost)', () => {
  it('defaults to 1 (all non-hero engines unchanged)', () => {
    expect(engineGlow()).toBe(1);
    expect(engineGlow(undefined)).toBe(1);
  });
  it('passes sane values through', () => {
    expect(engineGlow(1.2)).toBe(1.2);
    expect(engineGlow(0.8)).toBe(0.8);
  });
  it('clamps to a sane range and rejects non-finite input', () => {
    expect(GLOW_MIN).toBeGreaterThan(0);
    expect(GLOW_MAX).toBeLessThanOrEqual(2);
    expect(engineGlow(10)).toBe(GLOW_MAX);
    expect(engineGlow(-3)).toBe(GLOW_MIN);
    expect(engineGlow(0)).toBe(GLOW_MIN);
    expect(engineGlow(Number.NaN)).toBe(1);
    expect(engineGlow(Number.POSITIVE_INFINITY)).toBe(1);
  });
  it('the hero boost is subtle (+15-25%)', () => {
    expect(HERO_GLOW).toBeGreaterThanOrEqual(1.15);
    expect(HERO_GLOW).toBeLessThanOrEqual(1.25);
  });
});
