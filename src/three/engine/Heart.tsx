import { useEffect, useMemo } from 'react';
import { Color, Group, type ShaderMaterial } from 'three';
import { triacontahedron } from '../../engine/geometry';
import { breathAt } from '../../engine/breath';
import { glowMaterial, lineMaterial, pointsMaterial, srgb } from './materials';
import { FatLines, PointCloud, glowQuad, setGlow } from './primitives';
import { PX, clamp, ease, useEngine, useEngineUpdate } from './frame';

const { vertices: V, edges: E } = triacontahedron();
export const HEART_VERTEX_COUNT = V.length;

/**
 * Heart pose (mockup `rot3`): turn 0.22·t about Y, then 0.42 + 0.18·sin(0.13·t)
 * about X, with the mockup's mild perspective swell. Writes engine-space
 * positions (y up) and the raw depth used for fading.
 *
 * Breathing (owner request): before the pose, each vertex is scaled along its own
 * radial direction by `breathAt(breath, i, breathT, amp)`, so vertices drift toward
 * and away from the centre independently. Edges, vertex points and signal anchors all
 * read these displaced positions. `amp` 0 (or no table) is the rigid solid.
 */
export function projectHeart(
  t: number,
  unwind: number,
  outPos: Float32Array,
  outZ: Float32Array,
  breath?: Float64Array,
  breathT = 0,
  amp = 0,
): void {
  const a = t * 0.22;
  const b = 0.42 + Math.sin(t * 0.13) * 0.18;
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
  const S = 0.2 * (1 - unwind * 0.5);
  for (let i = 0; i < V.length; i++) {
    const r = breath ? breathAt(breath, i, breathT, amp) : 1;
    const x0 = V[i][0] * r, y0 = V[i][1] * r, z0 = V[i][2] * r;
    const x = x0 * ca + z0 * sa;
    const z1 = -x0 * sa + z0 * ca;
    const y = y0 * cb - z1 * sb;
    const z = y0 * sb + z1 * cb;
    const q = 2.6 / (2.6 - z * 0.6);
    outPos[i * 3] = x * S * q;
    outPos[i * 3 + 1] = -y * S * q;
    outPos[i * 3 + 2] = z * S;
    outZ[i] = z;
  }
}

const HALO_BACK = srgb(255, 190, 110);
const HALO_FRONT = srgb(255, 240, 110);
const CORE = srgb(255, 235, 180);
const VERTEX = srgb(255, 245, 215);
const HEART_GLOW = srgb(255, 170, 50);
const OUTER_GLOW = srgb(255, 160, 40);
const SPARK = srgb(255, 245, 215);
const SPARK_LIGHT = srgb(224, 138, 0);

/**
 * Rhombic triacontahedron heart: 60 edges drawn in one by one during build,
 * vertices as depth-faded points, and on burst every edge detaches and spins
 * away. Also owns the core glows (outer halo dark-only, faint core bloom, and
 * the ignition spark at the start of the build).
 */
