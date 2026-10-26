import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type GroupProps } from '@react-three/fiber';
import { Group } from 'three';
import { engineState } from '../../engine/state';
import { mulberry32 } from '../../engine/rng';
import { BREATH_AMP, breathTable } from '../../engine/breath';
import { engineGlow } from '../../engine/glow';
import type { Mode } from '../../engine/palette';
import { createSharedUniforms } from './materials';
import { EngineContext, type EngineCtx, type EngineFrame, type EngineStats, type Updater } from './frame';
import { HEART_VERTEX_COUNT, Heart, projectHeart } from './Heart';
import { Rings } from './Rings';
import { Signals } from './Signals';
import { Shards } from './Shards';

export type { EngineStats } from './frame';

export interface EngineProgress {
  build: number;
  burst: number;
  unwind: number;
}

/** A value, or a ref whose `.current` is read every frame (so scroll can drive it without re-renders). */
export type Live<T> = T | { current: T };

export interface EngineProps extends Omit<GroupProps, 'children'> {
  progress: Live<EngineProgress>;
  dim?: Live<number>;
  signals?: boolean;
  mode?: Mode;
  /** ±3° tilt toward the cursor, fine pointers only */
  parallax?: boolean;
  /** extra speed factor for engine time (e.g. the chapter 03 orchestrator) */
  timeScale?: Live<number>;
  /** seed for the engine's random choices (shard/edge directions, bolts); random if omitted */
  seed?: number;
  /**
   * Glow boost (default 1, clamped to [GLOW_MIN, GLOW_MAX]). Scales the heart's core
   * bloom (both modes) and, in dark mode, the outer halo and the edge/ring alpha that
   * feeds the bloom. The hero passes HERO_GLOW (owner request).
   */
  glow?: number;
  /** receives live signal statistics (tests, debugging) */
  statsRef?: { current: EngineStats | null };
}

const read = <T,>(v: Live<T>): T =>
  typeof v === 'object' && v !== null && 'current' in (v as object) ? (v as { current: T }).current : (v as T);

const TILT = (3 * Math.PI) / 180;

/**
 * The Golden Engine: armillary rings, triacontahedron heart, electric signals
 * and burst shards. All motion is computed in one useFrame from refs; React
 * renders only when mode/seed change. Units: outer ring radius = 1.
 */
export function Engine({
  progress,
  dim = 1,
  signals = true,
  mode = 'dark',
  parallax = false,
  timeScale = 1,
  seed,
  glow = 1,
  statsRef,
  ...group
}: EngineProps) {
  const live = useRef({ progress, dim, signals, timeScale, glow });
  live.current = { progress, dim, signals, timeScale, glow };

  const baseSeed = useMemo(() => seed ?? Math.floor(Math.random() * 2 ** 32), [seed]);
  const rng = useMemo(() => mulberry32(baseSeed), [baseSeed]);
  // per-vertex breathing waves; derived from the seed without consuming `rng`
  const breath = useMemo(() => breathTable(baseSeed, HEART_VERTEX_COUNT), [baseSeed]);
  const stats = useMemo<EngineStats>(() => ({ liveBolts: 0, spawned: 0, bursts: 0, maxLivePerBurst: 0 }), []);
  if (statsRef) statsRef.current = stats;

  const frame = useMemo<EngineFrame>(() => {
    const p = read(progress);
    return {
      t: 0,
      wall: 0,
      breathT: 0,
      clockMs: 0,
      build: p.build,
      burst: p.burst,
      unwind: p.unwind,
      state: engineState({ t: 0, ...p }),
      heartPos: new Float32Array(HEART_VERTEX_COUNT * 3),
      heartZ: new Float32Array(HEART_VERTEX_COUNT),
      rings: [],
      signals,
      hidden: false,
      glow: engineGlow(glow),
    };
    // created once and mutated in place every frame
  }, []);

  const updaters = useMemo<{ order: number; fn: Updater }[]>(() => [], []);
  const shared = useMemo(() => createSharedUniforms(mode), [mode]);

  const ctx = useMemo<EngineCtx>(
    () => ({
      mode,
      shared,
      frame,
      stats,
      rng,
      register(order, fn) {
        const entry = { order, fn };
        updaters.push(entry);
        updaters.sort((a, b) => a.order - b.order);
        return () => {
          const i = updaters.indexOf(entry);
          if (i >= 0) updaters.splice(i, 1);
        };
      },
    }),
    [mode, shared, frame, stats, rng, updaters],
  );

  const tilt = useMemo(() => new Group(), []);
  const pointer = useRef({ x: 0, y: 0, on: false });

  useEffect(() => {
    if (!parallax || typeof window === 'undefined' || !window.matchMedia?.('(pointer: fine)').matches) {
      pointer.current.on = false;
      return;
    }
    pointer.current.on = true;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [parallax]);

  useFrame((_, delta) => {
    const dt = Math.min(Math.max(delta, 0), 0.1);
    const L = live.current;
    const p = read(L.progress);
    const f = frame;
    f.build = p.build;
    f.burst = p.burst;
    f.unwind = p.unwind;
    f.signals = L.signals;
    f.glow = engineGlow(L.glow);
    f.hidden = typeof document !== 'undefined' && document.hidden;
    f.wall += dt;
    f.t += dt * read(L.timeScale) * (1 + p.burst * 2);
    if (!f.hidden) f.clockMs += dt * 1000;
    f.state = engineState({ t: f.t, build: p.build, burst: p.burst, unwind: p.unwind });
    // breathing: own clock from the clamped delta (pauses with the frameloop); frozen
    // with signals off (reduced motion) and faded out as the burst detaches the edges
    f.breathT += dt;
    const breathAmp = L.signals ? BREATH_AMP * Math.max(0, 1 - p.burst * 2) : 0;
    projectHeart(f.t, p.unwind, f.heartPos, f.heartZ, breath, f.breathT, breathAmp);

    shared.uTintAngle.value = f.wall * 0.15;
    const dim = read(L.dim);
    shared.uDim.value = dim;
    tilt.visible = dim > 0;

    const pt = pointer.current;
    const k = 1 - Math.exp(-dt * 4);
    const calm = 1 - p.burst;
    const tx = pt.on ? pt.y * 2 * TILT * calm : 0;
    const ty = pt.on ? pt.x * 2 * TILT * calm : 0;
    tilt.rotation.x += (tx - tilt.rotation.x) * k;
    tilt.rotation.y += (ty - tilt.rotation.y) * k;

    for (let i = 0; i < updaters.length; i++) updaters[i].fn(f);
  });

  return (
    <group {...group}>
      <primitive object={tilt}>
        <EngineContext.Provider value={ctx}>
          <Heart />
          <Rings />
          <Signals />
          <Shards />
        </EngineContext.Provider>
      </primitive>
    </group>
  );
}
