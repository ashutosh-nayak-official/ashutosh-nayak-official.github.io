import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CanvasTexture,
  Color,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  type ShaderMaterial,
} from 'three';
import { Engine, type EngineProgress } from '../engine/Engine';
import { createSharedUniforms, glowMaterial, lineMaterial, pointsMaterial, srgb, type SharedUniforms } from '../engine/materials';
import { FatLines, PointCloud, glowQuad, setGlow } from '../engine/primitives';
import { spectrum, type Mode } from '../../engine/palette';
import { SCENE_LABELS, SPEC_LINES, agentsState, agentsTimeline, makeTiles, tileState, type Tile } from '../agents/state';
import type { SceneProps } from '../SceneSlot';

/**
 * Chapter 03: one spec through three human gates. SPEC.md writes itself, passes Gate 1
 * to the Golden Engine (the orchestrator), which plans task tiles; after Gate 2 parallel
 * agent sparks build them (a few fail red once and retry), a review scan verifies them,
 * and after Gate 3 the finished tiles stream out to the release.
 *
 * Everything lives in a fixed design space (about 2.45 × 1.85 units) that is scaled to
 * fit the slot. Geometry is built once per mode/capability; useFrame only mutates it.
 */

// ---- design space ---------------------------------------------------------------
const SPEC = { x: -0.92, y: 0.6, w: 0.34, h: 0.44 };
const ENGINE = { x: -0.78, y: -0.3, r: 0.36 };
const GATE1 = { x: -0.85, y: 0.2, ax: 1, ay: 0, half: 0.15 };
const GATE2 = { x: -0.28, y: -0.3, ax: 0, ay: 1, half: 0.17 };
const GRID = { x0: -0.12, x1: 0.84, y0: -0.86, y1: 0.86 };
const GATE3 = { x: 0.98, y: 0, ax: 0, ay: 1, half: 0.2 };
const RELEASE = { x: 1.16, y: 0 };
const BOX = { x0: -1.12, x1: 1.26, y0: -0.92, y1: 0.92 };
const BOX_W = BOX.x1 - BOX.x0;
const BOX_H = BOX.y1 - BOX.y0;
const GATES = [GATE1, GATE2, GATE3];

const RED: Record<Mode, Color> = { dark: srgb(255, 80, 60), light: srgb(214, 40, 30) };
const WHITE = new Color(1, 1, 1);
const PULSE_S = 0.9;
const RING_SEGS = 32;

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (u: number) => 1 - Math.pow(1 - u, 3);
const frac = (v: number) => v - Math.floor(v);

