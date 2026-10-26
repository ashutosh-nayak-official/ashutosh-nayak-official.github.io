import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Group, type ShaderMaterial } from 'three';
import { callState, CALL_STOPS } from '../../engine/call';
import { spectrum } from '../../engine/palette';
import { Engine, type EngineProgress } from '../engine/Engine';
import { createSharedUniforms, lineMaterial, pointsMaterial } from '../engine/materials';
import { FatLines, PointCloud } from '../engine/primitives';
import { STAGE_CAMERA } from '../Stage';
import type { SceneProps } from '../SceneSlot';

/** World units per CSS px at z = 0, per px of slot height. */
const WORLD_H = 2 * STAGE_CAMERA.position[2] * Math.tan(((STAGE_CAMERA.fov / 2) * Math.PI) / 180);
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** Linear Color at u (0–1) along the 5-stop Spectrum. */
function spectrumAt(stops: Color[], u: number, out: Color): Color {
  const x = clamp(u) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return out.copy(stops[i]).lerp(stops[i + 1], x - i);
}

/**
 * Chapter 02 scene (mockup `call-c`): the Golden Engine, upper right, unwinds as the
 * reader scrolls (signals keep firing until the rings have mostly unwound) while a
 * Spectrum sound wave rises in the `.call-wave` band above the stop cards. Five stop
 * nodes sit on the wave (over the card centres when the cards share a row) and light in
 * turn; a small pulse runs along the line. Dark draws additively with a soft halo
 * stroke; light draws crisp deeper strokes with normal blending and no halos.
 *
 * Layout is read from the DOM each frame (slot, wave band, cards), since the copy
 * glides inside the pinned frame on short screens.
 */
