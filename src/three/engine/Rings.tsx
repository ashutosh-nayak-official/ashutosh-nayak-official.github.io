import { useEffect, useMemo } from 'react';
import { Group, type ShaderMaterial } from 'three';
import { RINGS } from '../../engine/geometry';
import { lineMaterial, pointsMaterial, srgb } from './materials';
import { FatLines, PointCloud } from './primitives';
import { PX, useEngine, useEngineUpdate } from './frame';

const SEGMENTS = 256;
const CORE = srgb(255, 225, 160);
const HALO = srgb(255, 200, 110);
const TICK = srgb(255, 230, 170);

interface RingParts {
  group: Group;
  core: FatLines;
  coreMat: ShaderMaterial;
  halo: FatLines | null;
  haloMat: ShaderMaterial | null;
  ticks: PointCloud;
  tickMat: ShaderMaterial;
}

/**
 * Armillary rings: four dashed loops with tick marks. Each ring is a unit
 * circle (radius RINGS[i].r) in its own plane; the plane is tilted about X so
 * it projects to the mockup's squashed ellipse, then spun about the view axis.
 * During build the loop draws in (instance count), during burst it flies out,
 * fades and its gaps widen.
 */
export function Rings() {
  const { mode, shared, frame } = useEngine();

  const parts = useMemo<RingParts[]>(() => {
    const dark = mode === 'dark';
    return RINGS.map((A) => {
      const group = new Group();
      group.rotation.order = 'ZXY';
      const dist = new Float32Array(SEGMENTS * 2);
      const dash = A.dash.map((d) => d * PX) as [number, number, number, number];
      const circle = (lines: FatLines, c: typeof CORE, a: number) => {
        for (let k = 0; k < SEGMENTS; k++) {
          const a0 = (k / SEGMENTS) * Math.PI * 2;
          const a1 = ((k + 1) / SEGMENTS) * Math.PI * 2;
          lines.seg(k, Math.cos(a0) * A.r, Math.sin(a0) * A.r, 0, Math.cos(a1) * A.r, Math.sin(a1) * A.r, 0);
          lines.color(k, c, a);
          dist[k * 2] = a0 * A.r;
          dist[k * 2 + 1] = a1 * A.r;
        }
        lines.commit();
      };
      let halo: FatLines | null = null;
      let haloMat: ShaderMaterial | null = null;
      if (dark) {
        // wide soft stroke under the core (dark only: light mode has no halo strokes)
        haloMat = lineMaterial(shared, { mode, width: A.width * 5, dash });
        halo = new FatLines(SEGMENTS, haloMat, shared, dist);
        circle(halo, HALO, 0.16);
        halo.mesh.renderOrder = 1;
        group.add(halo.mesh);
      }
      const coreMat = lineMaterial(shared, { mode, width: dark ? A.width : A.width * 1.25, dash });
      const core = new FatLines(SEGMENTS, coreMat, shared, dist);
      circle(core, CORE, 0.85);
      core.mesh.renderOrder = 2;
      group.add(core.mesh);

      const tickMat = pointsMaterial(shared, mode, 'square');
      const ticks = new PointCloud(A.ticks, tickMat, shared);
      for (let k = 0; k < A.ticks; k++) {
        const a = (k / A.ticks) * Math.PI * 2;
        ticks.set(k, Math.cos(a) * A.r, Math.sin(a) * A.r, 0, TICK, 0.7, 3);
      }
      ticks.commit();
      ticks.points.renderOrder = 2;
      group.add(ticks.points);
      return { group, core, coreMat, halo, haloMat, ticks, tickMat };
    });
  }, [mode, shared]);

  const root = useMemo(() => {
    const g = new Group();
    for (const p of parts) g.add(p.group);
    return g;
  }, [parts]);

  useEffect(() => {
    frame.rings = parts.map((p) => p.group);
    return () => {
      for (const p of parts) {
        p.core.dispose();
        p.halo?.dispose();
        p.ticks.dispose();
        p.coreMat.dispose();
        p.haloMat?.dispose();
        p.tickMat.dispose();
      }
    };
  }, [parts, frame]);

  useEngineUpdate(0, (f) => {
    // glow boost: in dark mode only, half strength on the ring halos (the heart is the
    // focus; the rings carry most of the frame's area, so a full boost reads too strong)
    const gl = mode === 'dark' ? 1 + (f.glow - 1) * 0.5 : 1;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const A = RINGS[i];
      const s = f.state.rings[i];
      const on = s.visibleFrac > 0 && s.opacity > 0.002;
      p.group.visible = on;
      p.group.scale.setScalar(s.radiusScale);
      // tilt so the circle projects to the mockup's squash; alternate sides per ring
      const tilt = Math.acos(Math.min(1, Math.max(-1, s.squash))) * (i % 2 ? 1 : -1);
      p.group.rotation.set(tilt, 0, -s.rot);
      p.group.updateMatrix();
      if (!on) continue;
      const n = Math.ceil(SEGMENTS * s.visibleFrac);
      p.core.count = n;
      if (p.halo) p.halo.count = n;
      p.ticks.count = Math.ceil(A.ticks * s.visibleFrac);
      p.coreMat.uniforms.opacity.value = s.opacity;
      p.tickMat.uniforms.opacity.value = s.opacity;
      const offset = -f.t * A.spin;
      p.coreMat.uniforms.uGapScale.value = s.gapScale;
      p.coreMat.uniforms.uDashOffset.value = offset;
      if (p.haloMat) {
        p.haloMat.uniforms.opacity.value = s.opacity * gl;
        p.haloMat.uniforms.uGapScale.value = s.gapScale;
        p.haloMat.uniforms.uDashOffset.value = offset;
      }
    }
  });

  return <primitive object={root} />;
}
