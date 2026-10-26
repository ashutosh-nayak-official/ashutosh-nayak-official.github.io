import { describe, it, expect } from 'vitest';
import { BREATH_AMP, breathTable, breathAt, vertexBreath } from '../../src/engine/breath';

describe('vertexBreath (heart vertices breathe independently)', () => {
  const N = 32;
  it('amplitude is within the 6-12% design range (owner: +10% over 0.096)', () => {
    expect(BREATH_AMP).toBeGreaterThanOrEqual(0.06);
    expect(BREATH_AMP).toBeLessThanOrEqual(0.12);
    expect(BREATH_AMP).toBeCloseTo(0.1056, 6);
  });
  it('stays within ±12% of the rest radius for every vertex over a long run', () => {
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < N; i++) for (let t = 0; t < 600; t += 0.37) {
      const s = vertexBreath(i, t, 7);
      lo = Math.min(lo, s); hi = Math.max(hi, s);
    }
    expect(lo).toBeGreaterThanOrEqual(0.88);
    expect(hi).toBeLessThanOrEqual(1.12);
    // and it actually moves
    expect(hi - lo).toBeGreaterThan(0.08);
  });
  it('different vertices differ at the same t (no global pulse)', () => {
    for (const t of [0, 1.3, 12.7, 99]) {
      const vals = Array.from({ length: N }, (_, i) => vertexBreath(i, t, 7));
      expect(new Set(vals.map((v) => v.toFixed(4))).size).toBeGreaterThan(N * 0.8);
      expect(Math.max(...vals) - Math.min(...vals)).toBeGreaterThan(0.03);
    }
  });
  it('is continuous: a 1/60 s step changes the factor only slightly', () => {
    const dt = 1 / 60;
    for (let i = 0; i < N; i++) for (let t = 0; t < 60; t += 0.5) {
      expect(Math.abs(vertexBreath(i, t + dt, 7) - vertexBreath(i, t, 7))).toBeLessThan(0.0067); // max slope amp*2*pi*0.6 Hz / 60 = 0.00663
    }
  });
  it('is deterministic for a seed and differs across seeds', () => {
    expect(vertexBreath(5, 3.3, 42)).toBe(vertexBreath(5, 3.3, 42));
    const a = Array.from({ length: N }, (_, i) => vertexBreath(i, 3.3, 42));
    const b = Array.from({ length: N }, (_, i) => vertexBreath(i, 3.3, 43));
    expect(a).not.toEqual(b);
  });
  it('breathAt with amp 0 is exactly 1 (reduced motion / burst fade)', () => {
    const tab = breathTable(7, N);
    for (let i = 0; i < N; i++) expect(breathAt(tab, i, 4.2, 0)).toBe(1);
  });
  it('breathAt matches vertexBreath at the default amplitude', () => {
    const tab = breathTable(7, N);
    expect(breathAt(tab, 9, 8.1)).toBeCloseTo(vertexBreath(9, 8.1, 7), 12);
  });
  it('per-vertex frequencies are 0.15-0.6 Hz', () => {
    const tab = breathTable(11, N);
    // layout: per vertex 3 x [freqHz, phase, weight]
    for (let k = 0; k < N * 3; k++) {
      const hz = tab[k * 3];
      expect(hz).toBeGreaterThanOrEqual(0.15);
      expect(hz).toBeLessThanOrEqual(0.6);
    }
  });
});

describe('projectHeart with breathing', () => {
  it('amp 0 is the rigid pose; breathing scales each vertex radially by its own factor', async () => {
    const { projectHeart } = await import('../../src/three/engine/Heart');
    const N = 32;
    const tab = breathTable(7, N);
    const rigid = new Float32Array(N * 3), rz = new Float32Array(N);
    const still = new Float32Array(N * 3), sz = new Float32Array(N);
    const live = new Float32Array(N * 3), lz = new Float32Array(N);
    projectHeart(2, 0, rigid, rz);
    projectHeart(2, 0, still, sz, tab, 5, 0);
    projectHeart(2, 0, live, lz, tab, 5, BREATH_AMP);
    expect(Array.from(still)).toEqual(Array.from(rigid));
    // depth is pre-projection and linear in the radial scale, so lz/rz is the factor
    const ratios: number[] = [];
    for (let i = 0; i < N; i++) {
      if (Math.abs(rz[i]) < 0.1) continue;
      const r = lz[i] / rz[i];
      expect(r).toBeCloseTo(breathAt(tab, i, 5), 4);
      ratios.push(r);
    }
    expect(Math.max(...ratios) - Math.min(...ratios)).toBeGreaterThan(0.02);
  });
});