export default function CallScene({ env, progress }: SceneProps) {
  const { mode } = env;
  const dark = mode === 'dark';
  const lite = env.capability === 'lite';

  const engineProgress = useMemo(() => ({ current: { build: 1, burst: 0, unwind: 0 } as EngineProgress }), []);
  const engineDim = useMemo(() => ({ current: 1 }), []);
  const engineGroup = useRef<Group>(null);

  const shared = useMemo(() => createSharedUniforms(mode), [mode]);
  const segs = lite ? 140 : 240;

  const wave = useMemo(() => {
    const stops = spectrum(mode).map((h) => new Color(h));
    const root = new Group();
    const c0 = new Color();
    const c1 = new Color();
    const mats: ShaderMaterial[] = [];

    const strand = (width: number, alpha: number, order: number) => {
      const mat = lineMaterial(shared, { mode, width, caps: true, tint: 0 });
      const lines = new FatLines(segs, mat, shared);
      for (let k = 0; k < segs; k++) {
        lines.color(k, spectrumAt(stops, k / segs, c0), alpha, spectrumAt(stops, (k + 1) / segs, c1), alpha);
      }
      lines.commit(false, true);
      lines.mesh.renderOrder = order;
      root.add(lines.mesh);
      mats.push(mat);
      return { lines, mat };
    };
    // dark: wide soft halo under a thin bright core (additive); light: one crisp stroke
    const halo = dark ? strand(6, 0.18, 1) : null;
    const core = strand(dark ? 1.4 : 2.2, dark ? 0.9 : 1, 2);

    const nodeMat = pointsMaterial(shared, mode, dark ? 'glow' : 'dot', 0);
    const nodes = new PointCloud(CALL_STOPS + 1, nodeMat, shared);
    nodes.points.renderOrder = 3;
    root.add(nodes.points);
    mats.push(nodeMat);

    const nodeColors = Array.from({ length: CALL_STOPS }, () => new Color());
    const pulseColor = dark ? new Color(1, 0.96, 0.85) : stops[2].clone();
    return { root, halo, core, nodes, nodeColors, pulseColor, stops, mats, level: new Float32Array(CALL_STOPS) };
  }, [mode, dark, shared, segs]);

  useEffect(
    () => () => {
      wave.halo?.lines.dispose();
      wave.core.lines.dispose();
      wave.nodes.dispose();
      for (const m of wave.mats) m.dispose();
    },
    [wave],
  );

  const t = useRef(0);
  const ys = useMemo(() => new Float32Array(segs + 1), [segs]);
  const nodeX = useMemo(() => new Float32Array(CALL_STOPS), []);

  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 0), 0.1);
    t.current += dt;
    const time = t.current;
    const s = callState(progress.current);

    engineProgress.current.unwind = s.unwind;

    const slot = document.querySelector<HTMLElement>('[data-scene="call"]');
    const band = slot?.parentElement?.querySelector<HTMLElement>('.call-wave');
    const g = engineGroup.current;
    if (!slot || !band || !g) {
      wave.root.visible = false;
      return;
    }
    const sr = slot.getBoundingClientRect();
    if (sr.height < 1 || sr.width < 1) return;
    const k = WORLD_H / sr.height; // world units per px
    const wx = (px: number) => (px - sr.left - sr.width / 2) * k;
    const wy = (py: number) => -(py - sr.top - sr.height / 2) * k;

    // engine: mockup (0.74w, 0.36h), radius 0.24 min(w, h); higher and larger on portrait
    const portrait = sr.width < sr.height * 0.8;
    const minWH = Math.min(sr.width, sr.height);
    const ex = sr.left + sr.width * (portrait ? 0.72 : 0.74);
    const ey = sr.top + sr.height * (portrait ? 0.22 : 0.36);
    const er = (portrait ? 0.34 : 0.24) * minWH;
    g.position.set(wx(ex), wy(ey), 0);
    g.scale.setScalar(er * k);
    // on portrait the engine sits behind the headline: keep it quieter there
    engineDim.current = s.unwind >= 1 ? 0 : (1 - s.unwind) ** 1.5 * (portrait ? 0.6 : 1);

    // wave band and stop node positions
    const br = band.getBoundingClientRect();
    const y0 = br.top + br.height / 2;
    const L = sr.left + sr.width * 0.06;
    const R = sr.left + sr.width * 0.94;
    const cards = band.parentElement?.querySelectorAll<HTMLElement>('.stop');
    let row = !!cards && cards.length === CALL_STOPS;
    if (row && cards) {
      const top0 = cards[0].getBoundingClientRect().top;
      for (let i = 0; i < CALL_STOPS; i++) {
        const r = cards[i].getBoundingClientRect();
        if (Math.abs(r.top - top0) > 2) {
          row = false;
          break;
        }
        nodeX[i] = r.left + r.width / 2;
      }
    }
    if (!row) for (let i = 0; i < CALL_STOPS; i++) nodeX[i] = L + (R - L) * (0.1 + i * 0.2);

    const amp = s.wave;
    wave.root.visible = amp > 0;
    if (amp <= 0) return;

    // the line, with the mockup's animated envelope (24 px peak at full amplitude)
    const peak = Math.min(24, br.height * 0.35) * amp;
    for (let j = 0; j <= segs; j++) {
      const u = j / segs;
      const env = Math.sin(u * Math.PI) ** 1.5;
      ys[j] = y0 + Math.sin(u * 90 + time * 6) * Math.sin(u * 13 - time * 2) * peak * env;
    }
    const fade = clamp(amp * 3);
    for (const st of [wave.halo, wave.core]) {
      if (!st) continue;
      for (let j = 0; j < segs; j++) {
        st.lines.seg(j, wx(L + ((R - L) * j) / segs), wy(ys[j]), 0, wx(L + ((R - L) * (j + 1)) / segs), wy(ys[j + 1]), 0);
      }
      st.lines.commit(true, false);
      st.mat.uniforms.opacity.value = fade;
    }

    // stop nodes ease toward lit/unlit; then the travelling pulse
    const ease = 1 - Math.exp(-dt * 8);
    for (let i = 0; i < CALL_STOPS; i++) {
      const target = s.activeStops > i ? 1 : 0;
      wave.level[i] += (target - wave.level[i]) * ease;
      const l = wave.level[i];
      const c = spectrumAt(wave.stops, (nodeX[i] - L) / (R - L), wave.nodeColors[i]);
      const size = dark ? 16 + 28 * l : 7 + 6 * l;
      const alpha = (dark ? 0.35 + 0.65 * l : 0.45 + 0.55 * l) * fade;
      wave.nodes.set(i, wx(nodeX[i]), wy(y0), 0, c, alpha, size);
    }
    const pk = L + (R - L) * ((time * 0.25) % 1);
    wave.nodes.set(CALL_STOPS, wx(pk), wy(y0), 0, wave.pulseColor, 0.9 * fade, dark ? 20 : 6);
    wave.nodes.count = CALL_STOPS + 1;
    wave.nodes.commit();
  });

  return (
    <>
      <group ref={engineGroup}>
        <Engine progress={engineProgress} dim={engineDim} mode={mode} signals={!env.reducedMotion} />
      </group>
      <primitive object={wave.root} />
    </>
  );
}
