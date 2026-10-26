import { RINGS, triacontahedron } from './geometry';

export interface RingState {
  visibleFrac: number;
  radiusScale: number;
  opacity: number;
  gapScale: number;
  rot: number;
  squash: number;
}

export interface EngineState {
  rings: RingState[];
  heartEdgeFrac: number[];
  heartOpacity: number;
  shardProgress: number;
  signalsAllowed: boolean;
}

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = (u: number) => 1 - Math.pow(1 - u, 3);
const EDGE_COUNT = triacontahedron().edges.length;

/** Pure build / burst / unwind rules, ported from the mockup's engine(). */
export function engineState(input: { t: number; build: number; burst: number; unwind: number }): EngineState {
  const { t, build, burst, unwind } = input;

  const rings = RINGS.map((A, i): RingState => {
    // Mockup: clamp(build*1.7-.45-i*.12), which tops out at 0.89 for ring 3 at build=1.
    // Normalised by its own max so every ring is exactly complete at build=1 (same start point).
    const lead = 0.45 + i * 0.12;
    const bi = ease(clamp((build * 1.7 - lead) / (1.7 - lead)));
    const fi = clamp(burst * (1.2 + i * 0.15));
    const dir = i % 2 ? 1 : -1;
    return {
      visibleFrac: bi,
      radiusScale: (0.7 + 0.3 * bi) * (1 + fi * (1.4 + i * 0.5)) * (1 + unwind * (0.5 + i * 0.12)),
      opacity: bi <= 0 ? 0 : 1 - fi,
      gapScale: 1 + fi * 6,
      rot: A.rot0 + t * A.spin + (1 - bi) * 1.6 * dir + fi * dir * 1.2,
      squash: Math.max(0.08, Math.abs(Math.cos(t * A.tumble + A.phase))) * (1 - unwind) + 0.04 * unwind,
    };
  });

  const tb = clamp(build * 1.8);
  // Mockup uses tb*1.6, which leaves the last edges unfinished at build=1; 2 completes all edges.
  const heartEdgeFrac = Array.from({ length: EDGE_COUNT }, (_, k) => clamp(tb * 2 - k / EDGE_COUNT));

  return {
    rings,
    heartEdgeFrac,
    heartOpacity: tb > 0 ? 1 - clamp(burst * 1.1) : 0,
    shardProgress: burst > 0 ? ease(burst) : 0,
    signalsAllowed: build >= 1 && burst < 0.2 && unwind < 0.7,
  };
}
