import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import {
  AdditiveBlending,
  BoxGeometry,
  CanvasTexture,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Path,
  SRGBColorSpace,
  Vector3,
} from 'three';
import { chipColor, type ChipRegion, type Mode } from '../../engine/palette';
import { t, type Locale } from '../../i18n';
import { isLocale } from '../../app/locale';
import { CHIP_LAYOUT, CHIP_MARK, REGION_LABEL, chipState, rampOn, type ChipBlock } from '../chip/layout';
import type { SceneProps } from '../SceneSlot';

/**
 * Chapter 04: the AN·1 chip, an original CPU + GPU system-on-chip seen at a slight
 * angle, lighting up region by region with scroll (state from chipState()). The chip
 * sits over the chapter's `[data-chip-frame]` box, measured every frame, so CSS owns
 * the layout. In light mode it stays a dark product-shot object: no halo, no bloom.
 *
 * Chip units: package 1.18 × 1 (the mockup's S = 1), centred on the origin, y up,
 * top surface at z = 0. Die-local 0–1 layout coordinates have y down.
 */

/**
 * Region colours: the chip is a dark object in both page modes, so its blocks always
 * use the dark-mode region colours (the light-mode variants are tuned for paper and
 * read as murky, over-saturated blocks on the near-black die).
 */
const CHIP_MODE: Mode = 'dark';

// geometry (chip units)
const PW = 1.18;
const PH = 1;
const PKG_T = 0.07; // package thickness
const D = 0.86; // die size
const DIE_X0 = -PW / 2 + 0.05;
const DIE_Y0 = PH / 2 - 0.07; // die top edge (y up)
const DIE_T = 0.022;
const BLOCK_T = 0.018;
const Z_DIE = DIE_T;
const Z_BLOCK_TOP = Z_DIE + BLOCK_T;
const MEM_X0 = DIE_X0 + D + 0.06;
const MEM_W = PW / 2 - 0.045 - MEM_X0;
const MEM_H = D * 0.47;
const MEM_GAP = D * 0.06;
const PIN_LEN = 0.15;
const PINS_PER_SIDE = 7;
const BUS_PER_PKG = 5;

// framing: the tilted chip's extent incl. pins, in chip units
const EXTENT_W = PW + 2 * PIN_LEN + 0.08;
const EXTENT_H = (PH + 2 * PIN_LEN) * Math.cos(0.5) + 0.12;
const TILT_X = -0.5;
const TILT_Y = -0.16;
const TILT_Z = 0.035;

const MONO = "500 64px 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";
const SANS = "600 96px 'Inter Tight', 'Segoe UI', Roboto, sans-serif";

/** die-local (0–1, y down) → chip units (centre of the rect), y up */
const dieX = (x: number) => DIE_X0 + x * D;
const dieY = (y: number) => DIE_Y0 - y * D;

const OFF_BLOCK = new Color('#141a26');
const FLASH = new Color('#ffdc96');
const PIN_DIM = new Color('#3a4352');
const PIN_ON = new Color('#ffbe5a');
const LABEL_DIM = new Color('#7d8a9c');
const LABEL_ON = new Color('#ffe1a5');
const RIM_DIM = new Color('#2a3140');
const RIM_ON = new Color('#c99448');

function readLocale(): Locale {
  const l = typeof document !== 'undefined' ? document.documentElement.lang : 'en';
  return isLocale(l) ? l : 'en';
}

/** A text label as a canvas texture; white text on a dark backing, tinted by material colour. */
function labelTexture(text: string, font: string, backing: boolean): { tex: CanvasTexture; aspect: number; draw: () => void } {
  const c = document.createElement('canvas');
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  const out = { tex, aspect: 1, draw: () => {} };
  out.draw = () => {
    const x = c.getContext('2d');
    if (!x) return;
    x.font = font;
    const px = parseInt(/(\d+)px/.exec(font)?.[1] ?? '64', 10);
    const padX = backing ? px * 0.4 : 0;
    const w = Math.ceil(x.measureText(text).width + padX * 2);
    const h = Math.ceil(px * 1.5);
    c.width = w;
    c.height = h;
    x.font = font;
    if (backing) {
      x.fillStyle = 'rgba(8,10,16,0.9)';
      x.fillRect(0, 0, w, h);
    }
    x.fillStyle = '#ffffff';
    x.textBaseline = 'middle';
    x.fillText(text, padX, h * 0.53);
    out.aspect = w / h;
    tex.needsUpdate = true;
  };
  out.draw();
  return out;
}