/** A white mono label on a transparent canvas; tinted by the material colour. */
function labelTexture(text: string): { tex: CanvasTexture; aspect: number; draw: () => void } {
  const canvas = document.createElement('canvas');
  const H = 64;
  const font = `500 ${H * 0.72}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
  const ctx = canvas.getContext('2d');
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.minFilter = LinearFilter;
  tex.generateMipmaps = false;
  const W = Math.ceil(text.length * H * 0.62) + 8;
  canvas.width = W;
  canvas.height = H;
  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.font = font;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 2, H / 2);
    tex.needsUpdate = true;
  };
  draw();
  return { tex, aspect: W / H, draw };
}

interface TileParts {
  tile: Tile;
  col: number;
  row: number;
  gx: number;
  gy: number;
  group: Group;
  fill: Mesh<PlaneGeometry, MeshBasicMaterial>;
  label: Mesh<PlaneGeometry, MeshBasicMaterial> | null;
  color: Color;
}

interface Built {
  root: Group;
  shared: SharedUniforms;
  tint: FatLines;
  gates: FatLines;
  raw: FatLines;
  sparks: PointCloud;
  tokens: PointCloud;
  glows: Mesh<PlaneGeometry, ShaderMaterial>[];
  tiles: TileParts[];
  tw: number;
  th: number;
  specLabel: Mesh<PlaneGeometry, MeshBasicMaterial>;
  redraw: () => void;
  dispose: () => void;
}

const QUAD = new PlaneGeometry(1, 1);

function build(mode: Mode, lite: boolean): Built {
  const dark = mode === 'dark';
  const root = new Group();
  const shared = createSharedUniforms(mode);
  const disposers: (() => void)[] = [];

  const tintMat = lineMaterial(shared, { mode, width: 1.6, caps: true, tint: 1 });
  const tint = new FatLines(120, tintMat, shared);
  const gateMat = lineMaterial(shared, { mode, width: dark ? 3 : 2.6, caps: true, tint: 1 });
  const gates = new FatLines(3 * (3 + RING_SEGS), gateMat, shared);
  const rawMat = lineMaterial(shared, { mode, width: 1.2, caps: false, tint: 0 });
  const cols = lite ? 3 : 4;
  const rows = lite ? 6 : 9;
  const n = cols * rows;
  const raw = new FatLines(n * 5, rawMat, shared);
  const sparkMat = pointsMaterial(shared, mode, dark ? 'glow' : 'dot', 1);
  const sparks = new PointCloud(n, sparkMat, shared);
  const tokens = new PointCloud(n, sparkMat, shared);
  root.add(raw.mesh, tint.mesh, gates.mesh, sparks.points, tokens.points);
  disposers.push(() => {
    tint.dispose();
    gates.dispose();
    gateMat.dispose();
    raw.dispose();
    sparks.dispose();
    tokens.dispose();
    tintMat.dispose();
    rawMat.dispose();
    sparkMat.dispose();
  });

  // Gate and release glows (dark only: light mode has no halos).
  const glows: Mesh<PlaneGeometry, ShaderMaterial>[] = [];
  if (dark) {
    for (const g of [...GATES, RELEASE]) {
      const m = glowQuad(glowMaterial(shared, mode, 1), shared);
      m.position.set(g.x, g.y, -0.01);
      root.add(m);
      glows.push(m);
      disposers.push(() => m.material.dispose());
    }
  }

  // Labels.
  const textures = new Map<string, ReturnType<typeof labelTexture>>();
  const getLabel = (text: string) => {
    let l = textures.get(text);
    if (!l) {
      l = labelTexture(text);
      textures.set(text, l);
    }
    return l;
  };
  const labelMesh = (text: string, height: number, color: Color) => {
    const l = getLabel(text);
    const mat = new MeshBasicMaterial({ map: l.tex, color, transparent: true, depthWrite: false, toneMapped: false });
    const m = new Mesh(QUAD, mat);
    m.scale.set(height * l.aspect, height, 1);
    disposers.push(() => mat.dispose());
    return m;
  };
  const labelInk = dark ? srgb(214, 182, 128) : srgb(158, 97, 0);
  const SPEC_LABEL = SCENE_LABELS[0];
  const specLabel = labelMesh(SPEC_LABEL, 0.05, labelInk);
  specLabel.position.set(SPEC.x - SPEC.w / 2 + (0.05 * getLabel(SPEC_LABEL).aspect) / 2, SPEC.y + SPEC.h / 2 + 0.05, 0);
  root.add(specLabel);

  // Task tiles.
  const gap = 0.022;
  const tw = (GRID.x1 - GRID.x0) / cols - gap;
  const th = (GRID.y1 - GRID.y0) / rows - gap;
  const tiles: TileParts[] = makeTiles(n, 11).map((tile) => {
    const col = tile.index % cols;
    const row = Math.floor(tile.index / cols);
    const group = new Group();
    const fillMat = new MeshBasicMaterial({ color: new Color(), transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
    const fill = new Mesh(QUAD, fillMat);
    fill.scale.set(tw, th, 1);
    group.add(fill);
    disposers.push(() => fillMat.dispose());
    let label: TileParts['label'] = null;
    if (!lite) {
      label = labelMesh(tile.label, Math.min(0.036, th * 0.3), new Color());
      label.position.set(-tw / 2 + 0.014 + label.scale.x / 2, th / 2 - 0.012 - label.scale.y / 2, 0.001);
      group.add(label);
    }
    root.add(group);
    return {
      tile,
      col,
      row,
      gx: GRID.x0 + (col + 0.5) * (tw + gap),
      gy: GRID.y1 - (row + 0.5) * (th + gap),
      group,
      fill,
      label,
      color: new Color(),
    };
  });

  const redraw = () => textures.forEach((l) => l.draw());
  disposers.push(() => textures.forEach((l) => l.tex.dispose()));

  return {
    root,
    shared,
    tint,
    gates,
    raw,
    sparks,
    tokens,
    glows,
    tiles,
    tw,
    th,
    specLabel,
    redraw,
    dispose: () => disposers.forEach((d) => d()),
  };
}

/** Linear-space colour along the Spectrum at u (0-1), like the shader's spectrumAt. */
function spectrumAt(stops: Color[], u: number, out: Color): Color {
  const x = clamp(u) * (stops.length - 1);
  const i = Math.min(stops.length - 2, Math.floor(x));
  return out.copy(stops[i]).lerp(stops[i + 1], x - i);
}

export default function AgentsScene({ env, progress }: SceneProps) {
  const mode = env.mode;
  const lite = env.capability === 'lite';
  const built = useMemo(() => build(mode, lite), [mode, lite]);
  useEffect(() => () => built.dispose(), [built]);

  // Labels drawn before the web font loaded are redrawn once it has.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && built.redraw()).catch(() => {});
    return () => {
      live = false;
    };
  }, [built]);

  // Slot aspect (the drei View sets the camera aspect only while drawing).
  const aspect = useRef(1);
  const slotPx = useRef(600);
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('[data-scene="agents"]');
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        aspect.current = r.width / r.height;
        slotPx.current = r.height;
      }
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layout = useRef<Group>(null);
  const stops = useMemo(() => spectrum(mode).map((h) => new Color(h)), [mode]);
  const engineProgress = useMemo(() => ({ current: { build: 1, burst: 0, unwind: 0 } as EngineProgress }), []);
  const engineDim = useRef(1);
  const engineSpeed = useRef(1);

  const sim = useRef({ t: 0, gates: [false, false, false], pulse: [Infinity, Infinity, Infinity], first: true });
  // New geometry (mode/capability change): start over without replaying the approval pulses.
  useEffect(() => {
    const S = sim.current;
    S.first = true;
    S.gates = [false, false, false];
    S.pulse = [Infinity, Infinity, Infinity];
  }, [built]);
  const tmp = useMemo(() => ({ c: new Color(), d: new Color() }), []);

  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 0), 0.1);
    const S = sim.current;
    S.t += dt;
    const b = built;
    const dark = mode === 'dark';

    // ---- fit the design box into the slot --------------------------------------
    const hh = Math.tan((35 / 2) * (Math.PI / 180)) * 4.2;
    const hw = hh * aspect.current;
    // Tall slot (phones): the scene sits behind the copy at reduced intensity.
    const behind = aspect.current < 0.75;
    const intensity = behind ? (dark ? 0.32 : 0.3) : 1;
    b.shared.uDim.value = intensity;
    // behind the copy it keeps to the lower half, where the copy ends on most phones
    const s = Math.min((hw * 2 * 0.94) / BOX_W, (hh * 2 * (behind ? 0.48 : 0.9)) / BOX_H);
    const g = layout.current;
    let ox = 0;
    if (g) {
      g.scale.setScalar(s);
      ox = -((BOX.x0 + BOX.x1) / 2) * s;
      const oy = behind ? -hh + (BOX_H * s) / 2 + 0.05 : 0;
      g.position.set(ox, oy - ((BOX.y0 + BOX.y1) / 2) * s, 0);
    }
    // CSS px per design unit; labels below ~8 px are noise, so they are hidden
    const pxPerUnit = (s * slotPx.current) / (2 * hh);
    const labelsOn = !behind && Math.min(0.036, b.th * 0.3) * pxPerUnit >= 8;
    /** spectrum position of a design-space x, as the line shader's tint sees it */
    const uAt = (x: number) => 0.5 + (ox + x * s) / hw / 2.4;

    // ---- choreography -----------------------------------------------------------
    const p = progress.current;
    const st = agentsState(p);
    const tl = agentsTimeline(p);
    for (let k = 0; k < 3; k++) {
      if (st.gates[k] && !S.gates[k]) S.pulse[k] = S.first ? Infinity : 0;
      else if (!st.gates[k]) S.pulse[k] = Infinity;
      else S.pulse[k] += dt;
      S.gates[k] = st.gates[k];
    }
    S.first = false;
    engineDim.current = (0.55 + 0.45 * clamp(tl.plan * 3)) * intensity;
    engineSpeed.current = st.phase === 'build' ? 2.2 : 1;

    const T = b.tint;
    let ti = 0;
    const W = WHITE;
    const seg = (ax: number, ay: number, bx: number, by: number, a: number) => {
      if (a <= 0.002 || ti >= T.capacity) return;
      T.seg(ti, ax, ay, 0, bx, by, 0);
      T.color(ti, W, a);
      ti++;
    };

    // SPEC.md panel: outline + lines writing in.
    const sx0 = SPEC.x - SPEC.w / 2;
    const sx1 = SPEC.x + SPEC.w / 2;
    const sy0 = SPEC.y - SPEC.h / 2;
    const sy1 = SPEC.y + SPEC.h / 2;
    const panelA = 0.75;
    seg(sx0, sy0, sx1, sy0, panelA);
    seg(sx1, sy0, sx1, sy1, panelA);
    seg(sx1, sy1, sx0, sy1, panelA);
    seg(sx0, sy1, sx0, sy0, panelA);
    const written = tl.spec * SPEC_LINES;
    const cur = Math.min(SPEC_LINES - 1, Math.floor(written));
    for (let i = 0; i < SPEC_LINES; i++) {
      const w = clamp(written - i);
      if (w <= 0) break;
      const len = (SPEC.w - 0.08) * (0.45 + ((i * 37) % 28) / 50);
      const y = sy1 - 0.055 - i * ((SPEC.h - 0.09) / (SPEC_LINES - 1));
      seg(sx0 + 0.04, y, sx0 + 0.04 + len * w, y, i === cur && tl.spec < 1 ? 0.95 : 0.55);
    }
    b.specLabel.visible = !behind && 0.05 * pxPerUnit >= 9;

    // Thread spec → Gate 1 → engine, and engine → Gate 2.
    const threadA0 = 0.18 + 0.2 * tl.spec;
    const open1 = st.gates[0];
    seg(SPEC.x, sy0, GATE1.x, GATE1.y, threadA0);
    seg(GATE1.x, GATE1.y, ENGINE.x, ENGINE.y + ENGINE.r * 0.9, open1 ? 0.55 : 0.08);
    const open2 = st.gates[1];
    seg(ENGINE.x + ENGINE.r * 0.9, ENGINE.y, GATE2.x, GATE2.y, tl.plan > 0 ? (open2 ? 0.5 : 0.25) : 0.08);

    // Gates: two posts and a beam; the beam lifts when a human approves.
    const GL = b.gates;
    let gi = 0;
    const gseg = (ax: number, ay: number, bx: number, by: number, a: number) => {
      if (a <= 0.002 || gi >= GL.capacity) return;
      GL.seg(gi, ax, ay, 0.003, bx, by, 0.003);
      GL.color(gi, W, a);
      gi++;
    };
    for (let k = 0; k < 3; k++) {
      const G = GATES[k];
      const open = st.gates[k];
      const fx = -G.ay; // flow direction (perpendicular to the posts' spacing)
      const fy = G.ax;
      const post = 0.07;
      const pulse = S.pulse[k] < PULSE_S ? 1 - S.pulse[k] / PULSE_S : 0;
      const postA = open ? 0.85 + 0.15 * pulse : 0.6;
      for (const side of [-1, 1]) {
        const px = G.x + G.ax * G.half * side;
        const py = G.y + G.ay * G.half * side;
        gseg(px - fx * post, py - fy * post, px + fx * post, py + fy * post, postA);
      }
      if (!open) gseg(G.x - G.ax * G.half, G.y - G.ay * G.half, G.x + G.ax * G.half, G.y + G.ay * G.half, 0.5);
      else if (pulse > 0) {
        // short "approved" pulse: a ring expanding out of the opened threshold
        const r = G.half * (0.4 + (1 - pulse) * 1.6);
        for (let i = 0; i < RING_SEGS; i++) {
          const a0 = (i / RING_SEGS) * Math.PI * 2;
          const a1 = ((i + 1) / RING_SEGS) * Math.PI * 2;
          gseg(G.x + Math.cos(a0) * r, G.y + Math.sin(a0) * r, G.x + Math.cos(a1) * r, G.y + Math.sin(a1) * r, pulse * 0.9);
        }
      }
      if (dark && b.glows[k]) {
        spectrumAt(stops, uAt(G.x), tmp.c);
        setGlow(b.glows[k], tmp.c, open ? 0.35 + 0.5 * pulse : 0.14, G.half * (open ? 1.2 + pulse : 0.9));
      }
    }

    // Spec travelling to the orchestrator after Gate 1.
    const sparks = b.sparks;
    let si = 0;
    const sparkPx = dark ? 9 : 4.5;
    const putSpark = (x: number, y: number, a: number, size = sparkPx) => {
      if (si >= sparks.capacity || a <= 0.002) return;
      sparks.set(si++, x, y, 0.01, W, a, size);
    };
    if (open1 && tl.plan < 1) {
      const u = frac(S.t * 0.8);
      putSpark(GATE1.x + (ENGINE.x - GATE1.x) * u, GATE1.y + (ENGINE.y + ENGINE.r * 0.9 - GATE1.y) * u, 0.9);
    }

    // Review scan across the grid during verify.
    if (tl.verify > 0 && tl.verify < 1) {
      const x = GRID.x0 - 0.03 + (GRID.x1 - GRID.x0 + 0.06) * tl.verify;
      seg(x, GRID.y0 - 0.04, x, GRID.y1 + 0.04, Math.sin(Math.PI * tl.verify) * 0.8);
    }

    // Gate 3 → release.
    const ship = tl.ship;
    seg(GRID.x1 + 0.03, GATE3.y, GATE3.x, GATE3.y, tl.verify > 0 ? 0.25 : 0.08);
    seg(GATE3.x, GATE3.y, RELEASE.x, RELEASE.y, st.gates[2] ? 0.5 : 0.08);
    const rr = 0.05 + 0.03 * ship;
    const relA = 0.3 + 0.6 * ship;
    seg(RELEASE.x - rr, RELEASE.y, RELEASE.x, RELEASE.y + rr, relA);
    seg(RELEASE.x, RELEASE.y + rr, RELEASE.x + rr, RELEASE.y, relA);
    seg(RELEASE.x + rr, RELEASE.y, RELEASE.x, RELEASE.y - rr, relA);
    seg(RELEASE.x, RELEASE.y - rr, RELEASE.x - rr, RELEASE.y, relA);
    if (dark && b.glows[3]) {
      spectrumAt(stops, uAt(RELEASE.x), tmp.c);
      setGlow(b.glows[3], tmp.c, 0.12 + 0.6 * ship, 0.12 + 0.18 * ship);
    }

    // ---- tiles -----------------------------------------------------------------
    const R = b.raw;
    let ri = 0;
    const rseg = (ax: number, ay: number, bx: number, by: number, c: Color, a: number) => {
      if (a <= 0.002 || ri >= R.capacity) return;
      R.seg(ri, ax, ay, 0.002, bx, by, 0.002);
      R.color(ri, c, a);
      ri++;
    };
    const tokens = b.tokens;
    let ki = 0;
    const scanX = GRID.x0 - 0.03 + (GRID.x1 - GRID.x0 + 0.06) * tl.verify;
    for (const P of b.tiles) {
      const { tile, group, fill, label } = P;
      const k = ease(clamp(tl.plan * 1.6 - tile.start * 0.6));
      if (k <= 0) {
        group.visible = false;
        continue;
      }
      group.visible = true;
      const x = ENGINE.x + (P.gx - ENGINE.x) * k;
      const y = ENGINE.y + (P.gy - ENGINE.y) * k;
      const sc = 0.3 + 0.7 * k;
      group.position.set(x, y, 0);
      group.scale.setScalar(sc);
      const ts = tileState(tile, tl.build);
      const reviewed = tl.verify >= 1 || P.gx < scanX;
      const sent = clamp(ship * 1.5 - tile.start * 0.5);
      const col = spectrumAt(stops, uAt(P.gx), P.color);

      // fill
      const fm = fill.material;
      let fillA: number;
      if (ts.failed) {
        fm.color.copy(RED[mode]);
        fillA = dark ? 0.55 : 0.75;
      } else if (ts.done) {
        fm.color.copy(col);
        fillA = (dark ? 0.5 : 0.82) * (reviewed ? 1.12 : 1) * (1 - 0.75 * ease(sent));
      } else if (ts.progress > 0) {
        fm.color.copy(col);
        fillA = dark ? 0.16 : 0.2;
      } else {
        fm.color.copy(col);
        fillA = dark ? 0.06 : 0.07;
      }
      fm.opacity = Math.min(1, fillA) * intensity;

      // outline + progress bar
      const hwT = (b.tw / 2) * sc;
      const hhT = (b.th / 2) * sc;
      const outC = ts.failed ? RED[mode] : col;
      const outA = ts.failed ? 0.95 : ts.done ? (reviewed ? 0.95 : 0.7) : 0.35 + 0.25 * k;
      rseg(x - hwT, y - hhT, x + hwT, y - hhT, outC, outA);
      rseg(x + hwT, y - hhT, x + hwT, y + hhT, outC, outA);
      rseg(x + hwT, y + hhT, x - hwT, y + hhT, outC, outA);
      rseg(x - hwT, y + hhT, x - hwT, y - hhT, outC, outA);
      if (ts.progress > 0 && !ts.done) {
        const by = y - hhT + 0.02 * sc;
        const bx0 = x - hwT + 0.014 * sc;
        const bx1 = x + hwT - 0.014 * sc;
        rseg(bx0, by, bx0 + (bx1 - bx0) * ts.progress, by, ts.failed ? RED[mode] : col, 0.95);
      }

      if (label) {
        label.visible = labelsOn && k > 0.6;
        const lm = label.material;
        if (ts.done && sent < 0.5) lm.color.set(dark ? '#fff4dc' : '#14110c');
        else lm.color.set(dark ? '#b8a27c' : '#6f685c');
        lm.opacity = ts.done && sent >= 0.5 ? 0.5 : 1;
      }

      // agent spark: engine → Gate 2 → tile, while the tile is being built
      if (ts.progress > 0 && !ts.done && !ts.failed) {
        const u = frac(S.t * (0.7 + tile.start * 0.6) + tile.start * 5);
        let sx: number;
        let sy: number;
        if (u < 0.35) {
          const v = u / 0.35;
          sx = ENGINE.x + (GATE2.x - ENGINE.x) * v;
          sy = ENGINE.y + (GATE2.y - ENGINE.y) * v;
        } else {
          const v = (u - 0.35) / 0.65;
          sx = GATE2.x + (x - GATE2.x) * v;
          sy = GATE2.y + (y - GATE2.y) * v;
        }
        putSpark(sx, sy, 0.95);
      }

      // finished work streams through Gate 3 to the release
      if (ts.done && sent > 0 && sent < 1 && ki < tokens.capacity) {
        let tx: number;
        let ty: number;
        if (sent < 0.7) {
          const v = sent / 0.7;
          tx = x + (GATE3.x - x) * v;
          ty = y + (GATE3.y - y) * v;
        } else {
          const v = (sent - 0.7) / 0.3;
          tx = GATE3.x + (RELEASE.x - GATE3.x) * v;
          ty = GATE3.y + (RELEASE.y - GATE3.y) * v;
        }
        tokens.set(ki++, tx, ty, 0.01, W, 0.9, dark ? 8 : 4);
      }
    }

    T.count = ti;
    T.commit();
    GL.count = gi;
    GL.commit();
    R.count = ri;
    R.commit();
    sparks.count = si;
    sparks.commit();
    tokens.count = ki;
    tokens.commit();
  });

  return (
    <group ref={layout}>
      <primitive object={built.root} />
      <Engine
        position={[ENGINE.x, ENGINE.y, 0]}
        scale={ENGINE.r}
        progress={engineProgress}
        dim={engineDim}
        timeScale={engineSpeed}
        mode={mode}
        signals={!env.reducedMotion}
        seed={303}
      />
    </group>
  );
}
