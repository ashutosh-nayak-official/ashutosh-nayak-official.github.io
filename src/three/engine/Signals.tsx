import { useEffect, useMemo } from 'react';
import { Group, Vector3, type ShaderMaterial } from 'three';
import { RINGS } from '../../engine/geometry';
import { BOLT_JITTER_MS, BOLT_LIFE_MS, boltPath, nextBurst } from '../../engine/signals';
import { lineMaterial, pointsMaterial, srgb } from './materials';
import { FatLines, PointCloud } from './primitives';
import { useEngine, useEngineUpdate, type EngineStats } from './frame';

/** At most two bolts exist at once: one burst fires 1-2, and bursts are 1.3 s+ apart. */
export const MAX_BOLTS = 2;
const MAIN_SEGS = 32; // boltPath: 5 midpoint levels
const BRANCH_SEGS = 16; // 4 levels

export interface BoltSlot {
  active: boolean;
  burst: number;
  vi: number;
  ri: number;
  th: number;
  born: number;
  life: number;
  jitterAt: number;
  /** current path, engine space, xyz per point */
  main: Float32Array;
  branch: Float32Array;
  branchN: number;
}

/**
 * Burst/bolt scheduling (mockup `strikes()`), clocked by the caller. When not
 * allowed (signals off, engine building / breaking apart, document hidden) all
 * bolts are dropped and the schedule re-arms, so nothing fires in a backlog.
 */
export class SignalScheduler {
  readonly slots: BoltSlot[];
  next = -1;
  private burstId = 0;

  constructor(private readonly rng: () => number, readonly stats: EngineStats) {
    this.slots = Array.from({ length: MAX_BOLTS }, () => ({
      active: false, burst: 0, vi: 0, ri: 0, th: 0, born: 0, life: 0, jitterAt: -1,
      main: new Float32Array((MAIN_SEGS + 1) * 3),
      branch: new Float32Array((BRANCH_SEGS + 1) * 3),
      branchN: 0,
    }));
  }

  step(now: number, allowed: boolean, ringOk: (i: number) => boolean, vertexCount: number): void {
    const { rng, slots, stats } = this;
    if (!allowed) {
      for (const s of slots) s.active = false;
      this.next = -1;
      stats.liveBolts = 0;
      return;
    }
    if (this.next < 0) this.next = now + 300 + rng() * 600;
    if (now >= this.next) {
      const b = nextBurst(rng);
      const id = ++this.burstId;
      stats.bursts++;
      for (let k = 0; k < b.bolts; k++) {
        const ri = Math.floor(rng() * RINGS.length);
        if (!ringOk(ri)) continue;
        const s = slots.find((x) => !x.active);
        if (!s) continue;
        s.active = true;
        s.burst = id;
        s.ri = ri;
        s.vi = Math.floor(rng() * vertexCount);
        s.th = rng() * Math.PI * 2;
        s.born = now + b.staggerMs[k];
        s.life = BOLT_LIFE_MS[0] + rng() * (BOLT_LIFE_MS[1] - BOLT_LIFE_MS[0]);
        s.jitterAt = -1;
        stats.spawned++;
      }
      this.next = now + b.delayMs;
    }
    let live = 0;
    for (const s of slots) {
      if (s.active && now - s.born > s.life) s.active = false;
      if (s.active) live++;
    }
    stats.liveBolts = live;
    for (const s of slots) {
      if (!s.active) continue;
      let same = 0;
      for (const o of slots) if (o.active && o.burst === s.burst) same++;
      stats.maxLivePerBurst = Math.max(stats.maxLivePerBurst, same);
    }
  }
}

const D_CORE = srgb(255, 248, 225);
const D_HALO = srgb(255, 200, 120);
const D_HIT = srgb(255, 240, 200);
const D_SRC = srgb(255, 250, 235);
const AMBER = srgb(214, 118, 18);

/**
 * Electric signals: jagged bolts from a heart vertex to a point on a ring,
 * re-jittered every BOLT_JITTER_MS, forking at most once, with a flash where
 * they hit. Dark: white-hot core over a soft halo, tinted, additive. Light:
 * a thicker amber stroke, no glow.
 */