export function Heart() {
  const { mode, shared, rng } = useEngine();

  const parts = useMemo(() => {
    const dark = mode === 'dark';
    const root = new Group();
    const mats: ShaderMaterial[] = [];
    const outerMat = glowMaterial(shared, mode);
    const coreGlowMat = glowMaterial(shared, mode);
    const sparkMat = glowMaterial(shared, mode, dark ? undefined : 0);
    mats.push(outerMat, coreGlowMat, sparkMat);
    const outer = glowQuad(outerMat, shared);
    const coreGlow = glowQuad(coreGlowMat, shared);
    const spark = glowQuad(sparkMat, shared);
    outer.renderOrder = 0;
    coreGlow.renderOrder = 0;
    spark.renderOrder = 5;
    if (dark) root.add(outer);
    root.add(coreGlow, spark);

    let halo: FatLines | null = null;
    if (dark) {
      const m = lineMaterial(shared, { mode, width: 5, caps: true });
      mats.push(m);
      halo = new FatLines(E.length, m, shared);
      halo.mesh.renderOrder = 3;
      root.add(halo.mesh);
    }
    const coreMat = lineMaterial(shared, { mode, width: dark ? 1.3 : 1.6, caps: true });
    mats.push(coreMat);
    const core = new FatLines(E.length, coreMat, shared);
    core.mesh.renderOrder = 4;
    root.add(core.mesh);

    const vMat = pointsMaterial(shared, mode, dark ? 'glow' : 'dot');
    mats.push(vMat);
    const verts = new PointCloud(V.length, vMat, shared);
    verts.points.renderOrder = 4;
    root.add(verts.points);

    // burst: each edge flies along its own direction and spins (mockup EDIR)
    const dirs = E.map(() => ({ ang: rng() * Math.PI * 2, v: 0.8 + rng() * 1.6, spin: (rng() - 0.5) * 4 }));
    return { root, mats, outer, coreGlow, spark, halo, core, verts, dirs, dark };
  }, [mode, shared, rng]);

  useEffect(
    () => () => {
      parts.halo?.dispose();
      parts.core.dispose();
      parts.verts.dispose();
      parts.mats.forEach((m) => m.dispose());
    },
    [parts],
  );

  const tmpA = useMemo(() => new Color(), []);
  const tmpB = useMemo(() => new Color(), []);

  useEngineUpdate(1, (f) => {
    const { halo, core, verts, dirs, dark } = parts;
    const { build, burst, heartPos: P, heartZ: Z } = f;
    // glow boost: core bloom in both modes; halo and edge alpha (bloom feed) dark only
    const g = f.glow;
    const gl = dark ? g : 1;
    const tb = clamp(build * 1.8);

    setGlow(parts.outer, OUTER_GLOW, 0.08 * build * g, 1.25 * Math.max(build, 0.2));
    setGlow(parts.coreGlow, HEART_GLOW, (dark ? 0.16 : 0.07) * g * tb * (1 - burst), 0.45 * (0.3 + 0.7 * tb));
    setGlow(
      parts.spark,
      dark ? SPARK : SPARK_LIGHT,
      build < 0.35 ? clamp(build * 6) * (dark ? 1 : 0.6) : 0,
      (dark ? 6 + build * 40 : 3 + build * 18) * PX,
    );

    const al = f.state.heartOpacity;
    const fb = ease(clamp(burst * 1.3)); // edges detach (mockup)
    const frac = f.state.heartEdgeFrac;
    for (let k = 0; k < E.length; k++) {
      const [i, j] = E[k];
      const eb = frac[k];
      if (eb <= 0 || al <= 0) {
        core.color(k, CORE, 0);
        halo?.color(k, CORE, 0);
        continue;
      }
      let ax = P[i * 3], ay = P[i * 3 + 1];
      const az = P[i * 3 + 2];
      let bx = ax + (P[j * 3] - ax) * eb;
      let by = ay + (P[j * 3 + 1] - ay) * eb;
      const bz = az + (P[j * 3 + 2] - az) * eb;
      if (fb > 0) {
        const d = dirs[k];
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const off = fb * 1.6 * d.v;
        const ox = Math.cos(d.ang) * off, oy = Math.sin(d.ang) * off;
        const cs = Math.cos(fb * d.spin), sn = Math.sin(fb * d.spin);
        const ax0 = ax - mx, ay0 = ay - my, bx0 = bx - mx, by0 = by - my;
        ax = mx + ox + ax0 * cs - ay0 * sn;
        ay = my + oy + ax0 * sn + ay0 * cs;
        bx = mx + ox + bx0 * cs - by0 * sn;
        by = my + oy + bx0 * sn + by0 * cs;
      }
      core.seg(k, ax, ay, az, bx, by, bz);
      halo?.seg(k, ax, ay, az, bx, by, bz);
      // depth fade: front bright, back faint (per endpoint)
      const zi = (Z[i] + 1.6) / 3.2;
      const zj = (Z[i] + (Z[j] - Z[i]) * eb + 1.6) / 3.2;
      core.color(k, CORE, Math.min(1, (0.35 + zi * 0.6) * al * gl), CORE, Math.min(1, (0.35 + zj * 0.6) * al * gl));
      if (halo) {
        tmpA.copy(HALO_BACK).lerp(HALO_FRONT, zi);
        tmpB.copy(HALO_BACK).lerp(HALO_FRONT, zj);
        halo.color(k, tmpA, (0.1 + zi * 0.22) * al * gl, tmpB, (0.1 + zj * 0.22) * al * gl);
      }
    }
    core.commit();
    halo?.commit();

    const va = 1 - burst * 1.6;
    if (tb >= 1 && burst < 0.6) {
      for (let i = 0; i < V.length; i++) {
        const z = (Z[i] + 1.6) / 3.2;
        const size = dark ? 2 * (3 + z * 6) : 2 * (1.3 + z * 1.4);
        verts.set(i, P[i * 3], P[i * 3 + 1], P[i * 3 + 2], VERTEX, (0.4 + z * 0.6) * va, size);
      }
      verts.count = V.length;
      verts.commit();
    } else {
      verts.count = 0;
    }
  });

  return <primitive object={parts.root} />;
}
