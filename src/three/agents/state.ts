import { mulberry32 } from '../../engine/rng';

/**
 * Chapter 03 choreography, as pure maths of the chapter's scroll progress p (0-1).
 *
 * The flow follows the Agentic SDLC framework (spec §5a): SPEC → Gate 1 → PLAN →
 * Gate 2 → BUILD → VERIFY → Gate 3 → SHIP. Agents work in parallel inside BUILD only;
 * every gate opens only when its phase is reached (a human approves; agents never do).
 */

export const PHASES = ['spec', 'plan', 'build', 'verify', 'ship'] as const;
export type Phase = (typeof PHASES)[number];

/** Progress at which plan, build, verify and ship begin. */
export const PHASE_BOUNDS = [0.18, 0.36, 0.6, 0.78] as const;

/** Lines the SPEC.md panel writes (illustrative, not a claim). */
export const SPEC_LINES = 10;
/** The spec finishes writing at this progress, a beat before Gate 1. */
const SPEC_DONE = 0.15;

/** Generic engineering nouns for task tiles. Identical in every locale. */
export const TILE_LABELS = ['api', 'schema', 'ui', 'tests', 'infra', 'docs', 'auth', 'logs', 'perf', 'security'] as const;
export type TileLabel = (typeof TILE_LABELS)[number];

/** Every text label drawn inside the 3D scene. */
export const SCENE_LABELS: readonly string[] = ['SPEC.md', ...TILE_LABELS];

/** Share of tiles that fail red once and are retried. */
export const FAIL_SHARE = 0.14;

export interface AgentsState {
  phase: Phase;
  /** Gate 1 (spec), Gate 2 (plan), Gate 3 (merge): true once approved. */
  gates: [boolean, boolean, boolean];
  /** SPEC.md lines written so far, 0..SPEC_LINES */
  specLines: number;
}

const clamp01 = (v: number) => (Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0);

export function phaseIndex(p: number): number {
  const q = clamp01(p);
  let i = 0;
  while (i < PHASE_BOUNDS.length && q >= PHASE_BOUNDS[i]) i++;
  return i;
}

export function agentsState(p: number): AgentsState {
  const q = clamp01(p);
  const i = phaseIndex(q);
  return {
    phase: PHASES[i],
    gates: [i >= 1, i >= 2, i >= 4],
    specLines: Math.min(SPEC_LINES, Math.floor((q / SPEC_DONE) * SPEC_LINES + 1e-9)),
  };
}

/** 0-1 progress inside each phase (0 before it starts, 1 after it ends). */
export function agentsTimeline(p: number): Record<Phase, number> {
  const q = clamp01(p);
  const [b1, b2, b3, b4] = PHASE_BOUNDS;
  return {
    spec: clamp01(q / SPEC_DONE),
    plan: clamp01((q - b1) / (b2 - b1)),
    build: clamp01((q - b2) / (b3 - b2)),
    verify: clamp01((q - b3) / (b4 - b3)),
    ship: clamp01((q - b4) / (0.96 - b4)),
  };
}

export interface Tile {
  index: number;
  label: TileLabel;
  /** 0-1: when this tile's agent starts within BUILD, and its stagger elsewhere */
  start: number;
  /** fails red once, then retries */
  fails: boolean;
}

/** Deterministic task tiles: labels from TILE_LABELS; ~14 % (at least one) fail once. */
export function makeTiles(count: number, seed: number): Tile[] {
  const rng = mulberry32(seed);
  const tiles: Tile[] = Array.from({ length: count }, (_, index) => ({
    index,
    label: TILE_LABELS[Math.floor(rng() * TILE_LABELS.length)],
    start: rng(),
    fails: false,
  }));
  const failing = Math.max(1, Math.round(count * FAIL_SHARE));
  const order = tiles.map((t) => t.index).sort((a, b) => tiles[a].start - tiles[b].start);
  // Spread the failures across the start order so retries keep happening through BUILD.
  for (let k = 0; k < failing && count > 0; k++) tiles[order[Math.floor(((k + 0.5) * count) / failing)]].fails = true;
  return tiles;
}

export interface TileState {
  /** 0-1 progress of the current attempt */
  progress: number;
  /** red: the first attempt failed and is about to be retried */
  failed: boolean;
  /** on the second attempt */
  retrying: boolean;
  done: boolean;
}

const START_SPREAD = 0.5;
const DURATION = 0.45;

/** One tile's state at BUILD sub-progress `build` (0-1). */
export function tileState(tile: Tile, build: number): TileState {
  const u = clamp01((clamp01(build) - tile.start * START_SPREAD) / DURATION);
  if (!tile.fails) return { progress: u, failed: false, retrying: false, done: u >= 1 };
  if (u < 0.4) return { progress: (u / 0.4) * 0.6, failed: false, retrying: false, done: false };
  if (u < 0.55) return { progress: 0.6, failed: true, retrying: false, done: false };
  const r = u >= 1 ? 1 : clamp01((u - 0.55) / 0.45);
  return { progress: r, failed: false, retrying: r < 1, done: r >= 1 };
}