/** Etched detail on top of the blocks (drawn once): core stripes, GPU cells, cache rows, I/O pads. */
function detailTexture(): CanvasTexture {
  const N = 1024;
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  if (x) {
    for (const b of CHIP_LAYOUT) {
      const X = b.x * N;
      const Y = b.y * N;
      const W = b.w * N;
      const H = b.h * N;
      x.strokeStyle = 'rgba(190,205,225,0.16)';
      x.lineWidth = 2;
      x.strokeRect(X + 1, Y + 1, W - 2, H - 2);
      x.fillStyle = 'rgba(6,5,10,0.42)';
      if (b.detail === 'core') {
        for (let r = 0; r < 4; r++) x.fillRect(X + W * 0.12, Y + H * (0.18 + r * 0.18), W * (0.3 + ((r * 3) % 4) * 0.12), H * 0.07);
        x.fillRect(X + W * 0.62, Y + H * 0.18, W * 0.24, H * 0.62);
      } else if (b.detail === 'gpu') {
        for (let r = 0; r < 3; r++)
          for (let q = 0; q < 3; q++) x.fillRect(X + W * (0.14 + q * 0.26), Y + H * (0.14 + r * 0.26), W * 0.18, H * 0.18);
      } else if (b.detail === 'cache') {
        for (let q = 0; q < 24; q++) x.fillRect(X + W * (0.03 + q * 0.04), Y + H * 0.22, W * 0.025, H * 0.56);
      } else if (b.detail === 'io') {
        for (let q = 0; q < 10; q++) x.fillRect(X + W * (0.06 + q * 0.09), Y + H * 0.55, W * 0.05, H * 0.25);
      } else if (b.detail === 'npu') {
        x.fillRect(X + W * 0.25, Y + H * 0.2, W * 0.5, H * 0.6);
      } else {
        x.fillRect(X + W * 0.15, Y + H * 0.3, W * 0.7, H * 0.4);
      }
    }
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Memory package top: DRAM rows (white, tinted by material colour). */
function memoryTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 384;
  const x = c.getContext('2d');
  if (x) {
    x.fillStyle = '#ffffff';
    for (let r = 0; r < 6; r++) x.fillRect(128 * 0.18, 384 * (0.12 + r * 0.13), 128 * 0.64, 384 * 0.05);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Soft radial disc (white centre → transparent), for the dark-mode glow and the light-mode shadow. */
function discTexture(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  if (x) {
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
  }
  return new CanvasTexture(c);
}

function sheenMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    toneMapped: false,
    uniforms: { uPos: { value: -1 }, uAmt: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uPos;
      uniform float uAmt;
      varying vec2 vUv;
      void main() {
        float d = (vUv.x + (1.0 - vUv.y) * 0.5) / 1.5 - uPos;
        float band = exp(-d * d / 0.006);
        gl_FragColor = vec4(vec3(1.0, 0.94, 0.78) * band * 0.2 * uAmt, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

type Label = { mesh: Mesh; mat: MeshBasicMaterial; region: ChipRegion; redraw: () => void; height: number; tex: CanvasTexture };

export default function ChipScene({ env, progress }: SceneProps) {
  const lite = env.capability === 'lite';
  // Reduced motion normally means capability 'static' (no scene at all); if the scene ever
  // runs with it, freeze time: no sway, no travelling pulses, no sheen sweep.
  const still = env.reducedMotion;
  const dark = env.mode === 'dark';
  const camera = useThree((s) => s.camera) as PerspectiveCamera;

  const root = useRef<Group>(null);
  const tops = useRef<InstancedMesh>(null);
  const pins = useRef<InstancedMesh>(null);
  const pinPulses = useRef<InstancedMesh>(null);
  const pinMat = useRef<MeshBasicMaterial>(null);
  const busPulses = useRef<InstancedMesh>(null);
  const memTop = useRef<MeshBasicMaterial[]>([]);
  const memRows = useRef<MeshBasicMaterial[]>([]);
  const busLines = useRef<MeshBasicMaterial>(null);
  const rim = useRef<MeshBasicMaterial>(null);
  const glow = useRef<MeshBasicMaterial>(null);
  const time = useRef(0);
  const els = useRef<{ slot: Element | null; frame: Element | null }>({ slot: null, frame: null });

  const res = useMemo(() => {
    const locale = readLocale();
    const regionColor = {} as Record<ChipRegion, Color>;
    for (const r of Object.keys(REGION_LABEL) as ChipRegion[]) regionColor[r] = new Color(chipColor(r, CHIP_MODE));

    const heads = CHIP_LAYOUT.filter((b) => b.head);
    const labels: Label[] = [...heads.map((b) => ({ b, region: b.region })), { b: null as ChipBlock | null, region: 'mem' as ChipRegion }].map(
      ({ b, region }) => {
        const lt = labelTexture(t(locale, REGION_LABEL[region]), MONO, true);
        const mat = new MeshBasicMaterial({ map: lt.tex, transparent: true, depthWrite: false, toneMapped: false, color: LABEL_DIM.clone() });
        const height = 0.032;
        const mesh = new Mesh(new PlaneGeometry(1, 1), mat);
        const place = () => {
          const w = height * lt.aspect;
          mesh.scale.set(w, height, 1);
          if (b) mesh.position.set(dieX(b.x) + 0.006 + w / 2, dieY(b.y) - 0.006 - height / 2, Z_BLOCK_TOP + 0.004);
          // memory label: bottom-right of the package, under the memory packages
          else mesh.position.set(PW / 2 - 0.045 - w / 2, -PH / 2 + 0.035, 0.003);
        };
        place();
        return {
          mesh,
          mat,
          region,
          height,
          tex: lt.tex,
          redraw: () => {
            lt.draw();
            place();
          },
        };
      },
    );

    const markTex = labelTexture(CHIP_MARK, SANS, false);
    const markMat = new MeshBasicMaterial({ map: markTex.tex, transparent: true, depthWrite: false, toneMapped: false, color: new Color('#ffd78c') });
    const markMesh = new Mesh(new PlaneGeometry(1, 1), markMat);
    const placeMark = () => {
      const h = 0.05;
      markMesh.scale.set(h * markTex.aspect, h, 1);
      markMesh.position.set(-PW / 2 + 0.05 + (h * markTex.aspect) / 2, -PH / 2 + 0.035, 0.003);
    };
    placeMark();

    return {
      regionColor,
      labels,
      markMesh,
      markMat,
      redrawMark: () => {
        markTex.draw();
        placeMark();
      },
      textures: [markTex.tex, ...labels.map((l) => l.tex)],
      detail: detailTexture(),
      memTex: memoryTexture(),
      disc: discTexture(),
      sheen: sheenMaterial(),
      unit: new BoxGeometry(1, 1, 1),
      rim: rimGeometry(PW - 0.01, PH - 0.01, 0.026, 0.005),
    };
  }, []);

  // Redraw text once the web fonts are in (canvas text does not re-render by itself).
  useEffect(() => {
    let cancelled = false;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts) return;
    Promise.all([fonts.load(MONO), fonts.load(SANS)])
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        res.labels.forEach((l) => l.redraw());
        res.redrawMark();
      });
    return () => {
      cancelled = true;
    };
  }, [res]);

  useEffect(
    () => () => {
      res.textures.forEach((x) => x.dispose());
      res.labels.forEach((l) => {
        l.mat.dispose();
        l.mesh.geometry.dispose();
      });
      res.markMat.dispose();
      res.markMesh.geometry.dispose();
      res.detail.dispose();
      res.memTex.dispose();
      res.disc.dispose();
      res.sheen.dispose();
      res.unit.dispose();
      res.rim.dispose();
    },
    [res],
  );

  // static instance layout: block bodies/tops, pins
  useLayoutEffect(() => {
    const o = new Object3D();
    const top = tops.current;
    if (top) {
      CHIP_LAYOUT.forEach((b, i) => {
        o.position.set(dieX(b.x + b.w / 2), dieY(b.y + b.h / 2), Z_BLOCK_TOP + 0.0005);
        o.scale.set(b.w * D * 0.97, b.h * D * 0.97, 1);
        o.updateMatrix();
        top.setMatrixAt(i, o.matrix);
        top.setColorAt(i, OFF_BLOCK);
      });
      top.instanceMatrix.needsUpdate = true;
      if (top.instanceColor) top.instanceColor.needsUpdate = true;
    }
    const pm = pins.current;
    if (pm) {
      pinTransforms().forEach((m, i) => pm.setMatrixAt(i, m));
      pm.instanceMatrix.needsUpdate = true;
    }
  }, [lite]);

  const blockBodies = useMemo(() => {
    const m = new Matrix4();
    return CHIP_LAYOUT.map((b) =>
      m.clone().compose(
        new Vector3(dieX(b.x + b.w / 2), dieY(b.y + b.h / 2), Z_DIE + BLOCK_T / 2),
        new Object3D().quaternion,
        new Vector3(b.w * D, b.h * D, BLOCK_T),
      ),
    );
  }, []);
  const bodies = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const bm = bodies.current;
    if (!bm) return;
    blockBodies.forEach((m, i) => bm.setMatrixAt(i, m));
    bm.instanceMatrix.needsUpdate = true;
  }, [blockBodies]);

  const tmp = useMemo(() => new Color(), []);
  const tmp2 = useMemo(() => new Color(), []);
  const o3 = useMemo(() => new Object3D(), []);

  useFrame((_, delta) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(delta, 0.1);
    if (!still) time.current += dt;
    const tt = time.current;

    // ── placement over [data-chip-frame] ──
    let { slot, frame } = els.current;
    if (!slot || !slot.isConnected) slot = els.current.slot = document.querySelector('[data-scene="infra"]');
    if (!frame || !frame.isConnected) frame = els.current.frame = document.querySelector('[data-chip-frame]');
    if (!slot || !frame) {
      g.visible = false;
      return;
    }
    const sr = slot.getBoundingClientRect();
    const fr = frame.getBoundingClientRect();
    if (sr.width < 1 || sr.height < 1 || fr.width < 1 || fr.height < 1) {
      g.visible = false;
      return;
    }
    const hW = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    const wW = hW * (sr.width / sr.height);
    const cx = (fr.left + fr.width / 2 - sr.left) / sr.width - 0.5;
    const cy = (fr.top + fr.height / 2 - sr.top) / sr.height - 0.5;
    const s = Math.min(((fr.width / sr.width) * wW) / EXTENT_W, ((fr.height / sr.height) * hW) / EXTENT_H);
    g.visible = true;
    g.position.set(cx * wW, -cy * hW, 0);
    g.scale.setScalar(s);
    g.rotation.set(TILT_X + Math.sin(tt * 0.21) * 0.012, TILT_Y + Math.sin(tt * 0.17) * 0.02, TILT_Z);

    // labels stay at least ~9 css px tall on small chips
    const pxPerUnit = (s / hW) * sr.height;
    const boost = Math.min(1.6, Math.max(1, 9 / (0.032 * pxPerUnit)));

    // ── state ──
    const st = chipState(progress.current);

    const top = tops.current;
    if (top) {
      CHIP_LAYOUT.forEach((b, i) => {
        const l = rampOn(progress.current, b.start);
        const pulse = l >= 1 ? 0.88 + 0.12 * Math.sin(tt * 2.2 + b.x * 9 + b.y * 7) : 1;
        tmp.copy(res.regionColor[b.region]).multiplyScalar((dark ? 0.95 : 0.85) * pulse);
        tmp2.copy(OFF_BLOCK).lerp(tmp, l);
        if (l > 0 && l < 1) tmp2.add(tmp.copy(FLASH).multiplyScalar(l * (1 - l) * 2.4));
        top.setColorAt(i, tmp2);
      });
      if (top.instanceColor) top.instanceColor.needsUpdate = true;
    }

    for (const lb of res.labels) {
      const on = st.lit[lb.region] > 0 ? Math.min(1, st.lit[lb.region] * 3) : 0;
      lb.mat.color.copy(LABEL_DIM).lerp(LABEL_ON, on);
      lb.mat.opacity = 0.75 + 0.25 * on;
      if (lb.mesh.userData.boost !== boost) {
        lb.mesh.userData.boost = boost;
        const base = lb.mesh.userData.base ?? (lb.mesh.userData.base = lb.mesh.scale.clone());
        lb.mesh.scale.set(base.x * boost, base.y * boost, 1);
        // keep the label anchored at its top-left (die) or bottom-right (memory) corner
        const anchor = lb.mesh.userData.anchor ?? (lb.mesh.userData.anchor = lb.mesh.position.clone());
        const dx = ((boost - 1) * base.x) / 2;
        const dy = ((boost - 1) * base.y) / 2;
        if (lb.region === 'mem') lb.mesh.position.set(anchor.x - dx, anchor.y + dy, anchor.z);
        else lb.mesh.position.set(anchor.x + dx, anchor.y - dy, anchor.z);
      }
    }

    // power: rim and pins
    if (rim.current) rim.current.color.copy(RIM_DIM).lerp(RIM_ON, st.power);
    if (pinMat.current) pinMat.current.color.copy(PIN_DIM).lerp(PIN_ON, st.power * 0.8);
    const pp = pinPulses.current;
    if (pp) {
      pp.visible = st.power > 0 && !still;
      const trs = pinTracks();
      trs.forEach((tr, k) => {
        const f = (tt * 0.6 + k * 0.13) % 1;
        o3.position.set(tr.x1 + (tr.x0 - tr.x1) * f, tr.y1 + (tr.y0 - tr.y1) * f, 0.004);
        o3.scale.setScalar(0.018 * st.power);
        o3.updateMatrix();
        pp.setMatrixAt(k, o3.matrix);
      });
      pp.instanceMatrix.needsUpdate = true;
    }

    // memory packages and bus
    const mc = res.regionColor.mem;
    memTop.current.forEach((m) => m && m.color.set('#0e121a').lerp(tmp.copy(mc).multiplyScalar(0.28), st.memory));
    memRows.current.forEach((m) => {
      if (!m) return;
      m.color.set('#262d3a').lerp(tmp.copy(mc).multiplyScalar(0.9), st.memory);
    });
    if (busLines.current) busLines.current.color.copy(RIM_DIM).lerp(tmp.set('#ffc86e').multiplyScalar(0.55), st.memory);
    const bp = busPulses.current;
    if (bp) {
      bp.visible = st.memory > 0 && !still;
      let k = 0;
      for (let pkg = 0; pkg < 2; pkg++)
        for (let b = 0; b < BUS_PER_PKG; b++, k++) {
          const f = (tt * 1.4 + b * 0.21 + pkg * 0.5) % 1;
          const y = busY(pkg, b);
          o3.position.set(DIE_X0 + D + (MEM_X0 - DIE_X0 - D) * f, y, 0.006);
          o3.scale.setScalar(0.016 * st.memory);
          o3.updateMatrix();
          bp.setMatrixAt(k, o3.matrix);
        }
      bp.instanceMatrix.needsUpdate = true;
    }

    // mark, sheen, full-power glow
    res.markMat.opacity = 0.3 + 0.6 * st.sheen;
    res.sheen.uniforms.uAmt.value = st.sheen;
    res.sheen.uniforms.uPos.value = -0.4 + ((tt * 0.25) % 1) * 1.8;
    if (glow.current) glow.current.opacity = 0.09 * st.sheen;
  });

  const nBlocks = CHIP_LAYOUT.length;
  const nPins = pinTracks().length;
  const darkMetal = '#0c1017';

  return (
    <group ref={root} visible={false}>
      <ambientLight intensity={dark ? 0.7 : 0.9} />
      <directionalLight position={[-2.5, 3, 4]} intensity={dark ? 1.6 : 2} />
      <directionalLight position={[3, -1, 2]} intensity={0.5} color="#ffd9a0" />

      {/* full-power warm glow behind the chip (dark only: light mode has no halos) */}
      {dark && !lite && (
        <mesh position={[0, 0, -0.2]} scale={[2.1, 1.9, 1]}>
          <planeGeometry />
          <meshBasicMaterial ref={glow} map={res.disc} color="#ffaa32" transparent opacity={0} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      )}
      {/* light mode: a soft contact shadow under the product */}
      {!dark && (
        <mesh position={[0.03, -0.05, -PKG_T - 0.03]} scale={[PW * 1.5, PH * 1.5, 1]}>
          <planeGeometry />
          <meshBasicMaterial map={res.disc} color="#3a2a10" transparent opacity={0.22} depthWrite={false} blending={NormalBlending} toneMapped={false} />
        </mesh>
      )}

      {/* package (substrate) */}
      <RoundedBox args={[PW, PH, PKG_T]} radius={0.03} smoothness={3} position={[0, 0, -PKG_T / 2]}>
        <meshStandardMaterial color={darkMetal} roughness={0.55} metalness={0.35} />
      </RoundedBox>
      {/* rim line on the package top */}
      <mesh position={[0, 0, 0.0008]} geometry={res.rim}>
        <meshBasicMaterial ref={rim} color={RIM_DIM} toneMapped={false} />
      </mesh>

      {/* die */}
      <RoundedBox args={[D, D, DIE_T]} radius={0.008} smoothness={2} position={[DIE_X0 + D / 2, DIE_Y0 - D / 2, DIE_T / 2]}>
        <meshStandardMaterial color="#0f141d" roughness={0.35} metalness={0.5} />
      </RoundedBox>

      {/* block bodies (extruded) and their glowing tops */}
      <instancedMesh ref={bodies} args={[res.unit, undefined, nBlocks]}>
        <meshStandardMaterial color="#121823" roughness={0.5} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={tops} args={[undefined, undefined, nBlocks]}>
        <planeGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* etched block detail */}
      <mesh position={[DIE_X0 + D / 2, DIE_Y0 - D / 2, Z_BLOCK_TOP + 0.002]} scale={[D, D, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={res.detail} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* sheen sweep across the die */}
      <mesh position={[DIE_X0 + D / 2, DIE_Y0 - D / 2, Z_BLOCK_TOP + 0.003]} scale={[D, D, 1]} material={res.sheen}>
        <planeGeometry />
      </mesh>

      {/* region labels and the AN·1 mark */}
      {res.labels.map((l) => (
        <primitive key={l.region} object={l.mesh} />
      ))}
      <primitive object={res.markMesh} />

      {/* unified memory packages */}
      {[0, 1].map((k) => {
        const y = DIE_Y0 - k * (MEM_H + MEM_GAP) - MEM_H / 2;
        return (
          <group key={k} position={[MEM_X0 + MEM_W / 2, y, 0]}>
            <RoundedBox args={[MEM_W, MEM_H, 0.03]} radius={0.006} smoothness={2} position={[0, 0, 0.015]}>
              <meshStandardMaterial color="#0e121a" roughness={0.4} metalness={0.45} />
            </RoundedBox>
            <mesh position={[0, 0, 0.0305]} scale={[MEM_W * 0.94, MEM_H * 0.96, 1]}>
              <planeGeometry />
              <meshBasicMaterial ref={(m) => void (memTop.current[k] = m!)} color="#0e121a" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0.031]} scale={[MEM_W, MEM_H, 1]}>
              <planeGeometry />
              <meshBasicMaterial ref={(m) => void (memRows.current[k] = m!)} map={res.memTex} transparent depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* bus lines die → memory, with travelling pulses */}
      <BusLines matRef={busLines} />
      <instancedMesh ref={busPulses} args={[undefined, undefined, 2 * BUS_PER_PKG]} visible={false}>
        <circleGeometry args={[0.5, 12]} />
        <meshBasicMaterial color="#fff0c8" toneMapped={false} />
      </instancedMesh>

      {/* pins / power traces, with pulses running in */}
      <instancedMesh ref={pins} args={[res.unit, undefined, nPins]}>
        <meshBasicMaterial ref={pinMat} color={PIN_DIM} toneMapped={false} />
      </instancedMesh>
      {!lite && (
        <instancedMesh ref={pinPulses} args={[undefined, undefined, nPins]} visible={false}>
          <circleGeometry args={[0.5, 12]} />
          <meshBasicMaterial color="#ffe6a0" toneMapped={false} />
        </instancedMesh>
      )}
    </group>
  );
}

/** y of bus line b of memory package pkg (chip units) */
function busY(pkg: number, b: number) {
  const top = DIE_Y0 - pkg * (MEM_H + MEM_GAP);
  return top - MEM_H * (0.15 + b * 0.17);
}

function BusLines({ matRef }: { matRef: { current: MeshBasicMaterial | null } }) {
  const x0 = DIE_X0 + D;
  const len = MEM_X0 - x0;
  return (
    <group>
      {[0, 1].flatMap((pkg) =>
        Array.from({ length: BUS_PER_PKG }, (_, b) => (
          <mesh key={`${pkg}-${b}`} position={[x0 + len / 2, busY(pkg, b), 0.003]} scale={[len, 0.004, 1]}>
            <planeGeometry />
            <meshBasicMaterial ref={pkg === 0 && b === 0 ? (m) => void (matRef.current = m) : undefined} color={RIM_DIM} toneMapped={false} />
          </mesh>
        )),
      )}
    </group>
  );
}

/** Pin tracks: from the outer end (x1, y1) to the package edge (x0, y0), seven per side. */
type Track = { x0: number; y0: number; x1: number; y1: number };
let TRACKS: Track[] | null = null;
function pinTracks(): Track[] {
  if (TRACKS) return TRACKS;
  const out: Track[] = [];
  for (let side = 0; side < 4; side++)
    for (let i = 0; i < PINS_PER_SIDE; i++) {
      const u = (i + 0.5) / PINS_PER_SIDE;
      if (side === 0) out.push({ x0: -PW / 2 + u * PW, y0: PH / 2, x1: -PW / 2 + u * PW, y1: PH / 2 + PIN_LEN });
      else if (side === 1) out.push({ x0: -PW / 2 + u * PW, y0: -PH / 2, x1: -PW / 2 + u * PW, y1: -PH / 2 - PIN_LEN });
      else if (side === 2) out.push({ x0: -PW / 2, y0: PH / 2 - u * PH, x1: -PW / 2 - PIN_LEN, y1: PH / 2 - u * PH });
      else out.push({ x0: PW / 2, y0: PH / 2 - u * PH, x1: PW / 2 + PIN_LEN, y1: PH / 2 - u * PH });
    }
  return (TRACKS = out);
}

function pinTransforms(): Matrix4[] {
  const o = new Object3D();
  return pinTracks().map((tr) => {
    const vertical = tr.x0 === tr.x1;
    o.position.set((tr.x0 + tr.x1) / 2, (tr.y0 + tr.y1) / 2, -0.004);
    o.scale.set(vertical ? 0.007 : PIN_LEN, vertical ? PIN_LEN : 0.007, 0.006);
    o.updateMatrix();
    return o.matrix.clone();
  });
}

/** A thin rounded-rectangle outline (the package rim) as a flat geometry. */
function rimGeometry(w: number, h: number, r: number, t: number): ShapeGeometry {
  const rr = (path: Shape | Path, W: number, H: number, R: number) => {
    path.moveTo(-W / 2 + R, -H / 2);
    path.lineTo(W / 2 - R, -H / 2);
    path.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R);
    path.lineTo(W / 2, H / 2 - R);
    path.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2);
    path.lineTo(-W / 2 + R, H / 2);
    path.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R);
    path.lineTo(-W / 2, -H / 2 + R);
    path.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2);
  };
  const shape = new Shape();
  rr(shape, w, h, r);
  const hole = new Path();
  rr(hole, w - 2 * t, h - 2 * t, Math.max(0.001, r - t));
  shape.holes.push(hole);
  return new ShapeGeometry(shape, 6);
}
