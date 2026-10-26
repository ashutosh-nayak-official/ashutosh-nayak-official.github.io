import { describe, it, expect } from 'vitest';
import { triacontahedron } from '../../src/engine/geometry';
import { mulberry32 } from '../../src/engine/rng';
import { nextBurst, boltPath, BOLT_LIFE_MS, BOLT_JITTER_MS } from '../../src/engine/signals';
import { engineState } from '../../src/engine/state';
import { spectrum, chipColor, type ChipRegion } from '../../src/engine/palette';

type V = [number, number, number];
const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('triacontahedron', () => {
  const { vertices, edges } = triacontahedron();
  it('triacontahedron has 32 vertices and 60 edges', () => {
    expect(vertices.length).toBe(32);
    expect(edges.length).toBe(60);
    expect(Math.max(...vertices.map((v) => Math.hypot(...v)))).toBeCloseTo(1.05, 9);
  });
  it('icosahedral vertices have degree 5 and dodecahedral degree 3', () => {
    const deg = new Array(32).fill(0);
    edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
    for (let i = 0; i < 12; i++) expect(deg[i]).toBe(5);
    for (let i = 12; i < 32; i++) expect(deg[i]).toBe(3);
  });
  it('all 30 rhombic faces are planar within 1e-9', () => {
    const nb = (i: number) => edges.filter(([a]) => a === i).map(([, b]) => b);
    const faces: number[][] = [];
    for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) {
      const shared = nb(i).filter((d) => nb(j).includes(d));
      if (shared.length === 2) faces.push([i, shared[0], j, shared[1]]);
    }
    expect(faces.length).toBe(30);
    for (const f of faces) {
      const [p0, p1, p2, p3] = f.map((i) => vertices[i]);
      const u = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
      const w = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]];
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      const q = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
      expect(Math.abs(n[0] * q[0] + n[1] * q[1] + n[2] * q[2])).toBeLessThan(1e-9);
    }
  });
  it('all edges have equal length within 1e-9', () => {
    const L = edges.map(([a, b]) => dist(vertices[a], vertices[b]));
    for (const l of L) expect(Math.abs(l - L[0])).toBeLessThan(1e-9);
  });
});

describe('signals', () => {
  it('bolt timing constants match the spec (life 260-440 ms, re-jitter every 55 ms)', () => {
    expect(BOLT_LIFE_MS).toEqual([260, 440]);
    expect(BOLT_JITTER_MS).toBe(55);
  });
  it('nextBurst stays in 1300–3200 ms and gives 1 bolt ~70% over 10k seeded draws (±3%)', () => {
    const rng = mulberry32(42);
    let ones = 0;
    for (let i = 0; i < 10000; i++) {
      const b = nextBurst(rng);
      expect(b.delayMs).toBeGreaterThanOrEqual(1300);
      expect(b.delayMs).toBeLessThanOrEqual(3200);
      expect(b.staggerMs.length).toBe(b.bolts);
      if (b.bolts === 1) ones++;
      else b.staggerMs.slice(1).forEach((s) => { expect(s).toBeGreaterThanOrEqual(40); expect(s).toBeLessThanOrEqual(130); });
    }
    expect(Math.abs(ones / 10000 - 0.7)).toBeLessThanOrEqual(0.03);
  });
  it('boltPath starts and ends exactly at its endpoints and forks at most once', () => {
    const rng = mulberry32(7);
    let forked = 0;
    for (let i = 0; i < 200; i++) {
      const a: [number, number] = [10, 20];
      const b: [number, number] = [300, 180];
      const p = boltPath(a, b, rng);
      expect(p.main[0]).toEqual(a);
      expect(p.main[p.main.length - 1]).toEqual(b);
      if (p.branch.length) { forked++; expect(p.main).toContainEqual(p.branch[0]); }
      expect(boltPath(a, b, rng, { fork: false }).branch).toEqual([]);
    }
    expect(forked).toBeGreaterThan(0);
  });
});

describe('engineState', () => {
  const S = (build: number, burst: number, unwind = 0, t = 3) => engineState({ t, build, burst, unwind });
  it('engineState: build=0 hides everything; full build shows rings; burst=1 fades rings; signals gated', () => {
    const z = S(0, 0);
    z.rings.forEach((r) => { expect(r.visibleFrac).toBe(0); expect(r.opacity).toBe(0); });
    expect(z.heartEdgeFrac.length).toBe(60);
    z.heartEdgeFrac.forEach((f) => expect(f).toBe(0));
    expect(z.heartOpacity).toBe(0);
    expect(z.signalsAllowed).toBe(false);
    const f = S(1, 0);
    expect(f.rings.length).toBe(4);
    f.rings.forEach((r) => { expect(r.visibleFrac).toBe(1); expect(r.opacity).toBe(1); expect(r.radiusScale).toBe(1); expect(r.gapScale).toBe(1); });
    f.heartEdgeFrac.forEach((e) => expect(e).toBe(1));
    expect(f.signalsAllowed).toBe(true);
    const b = S(1, 1);
    b.rings.forEach((r) => expect(r.opacity).toBe(0));
    expect(b.signalsAllowed).toBe(false);
    expect(b.shardProgress).toBeGreaterThan(0);
    expect(S(0.5, 0).signalsAllowed).toBe(false);
    expect(S(1, 0.2).signalsAllowed).toBe(false);
    expect(S(1, 0, 0.7).signalsAllowed).toBe(false);
    expect(S(1, 0.1, 0.69).signalsAllowed).toBe(true);
  });
});

describe('palette', () => {
  it('palette values match the spec exactly', () => {
    expect(spectrum('dark')).toEqual(['#ffcf6b', '#ff8a5c', '#e86bff', '#7d8cff', '#55dcff']);
    expect(spectrum('light')).toEqual(['#c98a12', '#e0532f', '#b532d6', '#4a5ee8', '#0e9fc9']);
    const dark: Record<ChipRegion, string> = {
      cpu: '#ff8a5c', eff: '#ffcf6b', slc: '#ffcf6b', gpu: '#e86bff', npu: '#7d8cff',
      io: '#55dcff', obs: '#55dcff', net: '#7d8cff', mem: '#55dcff',
    };
    const lightness = (h: string) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
      return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    };
    for (const k of Object.keys(dark) as ChipRegion[]) {
      expect(chipColor(k, 'dark')).toBe(dark[k]);
      const l = chipColor(k, 'light');
      expect(l).toMatch(/^#[0-9a-f]{6}$/);
      expect(l).not.toBe(dark[k]);
      expect(lightness(l)).toBeLessThan(lightness(dark[k]));
    }
  });
});