export function Signals() {
  const { mode, shared, rng, stats } = useEngine();
  const scheduler = useMemo(() => new SignalScheduler(rng, stats), [rng, stats]);

  const parts = useMemo(() => {
    const dark = mode === 'dark';
    const root = new Group();
    const mats: ShaderMaterial[] = [];
    const mk = (width: number) => {
      const m = lineMaterial(shared, { mode, width, caps: true, tint: dark ? undefined : 0 });
      mats.push(m);
      return m;
    };
    const mainHalo = dark ? new FatLines(MAX_BOLTS * MAIN_SEGS, mk(7), shared) : null;
    const branchHalo = dark ? new FatLines(MAX_BOLTS * BRANCH_SEGS, mk(4), shared) : null;
    const main = new FatLines(MAX_BOLTS * MAIN_SEGS, mk(dark ? 1.4 : 2), shared);
    const branch = new FatLines(MAX_BOLTS * BRANCH_SEGS, mk(dark ? 0.8 : 1.2), shared);
    const flashMat = pointsMaterial(shared, mode, dark ? 'glow' : 'dot', dark ? undefined : 0);
    mats.push(flashMat);
    const flashes = new PointCloud(MAX_BOLTS * 2, flashMat, shared);
    for (const l of [mainHalo, branchHalo]) if (l) { l.mesh.renderOrder = 6; root.add(l.mesh); }
    for (const l of [main, branch]) { l.mesh.renderOrder = 7; root.add(l.mesh); }
    flashes.points.renderOrder = 7;
    flashes.count = MAX_BOLTS * 2;
    root.add(flashes.points);
    return { root, mats, mainHalo, branchHalo, main, branch, flashes, dark };
  }, [mode, shared]);

  useEffect(
    () => () => {
      for (const l of [parts.mainHalo, parts.branchHalo, parts.main, parts.branch]) l?.dispose();
      parts.flashes.dispose();
      parts.mats.forEach((m) => m.dispose());
    },
    [parts],
  );

  const end = useMemo(() => new Vector3(), []);

  useEngineUpdate(2, (f) => {
    const allowed = f.signals && f.state.signalsAllowed && !f.hidden;
    const rings = f.state.rings;
    scheduler.step(
      f.clockMs,
      allowed,
      (i) => rings[i].visibleFrac >= 1 && rings[i].opacity > 0.8,
      f.heartPos.length / 3,
    );

    const { mainHalo, branchHalo, main, branch, flashes, dark } = parts;
    const now = f.clockMs;
    for (let si = 0; si < MAX_BOLTS; si++) {
      const s = scheduler.slots[si];
      const age = now - s.born;
      const ring = f.rings[s.ri];
      if (!s.active || age < 0 || !ring) {
        hide(si);
        continue;
      }
      const P = f.heartPos;
      const sx = P[s.vi * 3], sy = P[s.vi * 3 + 1], sz = P[s.vi * 3 + 2];
      const R = RINGS[s.ri].r;
      end.set(Math.cos(s.th) * R, Math.sin(s.th) * R, 0).applyMatrix4(ring.matrix);
      if (s.jitterAt < 0 || now - s.jitterAt > BOLT_JITTER_MS) {
        s.jitterAt = now;
        const path = boltPath([sx, sy], [end.x, end.y], rng);
        const n = path.main.length - 1;
        for (let k = 0; k <= MAIN_SEGS; k++) {
          const p = path.main[Math.min(k, n)];
          s.main[k * 3] = p[0];
          s.main[k * 3 + 1] = p[1];
          s.main[k * 3 + 2] = sz + ((end.z - sz) * k) / MAIN_SEGS;
        }
        s.branchN = Math.min(path.branch.length - 1, BRANCH_SEGS);
        if (s.branchN > 0) {
          const fork = path.main.indexOf(path.branch[0]);
          const bz = sz + ((end.z - sz) * Math.max(fork, 0)) / MAIN_SEGS;
          for (let k = 0; k <= s.branchN; k++) {
            s.branch[k * 3] = path.branch[k][0];
            s.branch[k * 3 + 1] = path.branch[k][1];
            s.branch[k * 3 + 2] = bz;
          }
        }
      }
      const u = age / s.life;
      const al = (u < 0.12 ? u / 0.12 : 1 - u) * (0.75 + 0.25 * rng());
      writeLine(main, si * MAIN_SEGS, s.main, MAIN_SEGS, dark ? D_CORE : AMBER, al);
      writeLine(branch, si * BRANCH_SEGS, s.branch, s.branchN, dark ? D_CORE : AMBER, al * (dark ? 0.6 : 0.7), BRANCH_SEGS);
      if (mainHalo) writeLine(mainHalo, si * MAIN_SEGS, s.main, MAIN_SEGS, D_HALO, al * 0.25);
      if (branchHalo) writeLine(branchHalo, si * BRANCH_SEGS, s.branch, s.branchN, D_HALO, al * 0.25, BRANCH_SEGS);
      // flash where it hits, and a smaller one at the source vertex
      const hitPx = dark ? 2 * (10 + 18 * (1 - u)) : 2 * (2 + 3 * (1 - u));
      flashes.set(si * 2, end.x, end.y, end.z, dark ? D_HIT : AMBER, al, hitPx);
      flashes.set(si * 2 + 1, sx, sy, sz, dark ? D_SRC : AMBER, al * 0.8, dark ? 16 : 4);
    }
    for (const l of [mainHalo, branchHalo, main, branch]) l?.commit();
    flashes.commit();

    function hide(si: number) {
      for (let k = 0; k < MAIN_SEGS; k++) {
        main.color(si * MAIN_SEGS + k, D_CORE, 0);
        mainHalo?.color(si * MAIN_SEGS + k, D_CORE, 0);
      }
      for (let k = 0; k < BRANCH_SEGS; k++) {
        branch.color(si * BRANCH_SEGS + k, D_CORE, 0);
        branchHalo?.color(si * BRANCH_SEGS + k, D_CORE, 0);
      }
      flashes.col[si * 8 + 3] = 0;
      flashes.col[si * 8 + 7] = 0;
    }
  });

  return <primitive object={parts.root} />;
}

function writeLine(
  lines: FatLines,
  base: number,
  pts: Float32Array,
  n: number,
  c: typeof D_CORE,
  a: number,
  capacity = n,
): void {
  for (let k = 0; k < capacity; k++) {
    if (k < n) {
      const o = k * 3;
      lines.seg(base + k, pts[o], pts[o + 1], pts[o + 2], pts[o + 3], pts[o + 4], pts[o + 5]);
      lines.color(base + k, c, a);
    } else {
      lines.color(base + k, c, 0);
    }
  }
}
